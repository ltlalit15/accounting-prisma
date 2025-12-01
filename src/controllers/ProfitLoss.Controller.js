// controllers/ProfitLoss.controller.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// parent_accounts.main_category ko normalize karke
// P&L bucket decide karenge
const mapCategoryToBucket = (name = "") => {
  const key = (name || "").trim().toLowerCase();

  if (key === "sales") return "sales";
  if (key === "cost of goods sold" || key === "cogs") return "cogs";
  if (key === "operating expenses" || key === "opex") return "opex";
  if (key === "other income") return "other_income";
  if (key === "other expenses") return "other_expense";
  if (key === "tax") return "tax";

  // Balance sheet / non-P&L groups skip
  return null;
};

// UI ordering and titles for groups
const GROUP_ORDER = [
  { key: "sales", title: "Sales" },
  { key: "cogs", title: "Cost of Goods Sold" },
  { key: "opex", title: "Operating Expenses" },
  { key: "other_income", title: "Other Income" },
  { key: "other_expense", title: "Other Expenses" },
  { key: "tax", title: "Tax" },
];

// ------------------ PROFIT & LOSS ------------------
export const getProfitAndLoss = async (req, res) => {
  try {
    const { company_id } = req.params;
    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id is required" });
    }

    let { from_date, to_date, year } = req.query;
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

    // 1) Raw SQL: group by account + parent main_category
    // Use COALESCE to avoid NULL parent_category
    const sql = `
      SELECT
        COALESCE(pa.main_category, '')            AS parent_category,
        a.id                                      AS account_id,
        COALESCE(a.account_number,'')             AS account_number,
        COALESCE(SUM(jl.debit_amount),  0.00)     AS total_debit,
        COALESCE(SUM(jl.credit_amount), 0.00)     AS total_credit,
        COALESCE(SUM(jl.credit_amount) - SUM(jl.debit_amount), 0.00) AS net_amount
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      JOIN accounts a        ON a.id  = jl.account_id
      LEFT JOIN parent_accounts pa ON pa.id = a.subgroup_id
      WHERE je.company_id = ?
        AND je.voucher_date BETWEEN ? AND ?
      GROUP BY pa.main_category, a.id, a.account_number
      ORDER BY pa.main_category, a.id;
    `;

    const rows = await prisma.$queryRawUnsafe(
      sql,
      Number(company_id),
      from_date,
      to_date
    );

    // 2) Prepare empty containers and running totals per bucket
    const groupsObj = {
      sales: { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 },
      cogs: { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 },
      opex: { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 },
      other_income: { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 },
      other_expense: { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 },
      tax: { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 },
    };

    // aggregate totals used for P&L calculation
    let totalSales = 0;
    let totalCOGS = 0;
    let totalOperatingExpenses = 0;
    let totalOtherIncome = 0;
    let totalOtherExpenses = 0;
    let incomeTaxExpense = 0;

    for (const row of rows) {
      const bucket = mapCategoryToBucket(row.parent_category);
      if (!bucket) continue; // skip non-P&L parent categories

      const net = Number(row.net_amount || 0);
      const debit = Number(row.total_debit || 0);
      const credit = Number(row.total_credit || 0);

      // Provide both raw debit/credit for UI and a net_amount
      // displayDebit/displayCredit = raw fields (frontend decides how to place)
      const accountObj = {
        parent_category: row.parent_category,
        account_id: Number(row.account_id),
        account_label: row.account_number || `Account ${row.account_id}`,
        total_debit: debit,
        total_credit: credit,
        net_amount: net,
        displayDebit: debit,
        displayCredit: credit,
        link: `/api/v1/${company_id}/reports/account/${row.account_id}/transactions?from_date=${from_date}&to_date=${to_date}`,
      };

      // push to bucket
      groupsObj[bucket].accounts.push(accountObj);

      // accumulate group totals
      groupsObj[bucket].total_debit += debit;
      groupsObj[bucket].total_credit += credit;
      groupsObj[bucket].total_net += net;

      // accumulate P&L totals as per mapping rules
      switch (bucket) {
        case "sales":
          totalSales += net;
          break;
        case "cogs":
          totalCOGS += Math.abs(net);
          break;
        case "opex":
          totalOperatingExpenses += Math.abs(net);
          break;
        case "other_income":
          totalOtherIncome += net;
          break;
        case "other_expense":
          totalOtherExpenses += Math.abs(net);
          break;
        case "tax":
          incomeTaxExpense += Math.abs(net);
          break;
        default:
          break;
      }
    }

    // 3) Convert groupsObj to ordered array for UI (preserve order & add totals)
    const groups = GROUP_ORDER.map((g) => {
      const obj = groupsObj[g.key] || { accounts: [], total_debit: 0, total_credit: 0, total_net: 0 };
      // sort accounts if you want predictable ordering (by account_label)
      obj.accounts.sort((a, b) => {
        const A = (a.account_label || "").toString().toLowerCase();
        const B = (b.account_label || "").toString().toLowerCase();
        return A.localeCompare(B);
      });
      return {
        key: g.key,
        title: g.title,
        accounts: obj.accounts,
        total_debit: obj.total_debit,
        total_credit: obj.total_credit,
        total_net: obj.total_net,
      };
    });

    // 4) Top-level P&L calculations
    const grossProfit = totalSales - totalCOGS;
    const operatingIncome = grossProfit - totalOperatingExpenses;
    const netProfitBeforeTax = operatingIncome + totalOtherIncome - totalOtherExpenses;
    const netProfit = netProfitBeforeTax - incomeTaxExpense;

    return res.json({
      success: true,
      meta: { company_id: Number(company_id), from_date, to_date },
      groups, // ordered array
      totals: {
        totalSales,
        totalCOGS,
        totalOperatingExpenses,
        totalOtherIncome,
        totalOtherExpenses,
        incomeTaxExpense,
        grossProfit,
        operatingIncome,
        netProfitBeforeTax,
        netProfit,
      },
    });
  } catch (error) {
    console.error("getProfitAndLoss error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ------------------ DETAIL ACCOUNT TRANSACTIONS (modal) ------------------
export const getAccountTransactions = async (req, res) => {
  try {
    const { company_id, account_id } = req.params;
    if (!company_id || !account_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id and account_id required" });
    }

    let { from_date, to_date } = req.query;
    const now = new Date();
    if (!from_date || !to_date) {
      from_date = `${now.getFullYear()}-01-01`;
      to_date = now.toISOString().slice(0, 10);
    }

    const sqlLines = `
      SELECT
        je.id AS journal_entry_id,
        je.voucher_date AS date,
        COALESCE(jl.narration, '') AS description,
        COALESCE(jl.debit_amount, 0.00) AS debit_amount,
        COALESCE(jl.credit_amount, 0.00) AS credit_amount,
        (COALESCE(jl.debit_amount,0.00) - COALESCE(jl.credit_amount,0.00)) AS amount
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.journal_entry_id
      WHERE jl.account_id = ?
        AND je.company_id = ?
        AND je.voucher_date BETWEEN ? AND ?
      ORDER BY je.voucher_date ASC, jl.id ASC;
    `;

    const rows = await prisma.$queryRawUnsafe(
      sqlLines,
      Number(account_id),
      Number(company_id),
      from_date,
      to_date
    );

    let debit_amount = 0;
    let credit_amount = 0;
    for (const r of rows) {
      debit_amount += Number(r.debit_amount || 0);
      credit_amount += Number(r.credit_amount || 0);
    }
    const transaction_count = rows.length;
    const total_amount = debit_amount - credit_amount;

    const accSql = `
      SELECT id, company_id, accountBalance, account_number
      FROM accounts
      WHERE id = ?
      LIMIT 1;
    `;
    const accRows = await prisma.$queryRawUnsafe(
      accSql,
      Number(account_id)
    );
    const account_balance =
      accRows && accRows[0]
        ? Number(accRows[0].accountBalance || 0)
        : 0;
    const account_label =
      accRows && accRows[0]
        ? accRows[0].account_number || `Account ${account_id}`
        : `Account ${account_id}`;

    const transactions = rows.map((r) => ({
      date: r.date ? new Date(r.date).toISOString().slice(0, 10) : null,
      description: r.description,
      debit_amount: Number(r.debit_amount || 0),
      credit_amount: Number(r.credit_amount || 0),
      amount: Number(r.amount || 0),
    }));

    return res.json({
      success: true,
      meta: {
        company_id: Number(company_id),
        account_id: Number(account_id),
        from_date,
        to_date,
      },
      summary: {
        account_label,
        account_type: "N/A",
        total_amount,
        debit_amount,
        credit_amount,
        transaction_count,
        account_balance,
      },
      transactions,
      total: Math.abs(
        transactions.reduce((s, t) => s + (t.amount || 0), 0)
      ),
    });
  } catch (error) {
    console.error("getAccountTransactions error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
