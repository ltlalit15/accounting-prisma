import prisma from "../config/db.js";

// export const getTrialBalance = async (req, res) => {
//   try {
//     const company_id = Number(req.params.company_id);

//     if (!company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "company_id is required",
//       });
//     }

//     // ---------------------------------------------------------
//     // 1️⃣ FETCH ALL ACCOUNTS (parent + sub + user accounts)
//     // ---------------------------------------------------------
//     const accountsList = await prisma.accounts.findMany({
//       where: { company_id },
//       include: {
//         parent_account: true,
//         sub_of_subgroup: true
//       }
//     });

//     // Helper to hold results
//     let result = [];

//     // ---------------------------------------------------------
//     // 2️⃣ LOOP EACH ACCOUNT → CALCULATE:
//     // opening balance + total debit + total credit + closing
//     // ---------------------------------------------------------
//     for (const acc of accountsList) {
//       const accountId = acc.id;

//       // Opening Balance from accounts table
//       const openingBalance = Number(acc.accountBalance || 0);

//       let totalDebit = 0;
//       let totalCredit = 0;

//       // ---------------------------------------------------------
//       // 3️⃣ Collect All Voucher Impacts
//       // ---------------------------------------------------------

//       // 🔹 POS INVOICE → CREDIT
//       const invoices = await prisma.pos_invoices.findMany({
//         where: { company_id, customer_id: accountId }
//       });
//       invoices.forEach(i => {
//         totalCredit += Number(i.total || 0);
//       });

//       // 🔹 PAYMENT (expensevouchers) → DEBIT
//       const payments = await prisma.expensevouchers.findMany({
//         where: { company_id, paid_from_account_id: accountId }
//       });
//       payments.forEach(p => {
//         totalDebit += Number(p.total_amount || 0);
//       });

//       // 🔹 RECEIPTS (income_vouchers) → CREDIT
//       const receipts = await prisma.income_vouchers.findMany({
//         where: { company_id, received_from: accountId }
//       });
//       receipts.forEach(r => {
//         totalCredit += Number(r.total_amount || 0);
//       });

//       // 🔹 CREDIT NOTE (sales_return) → DEBIT
//       const creditNotes = await prisma.sales_return.findMany({
//         where: { company_id, customer_id: accountId }
//       });
//       creditNotes.forEach(cn => {
//         totalDebit += Number(cn.grand_total || 0);
//       });

//       // 🔹 DEBIT NOTE (purchase_return) → CREDIT
//       const debitNotes = await prisma.purchase_return.findMany({
//         where: { company_id, vendor_id: accountId }
//       });
//       debitNotes.forEach(dn => {
//         totalCredit += Number(dn.grand_total || 0);
//       });

//       // 🔹 CONTRA VOUCHERS (DOUBLE–ENTRY)
//       const contraFrom = await prisma.contra_vouchers.findMany({
//         where: { company_id, account_from_id: accountId }
//       });
//       contraFrom.forEach(v => {
//         totalDebit += Number(v.amount || 0);
//       });

//       const contraTo = await prisma.contra_vouchers.findMany({
//         where: { company_id, account_to_id: accountId }
//       });
//       contraTo.forEach(v => {
//         totalCredit += Number(v.amount || 0);
//       });

//       // 🔹 ADJUSTMENTS
//       const adjustments = await prisma.adjustments.findMany({
//         where: { company_id }
//       });

//       for (const adj of adjustments) {
//         const items = await prisma.adjustment_items.findMany({
//           where: { adjustment_id: adj.id }
//         });

//         items.forEach(it => {
//           if (it.warehouse_id === accountId) {
//             totalDebit += Number(it.rate || 0) * Number(it.quantity || 0);
//           }
//         });
//       }

//       // ---------------------------------------------------------
//       // 4️⃣ CALCULATE CLOSING BALANCE
//       // ---------------------------------------------------------
//       const closingBalance = openingBalance + totalCredit - totalDebit;

//       // ---------------------------------------------------------
//       // 5️⃣ PREPARE ROW DATA (MATCH UI EXACTLY)
//       // ---------------------------------------------------------
//       result.push({
//         account_code: acc.id,
//         account_name: acc.parent_account?.main_category || "Account",
//         type: acc.parent_account?.subgroup_name || "Unknown",
//         opening_balance: openingBalance,
//         debit: totalDebit,
//         credit: totalCredit,
//         closing_balance: closingBalance
//       });
//     }

