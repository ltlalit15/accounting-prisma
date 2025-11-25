import prisma from "../config/db.js";

// Utility: Get total of a subgroup
async function getBalance(company_id, subgroup_name) {
  const group = await prisma.parent_accounts.findFirst({
    where: {
      company_id,
      subgroup_name: subgroup_name
    },
    include: {
      accounts: true,
    }
  });

  if (!group || !group.accounts.length) return 0;

  return group.accounts.reduce(
    (sum, acc) => sum + Number(acc.accountBalance || 0),
    0
  );
}

export const getBalanceSheet = async (req, res) => {
  try {
    const company_id = Number(req.params.company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required in route"
      });
    }

    // 👇 UPDATED: Using your actual subgroup names from DB
    const cash = await getBalance(company_id, "Cash In Hand");
    const bank = await getBalance(company_id, "Banks account");
    const stock = await getBalance(company_id, "Fixed");     // Your DB has "Fixed"
    const accountsReceivable = await getBalance(company_id, "Total"); 

    const landBuilding = await getBalance(company_id, "car2");
    const plantMachinery = await getBalance(company_id, "test");
    const furnitureFixtures = await getBalance(company_id, "Fixed");

    const accountsPayable = await getBalance(company_id, "aw");
    const shortTermLoans = await getBalance(company_id, "Test");
    const outstandingExpenses = await getBalance(company_id, "flXED");

    const termLoan = await getBalance(company_id, "Tax");
    const mortgageLoan = await getBalance(company_id, "Tax");

    const capital = await getBalance(company_id, "Total");
    const retainedEarnings = await getBalance(company_id, "Tax");

    // Calculations
    const totalCurrentAssets = cash + bank + stock + accountsReceivable;
    const totalFixedAssets = landBuilding + plantMachinery + furnitureFixtures;
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities =
      accountsPayable + shortTermLoans + outstandingExpenses;

    const totalLongTermLiabilities = termLoan + mortgageLoan;

    const totalLiabilities =
      totalCurrentLiabilities + totalLongTermLiabilities;

    const totalOwnerCapital = capital + retainedEarnings;

    const totalLiabilitiesAndCapital =
      totalLiabilities + totalOwnerCapital;

    return res.status(200).json({
      success: true,
      assets: {
        cash,
        bank,
        stock,
        accountsReceivable,
        landBuilding,
        plantMachinery,
        furnitureFixtures,
        totalCurrentAssets,
        totalFixedAssets,
        totalAssets,
      },
      liabilities: {
        accountsPayable,
        shortTermLoans,
        outstandingExpenses,
        termLoan,
        mortgageLoan,
        totalCurrentLiabilities,
        totalLongTermLiabilities,
        totalLiabilities,
      },
      capital: {
        capital,
        retainedEarnings,
        totalOwnerCapital
      },
      totalLiabilitiesAndCapital
    });

  } catch (err) {
    console.error("BALANCE SHEET ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to generate balance sheet",
      error: err.message
    });
  }
};
function resolveCompanyId(req) {
  if (req.user && req.user.company_id) return Number(req.user.company_id);
  if (req.query && req.query.company_id) return Number(req.query.company_id);
  if (req.params && req.params.company_id) return Number(req.params.company_id);
  return null;
}

