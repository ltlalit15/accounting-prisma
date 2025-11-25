import prisma from "../config/db.js";


/**
 * Mapping: adjust these arrays to match your app's semantics.
 * Current assumption:
 *  - "Receive Payment", "Sales", "Sale Receipt" => Debit
 *  - "Make Payment", "Expense", "Purchase" => Credit
 */
const DEBIT_TYPES = ["Receive Payment", "Sales", "Sale Receipt", "Sales Receipt"];
const CREDIT_TYPES = ["Make Payment", "Expense", "Purchase", "Vendor Payment", "Contra"];

export const getDayBook = async (req, res) => {
  try {
    // company_id passed as path param: /api/v1/daybook/:company_id
    const companyIdRaw = req.params.company_id || req.params.companyId || req.params.id;
    if (!companyIdRaw) {
      return res.status(400).json({ success: false, message: "company_id is required in path params" });
    }
    const company_id = Number(companyIdRaw);
    if (Number.isNaN(company_id)) {
      return res.status(400).json({ success: false, message: "company_id must be a number" });
    }

    const { voucher_type, from_date, to_date, min_amount, max_amount } = req.query;

   
    // Build filters carefully
    const where = { company_id };

    if (voucher_type) {
      // exact match; if you want case-insensitive use Prisma filters with `mode: 'insensitive'`
      where.voucher_type = voucher_type;
    }

    // Date range: include full days — use created_at (change to `date` if your DB uses that)
    if (from_date && to_date) {
      // ensure proper ISO format and include whole to_date day
      const from = new Date(`${from_date}T00:00:00`);
      const to = new Date(`${to_date}T23:59:59`);
      where.created_at = { gte: from, lte: to };
    } else if (from_date) {
      const from = new Date(`${from_date}T00:00:00`);
      where.created_at = { gte: from };
    } else if (to_date) {
      const to = new Date(`${to_date}T23:59:59`);
      where.created_at = { lte: to };
    }

    // Amount filter: only add keys that exist
    if (min_amount || max_amount) {
      const amountFilter = {};
      if (min_amount) {
        const minN = Number(min_amount);
        if (!Number.isNaN(minN)) amountFilter.gte = minN;
      }
      if (max_amount) {
        const maxN = Number(max_amount);
        if (!Number.isNaN(maxN)) amountFilter.lte = maxN;
      }
      // only attach if amountFilter has at least one property
      if (Object.keys(amountFilter).length) where.amount = amountFilter;
    }

    // Fetch entries
    const entries = await prisma.transactions.findMany({
      where,
      orderBy: { created_at: "desc" }
    });


    // Normalize and compute debit/credit from balance_type
    const formatted = entries.map(v => {
      // Determine debit/credit flags
      const bt = (v.balance_type || "").trim();
      const isDebit = DEBIT_TYPES.includes(bt);
      const isCredit = CREDIT_TYPES.includes(bt);

      // Fallback: if neither list includes the type, try simple heuristics
      // (e.g., if string contains "receive" treat as debit, "payment" treat as credit)
      let finalIsDebit = isDebit;
      let finalIsCredit = isCredit;
      if (!isDebit && !isCredit) {
        const low = bt.toLowerCase();
        if (low.includes("receive") || low.includes("receipt") || low.includes("sale")) finalIsDebit = true;
        if (low.includes("payment") || low.includes("expense") || low.includes("purchase")) finalIsCredit = true;
      }

      const amountNum = Number(v.amount || 0);

      return {
        id: v.id,
        voucher_date: v.date || v.created_at, // prefer date column if present
        voucher_no: v.voucher_no,
        voucher_type: v.voucher_type,
        debit_account: finalIsDebit ? v.account_type : "-",
        credit_account: finalIsCredit ? v.account_type : "-",
        debit_amount: finalIsDebit ? amountNum : 0,
        credit_amount: finalIsCredit ? amountNum : 0,
        narration: v.note || ""
      };
    });

    // SUMMARY
    const total_entries = formatted.length;
    const total_debit = formatted.reduce((s, r) => s + Number(r.debit_amount || 0), 0);
    const total_credit = formatted.reduce((s, r) => s + Number(r.credit_amount || 0), 0);
    const net_balance = total_debit - total_credit;

    return res.json({
      success: true,
      summary: {
        total_entries,
        total_debit,
        total_credit,
        net_balance
      },
      data: formatted
    });

  } catch (error) {
    console.error("DAYBOOK ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: String(error) });
  }
};

export const deleteDayBookEntry = async (req, res) => {
  try {
    const idRaw = req.params.id;
    if (!idRaw) return res.status(400).json({ success: false, message: "id param is required" });

    const id = Number(idRaw);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "id must be a number" });

    // Optional: check if exists first
    const existing = await prisma.transactions.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Entry not found" });

    await prisma.transactions.delete({ where: { id } });

    return res.json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: String(error) });
  }
};