//     // ---------------------------------------------------------
//     // 6️⃣ RETURN TRIAL BALANCE
//     // ---------------------------------------------------------
//     return res.json({
//       success: true,
//       total_accounts: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message
//     });
//   }
// };


// export const getTrialBalance = async (req, res) => {
//   try {
//     const company_id = Number(req.params.company_id);

//     if (!company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "company_id is required",
//       });
//     }

//     // ---------------------------------------------------------
//     // 1️⃣ FETCH ALL ACCOUNTS WITH PROPER RELATIONSHIPS
//     // ---------------------------------------------------------
//     const accountsList = await prisma.accounts.findMany({
//       where: { company_id },
//       include: {
//         parent_account: true,
//         sub_of_subgroup: true
//       }
//     });

//     // Helper to hold results
//     let result = [];

//     // ---------------------------------------------------------
//     // 2️⃣ CALCULATE BALANCES FOR EACH ACCOUNT
//     // ---------------------------------------------------------
//     for (const acc of accountsList) {
//       const accountId = acc.id;
      
//       // Opening Balance from accounts table
//       const openingBalance = Number(acc.accountBalance || 0);

//       // Initialize totals
//       let totalDebit = 0;
//       let totalCredit = 0;

//       // ---------------------------------------------------------
//       // 3️⃣ CALCULATE TRANSACTION IMPACTS
//       // ---------------------------------------------------------

//       // 🔹 POS INVOICE → CREDIT (Sales account)
//       const invoices = await prisma.pos_invoices.findMany({
//         where: { company_id }
//       });
//       invoices.forEach(i => {
//         totalCredit += Number(i.total || 0);
//       });

//       // 🔹 PAYMENT (expensevouchers) → DEBIT
//       const payments = await prisma.expensevouchers.findMany({
//         where: { 
//           company_id,
//           paid_from_account_id: accountId
//         }
//       });
//       payments.forEach(p => {
//         totalDebit += Number(p.total_amount || 0);
//       });

//       // 🔹 RECEIPTS (income_vouchers) → CREDIT
//       const receipts = await prisma.income_vouchers.findMany({
//         where: { 
//           company_id,
//           received_from: accountId
//         }
//       });
//       receipts.forEach(r => {
//         totalCredit += Number(r.total_amount || 0);
//       });

//       // 🔹 CREDIT NOTE (sales_return) → DEBIT
//       const creditNotes = await prisma.sales_return.findMany({
//         where: { 
//           company_id,
//           customer_id: accountId
//         }
//       });
//       creditNotes.forEach(cn => {
//         totalDebit += Number(cn.grand_total || 0);
//       });

//       // 🔹 DEBIT NOTE (purchase_return) → CREDIT
//       const debitNotes = await prisma.purchase_return.findMany({
//         where: { 
//           company_id,
//           vendor_id: accountId
//         }
//       });
//       debitNotes.forEach(dn => {
//         totalCredit += Number(dn.grand_total || 0);
//       });

//       // 🔹 CONTRA VOUCHERS (DOUBLE–ENTRY)
//       const contraFrom = await prisma.contra_vouchers.findMany({
//         where: { 
//           company_id, 
//           account_from_id: accountId
//         }
//       });
//       contraFrom.forEach(v => {
//         totalDebit += Number(v.amount || 0);
//       });

//       const contraTo = await prisma.contra_vouchers.findMany({
//         where: { 
//           company_id, 
//           account_to_id: accountId
//         }
//       });
//       contraTo.forEach(v => {
//         totalCredit += Number(v.amount || 0);
//       });

//       // 🔹 VOUCHERS
//       const vouchersFrom = await prisma.vouchers.findMany({
//         where: { 
//           company_id, 
//           from_account: accountId
//         }
//       });
//       vouchersFrom.forEach(v => {
//         totalDebit += Number(v.transfer_amount || 0);
//       });

//       const vouchersTo = await prisma.vouchers.findMany({
//         where: { 
//           company_id, 
//           to_account: accountId
//         }
//       });
//       vouchersTo.forEach(v => {
//         totalCredit += Number(v.transfer_amount || 0);
//       });

//       // 🔹 ADJUSTMENTS (FIXED LOGIC)
//       const adjustments = await prisma.adjustments.findMany({
//         where: { company_id }
//       });

//       for (const adj of adjustments) {
//         const items = await prisma.adjustment_items.findMany({
//           where: { adjustment_id: adj.id }
//         });

//         // Sum all adjustment amounts for this account
//         const adjustmentTotal = items.reduce((sum, item) => {
//           return sum + (Number(item.rate || 0) * Number(item.quantity || 0));
//         }, 0);
        