export const getAssetDetails = async (req, res) => {
  try {
    const company_id = resolveCompanyId(req);
    if (!company_id) {
      return res.status(400).json({
        success: false,
        message:
          "company_id is required (use ?company_id=1) or include in JWT payload",
      });
    }

    // -----------------------------------
    // FETCH TRANSACTIONS
    // -----------------------------------
    const transactions = await prisma.transactions.findMany({
      where: { company_id },
      orderBy: { created_at: "desc" },
      take: 200,
      select: {
        id: true,
        date: true,
        amount: true,
        balance_type: true,
        voucher_type: true,
        voucher_no: true,
        from_type: true,
        from_id: true,
        account_type: true,
        note: true,
        transaction_id: true,
      },
    });

    const cashInflows = [];
    const bankTransactions = [];

    for (const t of transactions) {
      const lowerAccType = (t.account_type || "").toLowerCase();
      const balanceLower = (t.balance_type || "").toLowerCase();
      const voucherLower = (t.voucher_type || "").toLowerCase();

      // ------------------------------------
      // ⭐ CASH LOGIC (OPTION 2)
      // ALWAYS treat Make Payment / Make Receipt as CASH
      // ------------------------------------
      const isCash =
        balanceLower === "make payment" ||
        balanceLower === "make receipt" ||
        lowerAccType.includes("cash") ||
        balanceLower.includes("cash") ||
        voucherLower.includes("cash");

      // ------------------------------------
      // ⭐ BANK LOGIC (OPTION 2)
      // Only REAL banks count as BANK
      // ------------------------------------
      const bankKeywords = [
        "bank",
        "sbi",
        "hdfc",
        "axis",
        "icici",
        "kotak",
      ];

      const isBank =
        bankKeywords.some((kw) => lowerAccType.includes(kw)) ||
        voucherLower.includes("bank");

      const baseItem = {
        amount: t.amount !== null ? String(t.amount) : null,
        date: t.date,
        balance_type: t.balance_type,
        from_id: t.from_id,
        from_type: t.from_type,
        voucher_no: t.voucher_no || t.transaction_id,
        note: t.note,
        account_type: t.account_type,
      };

      // FINAL SORTING
      if (isBank) {
        bankTransactions.push({
          customer:
            baseItem.from_type === "Customer"
              ? baseItem.from_id
              : baseItem.from_type,
          amount: baseItem.amount,
          date: baseItem.date,
          ref: baseItem.voucher_no,
          bank: baseItem.account_type,
          raw: baseItem,
        });
      } else {
        cashInflows.push({
          customer:
            baseItem.from_type === "Customer"
              ? baseItem.from_id
              : baseItem.from_type,
          amount: baseItem.amount,
          date: baseItem.date,
          mode: "Cash",
          raw: baseItem,
        });
      }
    }

    // -----------------------------------
    // INVENTORY
    // -----------------------------------
    const productRows = await prisma.products.findMany({
      where: { company_id },
      select: {
        id: true,
        item_name: true,
        total_stock: true,
        sale_price: true,
        item_category: { select: { item_category_name: true } },
      },
    });

    const inventory = productRows.map((p) => {
      const qty = Number(p.total_stock || 0);
      const price = Number(p.sale_price || 0);
      return {
        product: p.item_name,
        qty,
        value: qty * price,
        category: p.item_category?.item_category_name || null,
      };
    });

    const inventoryTotal = inventory.reduce((a, b) => a + b.value, 0);

    // -----------------------------------
    // RECEIVABLES
    // -----------------------------------
    const receivableRows = await prisma.vendorscustomer.findMany({
      where: { company_id, type: "customer" },
      select: {
        id: true,
        name_english: true,
        account_balance: true,
        created_at: true,
      },
      orderBy: { account_balance: "desc" },
    });

    const receivables = receivableRows.map((r) => ({
      customer: r.name_english,
      amount: Number(r.account_balance),
      dueDate: null,
      status: Number(r.account_balance) > 0 ? "Pending" : "Cleared",
      raw: { id: r.id, created_at: r.created_at },
    }));

    const receivableTotal = receivables.reduce((a, b) => a + b.amount, 0);

    // -----------------------------------
    // RESPONSE
    // -----------------------------------
    return res.json({
      success: true,
      cashInflows,
      bankTransactions,
      inventory,
      inventoryTotal,
      receivables,
      receivableTotal,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch asset details",
      error: err.message,
    });
  }
};


export const getLiabilityCapitalDetails = async (req, res) => {
  try {
    const company_id = Number(req.params.company_id);

    if (!company_id || isNaN(company_id)) {
      return res.status(400).json({
        success: false,
        message: "company_id is required in route",
      });
    }

    // ------------------------------------------------------------
    // 1️⃣ CURRENT LIABILITIES (vendors)
    // ------------------------------------------------------------
    const vendorRows = await prisma.vendorscustomer.findMany({
      where: { company_id, type: "vender" },
      select: {
        id: true,
        name_english: true,
        account_balance: true,
        creation_date: true,
      },
      orderBy: { account_balance: "desc" },
    });

    const currentLiabilities = vendorRows.map((v) => ({
      supplier: v.name_english,
      amount: Number(v.account_balance || 0),
      dueDate: v.creation_date,
      status:
        Number(v.account_balance) > 0
          ? "Pending"
          : Number(v.account_balance) === 0
          ? "Cleared"
          : "Overdue",
      raw: v,
    }));

    const currentLiabilityTotal = currentLiabilities.reduce(
      (sum, row) => sum + row.amount,
      0
    );

    // ------------------------------------------------------------
    // 2️⃣ LONG-TERM LIABILITIES (Loans)
    // ------------------------------------------------------------
    const loanRows = await prisma.accounts.findMany({
      where: {
        company_id,
        parent_account: {
          subgroup_name: "Loans",
        },
      },
      include: {
        parent_account: true, // ⭐ REQUIRED for relation filter to work
      },
    });

    const longTermLiabilities = loanRows.map((l) => ({
      loan: l.bank_name_branch || "Loan Account",
      amount: Number(l.accountBalance || 0),
      interestRate: null,
      maturity: null,
      raw: l,
    }));

    const longTermLiabilityTotal = longTermLiabilities.reduce(
      (sum, row) => sum + row.amount,
      0
    );

    // ------------------------------------------------------------
    // 3️⃣ OWNER’S CAPITAL
    // ------------------------------------------------------------
    const capitalRows = await prisma.accounts.findMany({
      where: {
        company_id,
        parent_account: {
          subgroup_name: "Capital",
        },
      },
      include: {
        parent_account: true, // ⭐ REQUIRED
      },
    });

    const companyUser = await prisma.users.findUnique({
      where: { id: company_id },
      select: { name: true },
    });

    const ownersCapital = capitalRows.map((c) => ({
      owner: companyUser?.name || "Owner",
      capital: Number(c.accountBalance || 0),
      type: c.bank_name_branch || "Capital",
      raw: c,
    }));

    const ownerCapitalTotal = ownersCapital.reduce(
      (sum, row) => sum + row.capital,
      0
    );

    // ------------------------------------------------------------
    // FINAL RESPONSE
    // ------------------------------------------------------------
    return res.json({
      success: true,
      currentLiabilities: {
        rows: currentLiabilities,
        total: currentLiabilityTotal,
      },
      longTermLiabilities: {
        rows: longTermLiabilities,
        total: longTermLiabilityTotal,
      },
      ownersCapital: {
        rows: ownersCapital,
        total: ownerCapitalTotal,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch liability & capital details",
      error: err.message,
    });
  }
};
