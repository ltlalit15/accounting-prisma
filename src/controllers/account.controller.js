import prisma from "../config/db.js";

// ----------- Parent Account Controllers ----------- //
export const createParentAccount = async (req, res) => {
  try {
    const { main_category, subgroup_name, company_id } = req.body;

    if (!main_category || !subgroup_name || !company_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newParentAccount = await prisma.parent_accounts.create({
      data: {
        main_category,
        subgroup_name,
        company_id: parseInt(company_id),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Parent Account created successfully",
      data: newParentAccount,
    });
  } catch (error) {
    console.error("Create Parent Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getParentAccountsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ message: "company_id is required" });
    }

    // Fetch all parent accounts for this company
    const parentAccounts = await prisma.parent_accounts.findMany({
      where: { company_id: parseInt(company_id) },
      orderBy: { id: "desc" },
    });

    if (parentAccounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No parent accounts found for this company",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parent accounts fetched successfully",
      data: parentAccounts,
    });
  } catch (error) {
    console.error("Get Parent Accounts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------- Sub of Subgroup Controllers ----------- //

export const createSubOfSubgroup = async (req, res) => {
  try {
    const { subgroup_id, name } = req.body;

    if (!subgroup_id || !name) {
      return res.status(400).json({
        success: false,
        message: "subgroup_id and name are required",
      });
    }

    const sub = await prisma.sub_of_subgroups.create({
      data: {
        name,
        subgroup_id: parseInt(subgroup_id),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Sub of Subgroup created successfully",
      data: sub,
    });
  } catch (error) {
    console.error("❌ Error creating Sub of Subgroup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getSubOfSubgroupsBySubgroupId = async (req, res) => {
  try {
    const { subgroup_id } = req.params;

    if (!subgroup_id) {
      return res.status(400).json({
        success: false,
        message: "subgroup_id is required",
      });
    }

    const subs = await prisma.sub_of_subgroups.findMany({
      where: { subgroup_id: parseInt(subgroup_id) },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Sub of Subgroups fetched successfully",
      data: subs,
    });
  } catch (error) {
    console.error("❌ Error fetching by subgroup_id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteSubOfSubgroup = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sub_of_subgroups.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Sub of Subgroup deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting Sub of Subgroup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------- Account Controllers ----------- //

export const createAccount = async (req, res) => {
  try {
    const {
      company_id,
      subgroup_id,
      sub_of_subgroup_id,
      account_number,
      ifsc_code,
      bank_name_branch,
    } = req.body;

    if (!company_id || !subgroup_id) {
      return res.status(400).json({
        success: false,
        message: "company_id and subgroup_id are required",
      });
    }

    const newAccount = await prisma.accounts.create({
      data: {
        company_id: parseInt(company_id),
        subgroup_id: parseInt(subgroup_id),
        sub_of_subgroup_id: sub_of_subgroup_id
          ? parseInt(sub_of_subgroup_id)
          : null,
        account_number,
        ifsc_code,
        bank_name_branch,
      },
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("❌ Error creating account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await prisma.accounts.findMany({
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { id: true, name: true } },
        parent_account: { select: { id: true, subgroup_name: true } },
        sub_of_subgroup: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("❌ Error fetching accounts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAccountsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id is required" });
    }

    const accounts = await prisma.accounts.findMany({
      where: { company_id: parseInt(company_id) },
      orderBy: { created_at: "desc" },
      include: {
        parent_account: { select: { id: true, subgroup_name: true } },
        sub_of_subgroup: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("❌ Error fetching by company_id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subgroup_id,
      sub_of_subgroup_id,
      account_number,
      ifsc_code,
      bank_name_branch,
      accountBalance,
    } = req.body;

    const updated = await prisma.accounts.update({
      where: { id: parseInt(id) },
      data: {
        subgroup_id: parseInt(subgroup_id),
        sub_of_subgroup_id: sub_of_subgroup_id
          ? parseInt(sub_of_subgroup_id)
          : null,
        account_number,
        ifsc_code,
        bank_name_branch,
        accountBalance,
      },
    });

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const deleteAccount = async (req, res) => {

//   try {
//     const { id } = req.params;

//     await prisma.accounts.delete({
//       where: { id: parseInt(id) },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Account deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting account:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const accountId = parseInt(id);

    // 1️⃣ Delete vouchers where this account is FROM
    await prisma.contra_vouchers.deleteMany({
      where: { account_from_id: accountId },
    });

    // 2️⃣ Delete vouchers where this account is TO
    await prisma.contra_vouchers.deleteMany({
      where: { account_to_id: accountId },
    });

    // 3️⃣ Now delete the account
    await prisma.accounts.delete({
      where: { id: accountId },
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const getLedger = async (req, res) => {
//   try {
//     const account_id = Number(req.params.account_id);
//     const company_id = Number(req.params.company_id);

//     if (!account_id || !company_id) {
//       return res.status(400).json({ success: false, message: "company_id & account_id required" });
//     }

//     // Opening Balance (initial)
//     const accountInfo = await prisma.accounts.findFirst({
//       where: { id: account_id, company_id },
//       select: { accountBalance: true }
//     });

//     let rows = [];

//     // ---------- 1) VOUCHERS ----------
//     const vouchers = await prisma.vouchers.findMany({
//       where: {
//         company_id,
//         OR: [{ from_account: account_id }, { to_account: account_id }]
//       }
//     });

//     vouchers.forEach(v => {
//       const isDebit = v.from_account === account_id;
//       rows.push({
//         date: v.date,
//         particulars: v.voucher_type,
//         vch_no: v.voucher_number,
//         ref_no: v.manual_voucher_no,
//         vch_type: v.voucher_type,
//         debit: isDebit ? Number(v.transfer_amount) : 0,
//         credit: isDebit ? 0 : Number(v.transfer_amount)
//       });
//     });

//     // ---------- 2) CONTRA ----------
//     const contra = await prisma.contra_vouchers.findMany({
//       where: {
//         company_id,
//         OR: [{ account_from_id: account_id }, { account_to_id: account_id }]
//       }
//     });

//     contra.forEach(c => {
//       const isDebit = c.account_from_id === account_id;
//       rows.push({
//         date: c.voucher_date,
//         particulars: "Contra Entry",
//         vch_no: c.voucher_number,
//         ref_no: c.voucher_no_auto,
//         vch_type: "Contra",
//         debit: isDebit ? Number(c.amount) : 0,
//         credit: isDebit ? 0 : Number(c.amount)
//       });
//     });

//     // ---------- 3) INCOME ----------
//     const income = await prisma.income_voucher_entries.findMany({
//       where: {
//         income_vouchers: { company_id },
//         income_account: String(account_id)
//       },
//       include: { income_vouchers: true }
//     });

//     income.forEach(i => {
//       rows.push({
//         date: i.income_vouchers.voucher_date,
//         particulars: "Income",
//         vch_no: i.income_vouchers.auto_receipt_no,
//         ref_no: i.income_vouchers.manual_receipt_no,
//         vch_type: "Income",
//         debit: 0,
//         credit: Number(i.amount)
//       });
//     });

//     // ---------- 4) EXPENSE ----------
//     const expense = await prisma.expensevouchers.findMany({
//       where: { company_id, paid_from_account_id: account_id }
//     });

//     expense.forEach(e => {
//       rows.push({
//         date: e.voucher_date,
//         particulars: "Expense",
//         vch_no: e.auto_receipt_no,
//         ref_no: e.manual_receipt_no,
//         vch_type: "Expense",
//         debit: Number(e.total_amount),
//         credit: 0
//       });
//     });

//     // ---------- 5) POS INVOICES (cash/bank sales) ----------
//     const posInvoices = await prisma.pos_invoices.findMany({
//       where: { company_id }
//     });

//     posInvoices.forEach(p => {
//       if (p.payment_status === "Paid") {
//         rows.push({
//           date: p.created_at,
//           particulars: "POS Invoice",
//           vch_no: `POS-${p.id}`,
//           ref_no: null,
//           vch_type: "POS",
//           debit: 0,
//           credit: Number(p.total)
//         });
//       }
//     });

//     // ---------- 6) SALES RETURN ----------
//     const salesReturn = await prisma.sales_return.findMany({
//       where: { company_id }
//     });

//     salesReturn.forEach(s => {
//       rows.push({
//         date: s.return_date,
//         particulars: "Sales Return",
//         vch_no: s.return_no,
//         ref_no: s.auto_voucher_no,
//         vch_type: "Sales Return",
//         debit: Number(s.grand_total),
//         credit: 0
//       });
//     });

//     // ---------- 7) PURCHASE ORDER ----------
//     const purchaseOrders = await prisma.purchaseorder.findMany({
//       where: { company_id }
//     });

//     purchaseOrders.forEach(p => {
//       rows.push({
//         date: p.created_at,
//         particulars: "Purchase Order",
//         vch_no: p.PO_no,
//         ref_no: p.Manual_PO_ref,
//         vch_type: "Purchase Order",
//         debit: 0,
//         credit: Number(p.total)
//       });
//     });

//     // ---------- 8) PURCHASE RETURN ----------
//     const purchaseReturn = await prisma.purchase_return.findMany({
//       where: { company_id }
//     });

//     purchaseReturn.forEach(p => {
//       rows.push({
//         date: p.return_date,
//         particulars: "Purchase Return",
//         vch_no: p.return_no,
//         ref_no: p.auto_voucher_no,
//         vch_type: "Purchase Return",
//         debit: Number(p.grand_total),
//         credit: 0
//       });
//     });

//     // ---------- 9) ADJUSTMENTS ----------
//     const adjustments = await prisma.adjustments.findMany({
//       where: { company_id }
//     });

//     adjustments.forEach(a => {
//       rows.push({
//         date: a.voucher_date,
//         particulars: "Stock Adjustment",
//         vch_no: a.voucher_no,
//         ref_no: a.manual_voucher_no,
//         vch_type: "Adjustment",
//         debit: Number(a.total_value),
//         credit: 0
//       });
//     });

//     // ---------- 10) JOURNAL (transactions table) ----------
//     const journal = await prisma.transactions.findMany({ where: { company_id } });

//     journal.forEach(j => {
//       if (Number(j.from_id) === account_id) {
//         rows.push({
//           date: j.date,
//           particulars: j.note,
//           vch_no: j.voucher_no,
//           ref_no: j.transaction_id,
//           vch_type: j.voucher_type,
//           debit: Number(j.amount),
//           credit: 0
//         });
//       }
//       if (Number(j.balance_type) === account_id) {
//         rows.push({
//           date: j.date,
//           particulars: j.note,
//           vch_no: j.voucher_no,
//           ref_no: j.transaction_id,
//           vch_type: j.voucher_type,
//           debit: 0,
//           credit: Number(j.amount)
//         });
//       }
//     });

//     // Sort by date
//     rows.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // Running Balance
//     let running = Number(accountInfo?.accountBalance || 0);
//     rows = rows.map(r => {
//       running = running + r.credit - r.debit;
//       return { ...r, running_balance: running.toFixed(2) };
//     });

//     return res.json({
//       success: true,
//       opening_balance: Number(accountInfo?.accountBalance || 0),
//       closing_balance: running.toFixed(2),
//       ledger: rows
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const getLedger = async (req, res) => {
  try {
    const subgroup_id = Number(req.params.subgroup_id);
    const company_id = Number(req.params.company_id);

    if (!subgroup_id || !company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id & subgroup_id required" });
    }

    // ensure account exists for given company
    const accounts = await prisma.accounts.findMany({
      where: {
        company_id,
        subgroup_id,
      },
      select: {
        id: true,
        accountBalance: true,
      },
    });
      if (!accounts.length) {
        return res.status(404).json({
          success: false,
          message: "No accounts found for this subgroup",
          ledger: [],
        });
      }

    const accountIds = accounts.map((a) => a.id);

    // parties linked to this account (vendorscustomer rows that reference this account)
    const partiesForAccount = await prisma.vendorscustomer.findMany({
      where: {
        company_id,
        account_id: { in: accountIds },
      },

      select: {
        id: true,
        account_id: true,
        creation_date: true,
        created_at: true,
        name_english: true,
        account_type: true,
        account_name: true,
      },
    });
    console.log(
      "getLedger partiesForAccount count:",
      partiesForAccount.length,
      "sample:",
      partiesForAccount.slice(0, 3)
    );
    console.log("getLedger params:", { subgroup_id, company_id });

    const partyIds = partiesForAccount.map((p) => p.id);
    const partyNames = partiesForAccount
      .map((p) => (p.name_english || "").toLowerCase())
      .filter(Boolean);
    const partiesById = {};
    partiesForAccount.forEach((p) => {
      partiesById[p.id] = p;
    });
    const rows = [];

    // VOUCHERS
    const vouchers = await prisma.vouchers.findMany({
      where: {
        company_id,
        OR: [
          { from_account: { in: accountIds } },
          { to_account: { in: accountIds } },
        ],
      },
    });
    const voucherAccountIds = [
      ...new Set(vouchers.flatMap((v) => [v.from_account, v.to_account])),
    ];
    const voucherParties = await prisma.vendorscustomer.findMany({
      where: {
        company_id,
        account_id: { in: voucherAccountIds.filter(Boolean) },
      },
      select: {
        id: true,
        account_id: true,
        name_english: true,
        account_type: true,
        account_name: true,
      },
    });
    const voucherPartyMap = {};
    voucherParties.forEach((p) => {
      voucherPartyMap[p.account_id] = p;
    });

    vouchers.forEach((v) => {
      const isDebit = accountIds.includes(v.from_account);

      const relatedAccount = isDebit ? v.to_account : v.from_account;
      let p = voucherPartyMap[relatedAccount];
      // fallback: vouchers may reference vendorscustomer by customer_id/vendor_id
      if (!p)
        p = partiesById[v.customer_id] || partiesById[v.vendor_id] || null;
      console.log("voucher row party lookup", {
        voucherId: v.id,
        relatedAccount,
        customer_id: v.customer_id,
        vendor_id: v.vendor_id,
        partyFound: !!p,
      });
      rows.push({
        date: v.date,
        debit: isDebit ? Number(v.transfer_amount) : 0,
        credit: isDebit ? 0 : Number(v.transfer_amount),
        vendor_customer_id: p?.id || null,
        name: p?.name_english || null,
        account_type: p?.account_type || null,
        account_name: p?.account_name || null,
      });
    });

    // CONTRA
    const contra = await prisma.contra_vouchers.findMany({
      where: {
        company_id,
        OR: [
          { account_from_id: { in: accountIds } },
          { account_to_id: { in: accountIds } },
        ],
      },
    });
    contra.forEach((c) => {
      const isDebit = accountIds.includes(c.account_from_id);

      rows.push({
        date: c.voucher_date,
        debit: isDebit ? Number(c.amount) : 0,
        credit: isDebit ? 0 : Number(c.amount),
        vendor_customer_id: null,
        name: null,
        account_type: null,
        account_name: null,
      });
    });

    // INCOME
    const income = await prisma.income_voucher_entries.findMany({
      where: {
        income_vouchers: { company_id },
        income_account: { in: accountIds.map(String) },
      },
      include: { income_vouchers: true },
    });
    income.forEach((i) => {
      rows.push({
        date: i.income_vouchers.voucher_date,
        debit: 0,
        credit: Number(i.amount),
        vendor_customer_id: null,
        name: null,
        account_type: null,
        account_name: null,
      });
    });

    // EXPENSE
    const expense = await prisma.expensevouchers.findMany({
      where: { company_id, paid_from_account_id: { in: accountIds } },
    });
    expense.forEach((e) => {
      rows.push({
        date: e.voucher_date,
        debit: Number(e.total_amount),
        credit: 0,
        vendor_customer_id: null,
        name: null,
        account_type: null,
        account_name: null,
      });
    });

    // POS INVOICES (only those where the invoice's customer is linked to this account)
    const posInvoices = await prisma.pos_invoices.findMany({
      where: {
        company_id,
        payment_status: "Paid",
        customer: {
          account_id: { in: accountIds },
        },
      },
      include: {
        customer: {
          select: { id: true, name_english: true, account_id: true },
        },
      },
    });
    posInvoices.forEach((p) => {
      rows.push({
        date: p.created_at,
        debit: 0,
        credit: Number(p.total),
        vendor_customer_id: p.customer?.id || null,
        name: p.customer?.name_english || null,
        account_type: null,
        account_name: null,
      });
    });

    // SALES RETURN (customer_id maps to vendorscustomer.id)
    const salesReturn = await prisma.sales_return.findMany({
      where: {
        company_id,
        customer_id: { in: partyIds.length ? partyIds : [0] },
      },
    });
    salesReturn.forEach((s) => {
      const p = partiesById[s.customer_id] || null;
      console.log("salesReturn party lookup", {
        id: s.id,
        customer_id: s.customer_id,
        partyFound: !!p,
      });
      rows.push({
        date: s.return_date,
        debit: Number(s.grand_total),
        credit: 0,
        vendor_customer_id: p?.id || null,
        name: p?.name_english || null,
        account_type: p?.account_type || null,
        account_name: p?.account_name || null,
      });
    });

    // PURCHASE ORDER (match by vendor-name fields against party names — approximate)
    const purchaseOrders = await prisma.purchaseorder.findMany({
      where: { company_id },
    });
    const matchedPOs = partyNames.length
      ? purchaseOrders.filter((po) => {
          const fields = [
            po.bill_to_vendor_name,
            po.quotation_from_vendor_name,
            po.payment_made_vendor_name,
            po.vendor_ref,
            po.ship_to_vendor_name,
          ];
          return fields.some((f) => f && partyNames.includes(f.toLowerCase()));
        })
      : [];
    matchedPOs.forEach((p) => {
      rows.push({
        date: p.created_at,
        debit: 0,
        credit: Number(p.total || p.total_amount || 0),
        vendor_customer_id: null,
        name: null,
        account_type: null,
        account_name: null,
      });
    });

    // PURCHASE RETURN (vendor_id maps to vendorscustomer.id)
    const purchaseReturn = await prisma.purchase_return.findMany({
      where: {
        company_id,
        vendor_id: { in: partyIds.length ? partyIds : [0] },
      },
    });
    purchaseReturn.forEach((pr) => {
      const p = partiesById[pr.vendor_id] || null;
      console.log("purchaseReturn party lookup", {
        id: pr.id,
        vendor_id: pr.vendor_id,
        partyFound: !!p,
      });
      rows.push({
        date: pr.return_date,
        debit: Number(pr.grand_total),
        credit: 0,
        vendor_customer_id: p?.id || null,
        name: p?.name_english || null,
        account_type: p?.account_type || null,
        account_name: p?.account_name || null,
      });
    });

    // ADJUSTMENTS
    const adjustments = await prisma.adjustments.findMany({
      where: { company_id },
    });
    adjustments.forEach((a) => {
      rows.push({
        date: a.voucher_date,
        debit: Number(a.total_value),
        credit: 0,
        vendor_customer_id: null,
        name: null,
        account_type: null,
        account_name: null,
      });
    });

    // JOURNAL / transactions
    const journal = await prisma.transactions.findMany({
      where: { company_id },
    });
    journal.forEach((j) => {
      if (accountIds.includes(Number(j.from_id))) {
        rows.push({
          date: j.date,
          debit: Number(j.amount),
          credit: 0,
          vendor_customer_id: null,
          name: null,
          account_type: null,
          account_name: null,
        });
      }

      if (accountIds.includes(Number(j.balance_type))) {
        rows.push({
          date: j.date,
          debit: 0,
          credit: Number(j.amount),
          vendor_customer_id: null,
          name: null,
          account_type: null,
          account_name: null,
        });
      }
    });

    // filter to only rows that are linked to the parties for this subgroup's accounts
    console.log("ledger rows before filter:", rows.length);
    let filteredRows = rows.filter((r) => r.vendor_customer_id !== null);
    console.log("ledger rows after party-filter:", filteredRows.length);

    // Add creation/opening rows only for parties that have NO transactions,
    // so a party with transactions doesn't get an extra zero-value duplicate row.
    const existingPartyIds = new Set(
      filteredRows.map((r) => r.vendor_customer_id)
    );
    partiesForAccount.forEach((p) => {
      if (!existingPartyIds.has(p.id)) {
        filteredRows.push({
          date: p.creation_date || p.created_at || new Date(0),
          debit: 0,
          credit: 0,
          vendor_customer_id: p.id,
          name: p.name_english || null,
          account_type: p.account_type || null,
          account_name: p.account_name || null,
        });
      }
    });
    console.log("ledger rows after adding creation rows:", filteredRows.length);

    // sort & running balance
    filteredRows.sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = accounts.reduce(
      (sum, a) => sum + Number(a.accountBalance || 0),
      0
    );

    const ledger = filteredRows.map((r) => {
      running = running + Number(r.credit || 0) - Number(r.debit || 0);
      return { ...r, running_balance: running.toFixed(2) };
    });

    return res.json({
      success: true,

      subgroup_id,
      opening_balance: accounts.reduce(
        (sum, a) => sum + Number(a.accountBalance || 0),
        0
      ),
      ledger,
    });
  } catch (err) {
    console.error("Ledger Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/*
Opening Balance         +12000
Total Debit             -118865.10
Total Credit            +15731
---------------------------------
Closing Balance        = -91134.10
*/

export const buildLedgerForAccount = async (company_id, account_id) => {
  // 1️⃣ Fetch account and linked vendor/customers
  const account = await prisma.accounts.findUnique({
    where: { id: account_id },
    include: {
      vendorscustomer: true, // linked vendors/customers
    },
  });
  if (!account) throw new Error("Account not found");

  let ledger = [];

  // 2️⃣ Fetch journal entries
  const journalLines = await prisma.journal_lines.findMany({
    where: { account_id },
    include: { journal_entry: true },
  });

  journalLines.forEach((line) => {
    ledger.push({
      date: line.journal_entry.voucher_date,
      debit: parseFloat(line.debit_amount || 0),
      credit: parseFloat(line.credit_amount || 0),
      vendor_customer_id: null,
      name: null,
      account_type: account.account_type || "Accounts Payable",
      account_name: account.account_name || "",
    });
  });

  // 3️⃣ Fetch contra vouchers
  const contraVouchers = await prisma.contra_vouchers.findMany({
    where: {
      company_id,
      OR: [{ account_from_id: account_id }, { account_to_id: account_id }],
    },
  });

  contraVouchers.forEach((cv) => {
    ledger.push({
      date: cv.voucher_date,
      debit: cv.account_to_id === account_id ? parseFloat(cv.amount) : 0,
      credit: cv.account_from_id === account_id ? parseFloat(cv.amount) : 0,
      vendor_customer_id: null,
      name: null,
      account_type: account.account_type || "Accounts Payable",
      account_name: account.account_name || "",
    });
  });

  // 4️⃣ Fetch vouchers with vendor/customer preloaded
  const vouchers = await prisma.vouchers.findMany({
    where: {
      company_id,
      OR: [{ from_account: account_id }, { to_account: account_id }],
    },
    include: {
      vendor: true, // vendor relation
      customer: true, // customer relation
    },
  });

  vouchers.forEach((v) => {
    let vendorCustomer = v.vendor || v.customer || null;
    let type = v.vendor
      ? "Vendor"
      : v.customer
      ? "Customer"
      : "Accounts Payable";

    ledger.push({
      date: v.date,
      debit:
        v.to_account === account_id ? parseFloat(v.transfer_amount || 0) : 0,
      credit:
        v.from_account === account_id ? parseFloat(v.transfer_amount || 0) : 0,
      vendor_customer_id: vendorCustomer?.id || null,
      name: vendorCustomer?.name_english || null,
      account_type: vendorCustomer?.account_type || type,
      account_name: vendorCustomer?.account_name || "",
      company_info: vendorCustomer?.company || null,
    });
  });

  // 5️⃣ Sort ledger by date
  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 6️⃣ Calculate running balance
  let runningBalance = parseFloat(account.accountBalance || 0);
  ledger = ledger.map((item) => {
    runningBalance = runningBalance + item.debit - item.credit;
    return { ...item, running_balance: runningBalance.toFixed(2) };
  });

  return {
    success: true,
    account_id: account.id,
    opening_balance: parseFloat(account.accountBalance || 0).toFixed(2),
    closing_balance: runningBalance.toFixed(2),
    ledger,
  };
};
export const getLedgerBySubOfSubgroup = async (req, res) => {
  try {
    const { company_id, sub_of_subgroup_id } = req.params;

    const vendorCustomers = await prisma.vendorscustomer.findMany({
      where: {
        company_id: Number(company_id),
        sub_of_subgroup_id: Number(sub_of_subgroup_id),
      },
      include: {
        sub_of_subgroup: {
          include: {
            parent_account: true, // ✅ CORRECT
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    let runningBalance = 0;
    const openingBalance = 0;

    const ledger = vendorCustomers.map((vc) => {
      const balance = Number(vc.account_balance || 0);

      const debit = balance > 0 ? balance : 0;
      const credit = balance < 0 ? Math.abs(balance) : 0;

      runningBalance += debit - credit;

      return {
        date: vc.created_at,
        debit,
        credit,
        vendor_customer_id: vc.id,
        name: vc.name_english,
        account_type: vc.sub_of_subgroup?.parent_account?.subgroup_name || null,
        account_name: vc.sub_of_subgroup?.parent_account?.main_category || null,
        running_balance: runningBalance.toFixed(2),
      };
    });

    return res.json({
      success: true,
      account_id:
        vendorCustomers.length > 0
          ? vendorCustomers[0].sub_of_subgroup?.parent_account?.id
          : null,
      opening_balance: openingBalance,
      closing_balance: runningBalance.toFixed(2),
      ledger,
    });
  } catch (error) {
    console.error("Ledger Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ledger",
    });
  }
};