//         // If it's a positive adjustment, it's a debit
//         if (adjustmentTotal > 0) {
//           totalDebit += adjustmentTotal;
//         } else {
//           totalCredit += Math.abs(adjustmentTotal);
//         }
//       }

//       // ---------------------------------------------------------
//       // 4️⃣ CALCULATE CLOSING BALANCE
//       // ---------------------------------------------------------
//       const closingBalance = openingBalance + totalCredit - totalDebit;

//       // ---------------------------------------------------------
//       // 5️⃣ PREPARE ROW DATA (MATCH UI EXACTLY)
//       // ---------------------------------------------------------
//       result.push({
//         account_code: acc.account_number || acc.id,
//         account_name: acc.account_number ? acc.account_number : 
//                      acc.parent_account?.main_category || "Account",
//         type: acc.parent_account?.subgroup_name || "Unknown",
//         opening_balance: openingBalance,
//         debit: totalDebit,
//         credit: totalCredit,
//         closing_balance: closingBalance
//       });
//     }

//     // ---------------------------------------------------------
//     // 6️⃣ RETURN TRIAL BALANCE
//     // ---------------------------------------------------------
//     return res.json({
//       success: true,
//       total_accounts: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message
//     });
//   }
// };



export const getTrialBalance = async (req, res) => {
  try {
    const company_id = Number(req.params.company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required"
      });
    }

    // 1️⃣ Fetch all accounts
    const accountsList = await prisma.accounts.findMany({
      where: { company_id },
      include: {
        parent_account: true,
        sub_of_subgroup: true
      }
    });

    let result = [];

    for (const acc of accountsList) {
      const accountId = acc.id;
      const opening = Number(acc.accountBalance || 0);

      let debit = 0;
      let credit = 0;

      // --------------------------------------------------------------------
      // 2️⃣ EXPENSE VOUCHERS (Paid From This Account) → DEBIT
      // --------------------------------------------------------------------
      const expAgg = await prisma.expensevouchers.aggregate({
        where: {
          company_id,
          paid_from_account_id: accountId
        },
        _sum: { total_amount:true}
      });

      debit += Number(expAgg._sum.total_amount || 0);

      // --------------------------------------------------------------------
      // 3️⃣ CONTRA VOUCHERS
      // --------------------------------------------------------------------
      // Money moved OUT → DEBIT
      const contraFrom = await prisma.contra_vouchers.aggregate({
        where: { company_id, account_from_id: accountId },
        _sum: { amount: true }
      });
      debit += Number(contraFrom._sum.amount || 0);

      // Money moved IN → CREDIT
      const contraTo = await prisma.contra_vouchers.aggregate({
        where: { company_id, account_to_id: accountId },
        _sum: { amount: true }
      });
      credit += Number(contraTo._sum.amount || 0);

      // --------------------------------------------------------------------
      // 4️⃣ MANUAL VOUCHERS (from_account → debit / to_account → credit)
      // --------------------------------------------------------------------
      const mFrom = await prisma.vouchers.aggregate({
        where: { company_id, from_account: accountId },
        _sum: { transfer_amount: true }
      });
      debit += Number(mFrom._sum.transfer_amount || 0);

      const mTo = await prisma.vouchers.aggregate({
        where: { company_id, to_account: accountId },
        _sum: { transfer_amount: true }
      });
      credit += Number(mTo._sum.transfer_amount || 0);

      // --------------------------------------------------------------------
      // 5️⃣ FINAL CLOSING BALANCE
      // --------------------------------------------------------------------
      const closing = opening + credit - debit;

      // --------------------------------------------------------------------
      // 6️⃣ UNIVERSAL ACCOUNT NAME MAPPING (as you required)
      // --------------------------------------------------------------------
      const account_name =
        acc.parent_account?.main_category || acc.sub_of_subgroup?.name ||"Account";

      const type =
        acc.parent_account?.subgroup_name ||
        "Unknown";

      // --------------------------------------------------------------------
      // 7️⃣ PUSH FINAL RECORD
      // --------------------------------------------------------------------
      result.push({
        account_code: acc.id,
        account_name,
        type,
        opening_balance: opening,
        debit,
        credit,
        closing_balance: closing
      });
    }

    // --------------------------------------------------------------------
    // 8️⃣ RETURN API RESPONSE
    // --------------------------------------------------------------------
    return res.json({
      success: true,
      total_accounts: result.length,
      data: result
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
};

/*
1) Debit Sources (Correct With Schema)

expensevouchers → paid_from_account

contra_vouchers → account_from

manual vouchers → from_account

2) Credit Sources

contra_vouchers → account_to

manual vouchers → to_account

*/


export const getLedgerDetails = async (req, res) => {
try {
const company_id = Number(req.params.company_id);
const account_id = Number(req.params.account_id);
if (!company_id || !account_id) {
  return res.status(400).json({
    success: false,
    message: "company_id and account_id are required"
  });
}

// 1️⃣ Fetch Account
const acc = await prisma.accounts.findFirst({
  where: { id: account_id, company_id }
});

if (!acc) {
  return res.status(404).json({
    success: false,
    message: "Account not found"
  });
}

const openingBalance = Number(acc.accountBalance || 0);
let transactions = [];

// --------------------------------------------------------------------
// 2️⃣ Opening Balance
// --------------------------------------------------------------------
transactions.push({
  date: acc.created_at,
  type: "Opening Balance",
  particulars: "-",
  debit: openingBalance > 0 ? openingBalance : 0,
  credit: openingBalance < 0 ? Math.abs(openingBalance) : 0
});

// --------------------------------------------------------------------
// 3️⃣ Expense Vouchers (Money OUT)
// --------------------------------------------------------------------
const expenses = await prisma.expensevouchers.findMany({
  where: { company_id, paid_from_account_id: account_id }
});

for (const e of expenses) {
  transactions.push({
    date: e.voucher_date,
    type: "Payment",
    particulars: e.narration || "Expense",
    debit: 0,
    credit: Number(e.total_amount || 0)
  });
}

// --------------------------------------------------------------------
// 4️⃣ Contra Vouchers
// --------------------------------------------------------------------

// Money OUT
const contraFrom = await prisma.contra_vouchers.findMany({
  where: { company_id, account_from_id: account_id }
});

for (const c of contraFrom) {
  transactions.push({
    date: c.voucher_date,
    type: "Payment",
    particulars: c.narration || "Contra Entry",
    debit: 0,
    credit: Number(c.amount || 0)
  });
}

// Money IN
const contraTo = await prisma.contra_vouchers.findMany({
  where: { company_id, account_to_id: account_id }
});

for (const c of contraTo) {
  transactions.push({
    date: c.voucher_date,
    type: "Receipt",
    particulars: c.narration || "Contra Entry",
    debit: Number(c.amount || 0),
    credit: 0
  });
}

// --------------------------------------------------------------------
// 5️⃣ Manual Vouchers
// --------------------------------------------------------------------

// Money OUT
const mFrom = await prisma.vouchers.findMany({
  where: { company_id, from_account: account_id }
});

for (const v of mFrom) {
  transactions.push({
    date: v.date,
    type: "Payment",
    particulars: v.notes || "Voucher",
    debit: 0,
    credit: Number(v.transfer_amount || 0)
  });
}

// Money IN
const mTo = await prisma.vouchers.findMany({
  where: { company_id, to_account: account_id }
});

for (const v of mTo) {
  transactions.push({
    date: v.date,
    type: "Receipt",
    particulars: v.notes || "Voucher",
    debit: Number(v.transfer_amount || 0),
    credit: 0
  });
}

// --------------------------------------------------------------------
// 6️⃣ Cash Sales (From POS Invoices)
// --------------------------------------------------------------------
// Your UI shows Cash Sale must be included.
// Using pos_invoices model.

const cashSales = await prisma.pos_invoices.findMany({
  where: {
    company_id,
    payment_status: "Paid"
  }
});

for (const sale of cashSales) {
  transactions.push({
    date: sale.created_at,
    type: "Cash Sale",
    particulars: "Sales",
    debit: Number(sale.total || 0),
    credit: 0
  });
}

// --------------------------------------------------------------------
// 7️⃣ Final Totals
// --------------------------------------------------------------------
let totalDebit = 0;
let totalCredit = 0;

for (const t of transactions) {
  totalDebit += Number(t.debit);
  totalCredit += Number(t.credit);
}

const currentBalance = openingBalance + totalDebit - totalCredit;

transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

// --------------------------------------------------------------------
// 8️⃣ Final Response
// --------------------------------------------------------------------
return res.json({
  success: true,
  account_name: acc.account_number || "Account",
  opening_balance: openingBalance,
  total_debit: totalDebit,
  total_credit: totalCredit,
  current_balance: currentBalance,
  transactions
});
} catch (err) {
return res.status(500).json({
success: false,
message: "Server Error",
error: err.message
});
}
};