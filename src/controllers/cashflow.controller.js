import prisma from "../config/db.js";

export const getCashFlow = async (req, res) => {
  try {
    const company_id = Number(req.params.company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    // Fetch data exactly as in DB
    const transactions = await prisma.transactions.findMany({
      where: { company_id },
      orderBy: { id: "asc" },
      select: {
        id: true,
        date: true,
        voucher_type: true,
        voucher_no: true,
        amount: true,
        balance_type: true,
        account_type: true,
        from_id: true,
        note: true,
      },
    });

    let runningBalance = 0;
    const rows = [];

    for (const trx of transactions) {

      // Fetch account real data
      let account = null;
      if (trx.from_id) {
        account = await prisma.accounts.findUnique({
          where: { id: trx.from_id },
          select: {
            bank_name_branch: true,
            account_number: true,
            accountBalance: true,
          },
        });
      }

      // EXACT DB MAPPING
      let credit = 0;
      let debit = 0;

      if (trx.balance_type === "Receive Payment") {
        credit = Number(trx.amount);
      }

      if (trx.balance_type === "Make Payment") {
        debit = Number(trx.amount);
      }

      runningBalance += credit - debit;

      rows.push({
        date: trx.date,
        bankAccount: account
          ? `${account.bank_name_branch || ""} - ${account.account_number || ""}`
          : "-",
        description: trx.note || trx.voucher_type || "",
        credit,
        debit,
        accountBalance: account ? Number(account.accountBalance || 0) : 0,
        totalBalance: runningBalance,
        paymentMethod: trx.account_type,
        balanceTypeRaw: trx.balance_type,   // 👈 DB raw value
        raw: trx,
      });
    }

    return res.json({
      success: true,
      data: rows,
      total: rows.length,
    });

  } catch (err) {
    console.error("CashFlow ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load cash flow",
      error: err.message,
    });
  }
};