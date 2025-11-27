import prisma from "../config/db.js";

/**
 * GET /api/v1/:company_id/reports/profit-loss
 * Query params:
 *  - from_date (YYYY-MM-DD)
 *  - to_date   (YYYY-MM-DD)
 *  - year      (optional) e.g. 2025
 */
export const getProfitAndLoss = async (req, res) => {
  try {
    const { company_id } = req.params;
    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id is required" });
    }

    let { from_date, to_date, year } = req.query;

    // default to year-to-date if not provided
    const now = new Date();
    if (!from_date || !to_date) {
      if (year) {
        from_date = `${year}-01-01`;
        to_date = `${year}-12-31`;
      } else {
        from_date = `${now.getFullYear()}-01-01`;
        to_date = now.toISOString().slice(0, 10);
      }
    }

    // Raw SQL aggregates journal_lines by parent_account.main_category and by account
    // NOTE: adjust CASE mapping below if your parent_accounts.main_category values differ.
    const sql = `
      SELECT
        pa.id AS parent_account_id,
        pa.main_category AS parent_category,
        a.id AS account_id,
        COALESCE(a.account_number, '') AS account_number,
        COALESCE(a.accountBalance, 0.00) AS account_balance,
        COALESCE(SUM(jl.debit_amount), 0.00) AS total_debit,
        COALESCE(SUM(jl.credit_amount), 0.00) AS total_credit,
        -- net as credit - debit (positive for credit balances typical for income)
        COALESCE(SUM(jl.credit_amount) - SUM(jl.debit_amount), 0.00) AS net_amount
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      JOIN accounts a ON a.id = jl.account_id
      JOIN parent_accounts pa ON pa.id = a.subgroup_id
      WHERE je.company_id = ? AND je.voucher_date BETWEEN ? AND ?
      GROUP BY pa.id, a.id
      ORDER BY pa.main_category, a.id;
    `;

    // Execute query. Use $queryRawUnsafe with paramization or $queryRaw with tagged template
    const rows = await prisma.$queryRawUnsafe(
      sql,
      Number(company_id),
      from_date,
      to_date
    );

    // Build an object grouped by parent_category similar to your P&L structure.
    const groups = {}; // e.g. Sales, Cost of Goods Sold, Operating Expenses, Other Income/Expenses

    for (const r of rows) {
      const parent = r.parent_category || "Uncategorized";
      if (!groups[parent])
        groups[parent] = {
          parent_account_id: r.parent_account_id,
          accounts: [],
          total_debit: 0,
          total_credit: 0,
          total_net: 0,
        };

      const acct = {
        account_id: r.account_id,
        account_number: r.account_number,
        account_balance: Number(r.account_balance || 0),
        total_debit: Number(r.total_debit || 0),
        total_credit: Number(r.total_credit || 0),
        net_amount: Number(r.net_amount || 0),
      };

      groups[parent].accounts.push(acct);
      groups[parent].total_debit += acct.total_debit;
      groups[parent].total_credit += acct.total_credit;
      groups[parent].total_net += acct.net_amount;
    }

    // For common P&L totals produce top-level computed numbers
    // We'll try to map typical categories:
    const mapCategory = (name) => (name || "").toLowerCase();

    let totalSales = 0;
    let totalCOGS = 0;
    let totalOperatingExpenses = 0;
    let totalOtherIncome = 0;
    let totalOtherExpenses = 0;
    let incomeTaxExpense = 0;

    for (const [parent, data] of Object.entries(groups)) {
      const key = mapCategory(parent);
      if (
        key.includes("sale") ||
        (key.includes("income") && !key.includes("other"))
      ) {
        // categories named Sales or Income (but not Other Income)
        totalSales += data.total_net;
      } else if (key.includes("cost") || key.includes("cogs")) {
        totalCOGS += Math.abs(data.total_net);
      } else if (
        key.includes("expense") &&
        !key.includes("other") &&
        !key.includes("tax")
      ) {
        totalOperatingExpenses += Math.abs(data.total_net);
      } else if (
        key.includes("other income") ||
        (key.includes("other") && key.includes("income"))
      ) {
        totalOtherIncome += data.total_net;
      } else if (
        key.includes("other expense") ||
        (key.includes("other") && key.includes("expense"))
      ) {
        totalOtherExpenses += Math.abs(data.total_net);
      } else if (key.includes("tax")) {
        incomeTaxExpense += Math.abs(data.total_net);
      } else {
        // fallback: if parent contains "income", treat as other income
        if (key.includes("income")) totalOtherIncome += data.total_net;
        else if (key.includes("expense"))
          totalOperatingExpenses += Math.abs(data.total_net);
      }
    }

    // compute gross profit, operating income, net profit before tax, net profit
    const grossProfit = totalSales - totalCOGS;
    const operatingIncome = grossProfit - totalOperatingExpenses;
    const netProfitBeforeTax =
      operatingIncome + totalOtherIncome - totalOtherExpenses;
    const netProfit = netProfitBeforeTax - incomeTaxExpense;

    const result = {
      success: true,
      meta: { company_id: Number(company_id), from_date, to_date },
      groups,
      totals: {
        totalSales,
        totalCOGS,
        grossProfit,
        totalOperatingExpenses,
        operatingIncome,
        totalOtherIncome,
        totalOtherExpenses,
        netProfitBeforeTax,
        incomeTaxExpense,
        netProfit,
      },
    };

    return res.json(result);
  } catch (error) {
    console.error("getProfitAndLoss error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
