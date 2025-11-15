// // src/controllers/transactionController.js
// import * as prismaClient from "@prisma/client";
// const { PrismaClient } = prismaClient;
// const prisma = new PrismaClient();

import prisma from "../config/db.js";


// ✅ Create Transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      date,
      company_id, 
      balance_type,
      voucher_type,
      voucher_no,
      amount,
      from_type,
      from_id,
      account_type,
      note
    } = req.body;

    const transaction_id = "TXN" + Date.now();

    const newTransaction = await prisma.transactions.create({
      data: {
        date: date || null,
        company_id: company_id ? parseInt(company_id) : null,
        transaction_id,
        balance_type: balance_type || null,
        voucher_type: voucher_type || null,
        voucher_no: voucher_no || null,
        amount: amount ? parseFloat(amount) : 0,
        from_type: from_type || null,
        from_id: from_id ? parseInt(from_id) : null,
        account_type: account_type || null,
        note: note || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: { transaction_id: newTransaction.transaction_id },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};


export const getTransactionsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required in params",
      });
    }

    const cId = parseInt(company_id);

    // 1️⃣ Fetch all transactions for this company
    const transactions = await prisma.transactions.findMany({
      where: { company_id: cId },
      orderBy: { created_at: "desc" },
    });

    if (!transactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found for this company",
        data: [],
      });
    }

    // 2️⃣ Collect all vendor/customer IDs
    const vendorCustomerIds = [
      ...new Set(
        transactions
          .filter((t) =>
            ["vender", "vendor", "customer"].includes(
              String(t.from_type).toLowerCase()
            )
          )
          .map((t) => t.from_id)
      ),
    ];

    // 3️⃣ Fetch all vendor/customer details
    const vendorCustomers = await prisma.vendorscustomer.findMany({
      where: { id: { in: vendorCustomerIds } },
      select: {
        id: true,
        type: true,
        name_english: true,
        name_arabic: true,
        company_name: true,
      },
    });

    // Create lookup map for quick access
    const vendorMap = {};
    vendorCustomers.forEach((vc) => {
      vendorMap[vc.id] = vc;
    });

    // 4️⃣ Attach vendor/customer info to each transaction
    const result = transactions.map((tx) => ({
      ...tx,
      from_entity:
        vendorMap[tx.from_id] &&
        ["vender", "vendor", "customer"].includes(
          String(tx.from_type).toLowerCase()
        )
          ? {
              id: vendorMap[tx.from_id].id,
              type: vendorMap[tx.from_id].type,
              name_english: vendorMap[tx.from_id].name_english,
              name_arabic: vendorMap[tx.from_id].name_arabic,
              company_name: vendorMap[tx.from_id].company_name,
            }
          : null,
    }));

    // 5️⃣ Return response
    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};


export const getAllTransactions = async (req, res) => {
  try {
    // 1️⃣ Fetch all transactions
    const transactions = await prisma.transactions.findMany({
      orderBy: { created_at: "desc" },
    });

    if (!transactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found",
        data: [],
      });
    }

    // 2️⃣ Get all vendor/customer IDs from transactions
    const vendorCustomerIds = [
      ...new Set(
        transactions
          .filter((t) =>
            ["vender", "vendor", "customer"].includes(
              String(t.from_type).toLowerCase()
            )
          )
          .map((t) => t.from_id)
      ),
    ];

    // 3️⃣ Fetch their details
    const vendorCustomers = await prisma.vendorscustomer.findMany({
      where: { id: { in: vendorCustomerIds } },
      select: {
        id: true,
        type: true,
        name_english: true,
        name_arabic: true,
        company_name: true,
      },
    });

    // 4️⃣ Map for quick lookup
    const vendorMap = {};
    vendorCustomers.forEach((vc) => {
      vendorMap[vc.id] = vc;
    });

    // 5️⃣ Attach vendor/customer info to each transaction
    const result = transactions.map((tx) => ({
      ...tx,
      from_entity:
        vendorMap[tx.from_id] &&
        ["vender", "vendor", "customer"].includes(
          String(tx.from_type).toLowerCase()
        )
          ? vendorMap[tx.from_id]
          : null,
    }));

    // ✅ Send final response
    res.status(200).json({
      success: true,
      message: "All transactions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// ✅ Get All Transactions
// export const getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await prisma.transactions.findMany({
//       include: {
//         company: { select: { name: true } },
//       },
//     });

//     const enriched = await enrichTransactions(transactions);

//     return res.status(200).json({
//       success: true,
//       message: "Transactions fetched successfully",
//       data: enriched,
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch transactions",
//       error: error.message,
//     });
//   }
// };

// ✅ Get Transaction By ID
// export const getTransactionById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const txnId = parseInt(id);

//     const transaction = await prisma.transactions.findUnique({
//       where: { id: txnId },
//       include: {
//         company: { select: { name: true } },
//       },
//     });

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: "Transaction not found",
//       });
//     }

//     const [enriched] = await enrichTransactions([transaction]);

//     return res.status(200).json({
//       success: true,
//       message: "Transaction fetched successfully",
//       data: enriched,
//     });
//   } catch (error) {
//     console.error("Error fetching transaction by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch transaction",
//       error: error.message,
//     });
//   }
// };

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const txId = parseInt(id);

    // 1️⃣ Find the transaction
    const transaction = await prisma.transactions.findUnique({
      where: { id: txId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 2️⃣ If from_type is vendor/customer, fetch its details
    const fType = String(transaction.from_type).toLowerCase();
    let fromEntity = null;

    if (["vender", "vendor", "customer"].includes(fType)) {
      fromEntity = await prisma.vendorscustomer.findUnique({
        where: { id: transaction.from_id },
        select: {
          id: true,
          type: true,
          name_english: true,
          name_arabic: true,
          company_name: true,
        },
      });
    }

    // 3️⃣ Return response
    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: {
        ...transaction,
        from_entity: fromEntity,
      },
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};



// ✅ Update Transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const txnId = parseInt(id);
    const data = { ...req.body };

    if (data.amount !== undefined) data.amount = parseFloat(data.amount);
    if (data.company_id !== undefined) data.company_id = parseInt(data.company_id) || null;
    if (data.from_id !== undefined) data.from_id = parseInt(data.from_id) || null;

    const existing = await prisma.transactions.findUnique({ where: { id: txnId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const updated = await prisma.transactions.update({
      where: { id: txnId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};

// ✅ Delete Transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const txnId = parseInt(id);

    const existing = await prisma.transactions.findUnique({ where: { id: txnId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await prisma.transactions.delete({ where: { id: txnId } });

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};


// export const getLedger = async (req, res) => {


//   try {
//     const { 
//       company_id, 
//       account_type, 
//       from_type, 
//       from_id,
//       from_date, 
//       to_date, 
//       page = 1, 
//       limit = 50 
//     } = req.query;
    
//     const skip = (page - 1) * limit;
//     const limitNum = parseInt(limit);
    
//     // Build filters
//     const where = {};
    
//     if (company_id) where.company_id = parseInt(company_id);
//     if (account_type) where.account_type = account_type;
//     if (from_type) where.from_type = from_type;
//     if (from_id) where.from_id = parseInt(from_id);
    
//     // Build date filter - handle as string since schema defines it as String
//     if (from_date || to_date) {
//       where.date = {};
//       if (from_date) where.date.gte = from_date;
//       if (to_date) where.date.lte = to_date;
//     }
    
//     // Get transactions with pagination
//     const [transactions, total] = await Promise.all([
//       prisma.transactions.findMany({
//         where,
//         orderBy: [
//           { date: 'asc' },
//           { created_at: 'asc' }
//         ],
//         skip,
//         take: limitNum,
//         include: {
//           company: {
//             select: { id: true, name: true }
//           }
//         }
//       }),
//       prisma.transactions.count({ where })
//     ]);
    
//     if (!transactions.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No transactions found",
//         data: {
//           transactions: [],
//           opening_balance: 0,
//           closing_balance: 0,
//           total_debits: 0,
//           total_credits: 0
//         }
//       });
//     }
    
//     // Get all vendor/customer IDs from transactions
//     const vendorCustomerIds = [
//       ...new Set(
//         transactions
//           .filter(t => ["vender", "vendor", "customer"].includes(String(t.from_type).toLowerCase()))
//           .map(t => t.from_id)
//       )
//     ];
    
//     // Fetch vendor/customer details
//     const vendorCustomers = await prisma.vendorscustomer.findMany({
//       where: { id: { in: vendorCustomerIds } },
//       select: {
//         id: true,
//         type: true,
//         name_english: true,
//         name_arabic: true,
//         company_name: true,
//       },
//     });
    
//     // Create lookup map
//     const vendorMap = {};
//     vendorCustomers.forEach(vc => {
//       vendorMap[vc.id] = vc;
//     });
    
//     // Calculate opening balance (transactions before from_date)
//     let openingBalance = 0;
//     if (from_date) {
//       const openingTransactions = await prisma.transactions.findMany({
//         where: {
//           ...where,
//           date: { lt: from_date }
//         },
//         select: {
//           balance_type: true,
//           amount: true
//         }
//       });
      
//       openingTransactions.forEach(tx => {
//         const amount = parseFloat(tx.amount || 0);
//         // Fixed: Check actual balance_type field, not voucher_type
//         if (tx.balance_type === 'Debit') {
//           openingBalance -= amount;
//         } else {
//           openingBalance += amount;
//         }
//       });
//     }
    
//     // Enrich transactions with vendor/customer data and calculate running balance
//     let balance = openingBalance;
//     const ledgerWithBalance = transactions.map(tx => {
//       const amount = parseFloat(tx.amount || 0);
      
//       // Fixed: Use balance_type field for calculation
//       if (tx.balance_type === 'Debit') {
//         balance -= amount;
//       } else {
//         balance += amount;
//       }
      
//       return {
//         ...tx,
//         amount,
//         running_balance: balance,
//         from_entity: vendorMap[tx.from_id] && 
//           ["vender", "vendor", "customer"].includes(String(tx.from_type).toLowerCase())
//           ? vendorMap[tx.from_id]
//           : null,
//       };
//     });
    
//     // Calculate totals
//     let totalDebits = 0;
//     let totalCredits = 0;
    
//     ledgerWithBalance.forEach(tx => {
//       if (tx.balance_type === 'Debit') {
//         totalDebits += tx.amount;
//       } else {
//         totalCredits += tx.amount;
//       }
//     });
    
//     // Get closing balance
//     const closingBalance = ledgerWithBalance.length > 0 
//       ? ledgerWithBalance[ledgerWithBalance.length - 1].running_balance 
//       : openingBalance;
    
//     // Return flat array of transactions (not grouped by account_type)
//     res.status(200).json({
//       success: true,
//       message: "Ledger fetched successfully",
//       data: {
//         transactions: ledgerWithBalance,
//         opening_balance: openingBalance,
//         closing_balance: closingBalance,
//         total_debits: totalDebits,
//         total_credits: totalCredits
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch ledger",
//       error: error.message,
//     });
//   }
// };


// ✅ Get Ledger
// ✅ Get Ledger
// export const getLedger = async (req, res) => {
//   try {
//     const { 
//       company_id, 
//       account_type, 
//       from_type, 
//       from_id,
//       from_date, 
//       to_date, 
//       page = 1, 
//       limit = 50 
//     } = req.query;
    
//     const skip = (page - 1) * limit;
//     const limitNum = parseInt(limit);
    
//     // Build filters
//     const where = {};
    
//     if (company_id) where.company_id = parseInt(company_id);
//     if (account_type) where.account_type = account_type;
//     if (from_type) where.from_type = from_type;
//     if (from_id) where.from_id = parseInt(from_id);
    
//     // Build date filter - handle as string since schema defines it as String
//     if (from_date || to_date) {
//       where.date = {};
//       if (from_date) where.date.gte = from_date;
//       if (to_date) where.date.lte = to_date;
//     }
    
//     // Get transactions with pagination
//     const [transactions, total] = await Promise.all([
//       prisma.transactions.findMany({
//         where,
//         orderBy: [
//           { date: 'asc' },
//           { created_at: 'asc' }
//         ],
//         skip,
//         take: limitNum,
//         include: {
//           company: {
//             select: { id: true, name: true }
//           }
//         }
//       }),
//       prisma.transactions.count({ where })
//     ]);
    
//     if (!transactions.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No transactions found",
//         data: {
//           transactions: [],
//           opening_balance: 0,
//           closing_balance: 0,
//           total_debits: 0,
//           total_credits: 0
//         }
//       });
//     }
    
//     // Get all vendor/customer IDs from transactions
//     const vendorCustomerIds = [
//       ...new Set(
//         transactions
//           .filter(t => ["vender", "vendor", "customer"].includes(String(t.from_type).toLowerCase()))
//           .map(t => t.from_id)
//       )
//     ];
    
//     // Fetch vendor/customer details
//     const vendorCustomers = await prisma.vendorscustomer.findMany({
//       where: { id: { in: vendorCustomerIds } },
//       select: {
//         id: true,
//         type: true,
//         name_english: true,
//         name_arabic: true,
//         company_name: true,
//       },
//     });
    
//     // Create lookup map
//     const vendorMap = {};
//     vendorCustomers.forEach(vc => {
//       vendorMap[vc.id] = vc;
//     });
    
//     // Calculate opening balance (transactions before from_date)
//     let openingBalance = 0;
//     if (from_date) {
//       const openingTransactions = await prisma.transactions.findMany({
//         where: {
//           ...where,
//           date: { lt: from_date }
//         },
//         select: {
//           balance_type: true,
//           amount: true
//         }
//       });
      
//       openingTransactions.forEach(tx => {
//         const amount = parseFloat(tx.amount || 0);
//         // Treat "Make Payment" as debit (money going out)
//         if (tx.balance_type === 'Debit' || tx.balance_type === 'Make Payment') {
//           openingBalance -= amount;
//         } else {
//           openingBalance += amount;
//         }
//       });
//     }
    
//     // Enrich transactions with vendor/customer data and calculate running balance
//     let balance = openingBalance;
//     const ledgerWithBalance = transactions.map(tx => {
//       const amount = parseFloat(tx.amount || 0);
      
//       // Update running balance - treat "Make Payment" as debit
//       if (tx.balance_type === 'Debit' || tx.balance_type === 'Make Payment') {
//         balance -= amount;
//       } else {
//         balance += amount;
//       }
      
//       return {
//         ...tx,
//         amount,
//         running_balance: balance,
//         from_entity: vendorMap[tx.from_id] && 
//           ["vender", "vendor", "customer"].includes(String(tx.from_type).toLowerCase())
//           ? vendorMap[tx.from_id]
//           : null,
//       };
//     });
    
//     // Calculate totals
//     let totalDebits = 0;
//     let totalCredits = 0;
    
//     ledgerWithBalance.forEach(tx => {
//       // Treat "Make Payment" as debit
//       if (tx.balance_type === 'Debit' || tx.balance_type === 'Make Payment') {
//         totalDebits += tx.amount;
//       } else {
//         totalCredits += tx.amount;
//       }
//     });
    
//     // Get closing balance
//     const closingBalance = ledgerWithBalance.length > 0 
//       ? ledgerWithBalance[ledgerWithBalance.length - 1].running_balance 
//       : openingBalance;
    
//     res.status(200).json({
//       success: true,
//       message: "Ledger fetched successfully",
//       data: {
//         transactions: ledgerWithBalance,
//         opening_balance: openingBalance,
//         closing_balance: closingBalance,
//         total_debits: totalDebits,
//         total_credits: totalCredits
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch ledger",
//       error: error.message,
//     });
//   }
// };

// export const getLedger = async (req, res) => {
//   try {
//     const { 
//       company_id, 
//       account_type, 
//       from_type, 
//       from_id,
//       from_date, 
//       to_date, 
//       page = 1, 
//       limit = 50 
//     } = req.query;
    
//     const skip = (page - 1) * limit;
//     const limitNum = parseInt(limit);
    
//     // Build filters
//     const where = {};
    
//     if (company_id) where.company_id = parseInt(company_id);
//     if (account_type) where.account_type = account_type;
//     if (from_type) where.from_type = from_type;
//     if (from_id) where.from_id = parseInt(from_id);
    
//     // Build date filter - handle as string since schema defines it as String
//     if (from_date || to_date) {
//       where.date = {};
//       if (from_date) where.date.gte = from_date;
//       if (to_date) where.date.lte = to_date;
//     }
    
//     // Get transactions with pagination
//     const [transactions, total] = await Promise.all([
//       prisma.transactions.findMany({
//         where,
//         orderBy: [
//           { date: 'asc' },
//           { created_at: 'asc' }
//         ],
//         skip,
//         take: limitNum,
//         include: {
//           company: {
//             select: { id: true, name: true }
//           }
//         }
//       }),
//       prisma.transactions.count({ where })
//     ]);
    
//     if (!transactions.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No transactions found",
//         data: {
//           transactions: [],
//           opening_balance: 0,
//           closing_balance: 0,
//           total_debits: 0,
//           total_credits: 0
//         }
//       });
//     }
    
//     // Get all vendor/customer IDs from transactions
//     const vendorCustomerIds = [
//       ...new Set(
//         transactions
//           .filter(t => ["vender", "vendor", "customer"].includes(String(t.from_type).toLowerCase()))
//           .map(t => t.from_id)
//       )
//     ];
    
//     // Fetch vendor/customer details
//     const vendorCustomers = await prisma.vendorscustomer.findMany({
//       where: { id: { in: vendorCustomerIds } },
//       select: {
//         id: true,
//         type: true,
//         name_english: true,
//         name_arabic: true,
//         company_name: true,
//       },
//     });
    
//     // Create lookup map
//     const vendorMap = {};
//     vendorCustomers.forEach(vc => {
//       vendorMap[vc.id] = vc;
//     });
    
//     // Calculate opening balance (transactions before from_date)
//     let openingBalance = 0;
//     if (from_date) {
//       const openingTransactions = await prisma.transactions.findMany({
//         where: {
//           ...where,
//           date: { lt: from_date }
//         },
//         select: {
//           balance_type: true,
//           amount: true
//         }
//       });
      
//       openingTransactions.forEach(tx => {
//         const amount = parseFloat(tx.amount || 0);
//         // Treat "Make Payment" as debit (money going out)
//         if (tx.balance_type === 'Debit' || tx.balance_type === 'Make Payment') {
//           openingBalance -= amount;
//         } else {
//           openingBalance += amount;
//         }
//       });
//     }
    
//     // Enrich transactions with vendor/customer data and calculate running balance
//     let balance = openingBalance;
//     const ledgerWithBalance = transactions.map(tx => {
//       const amount = parseFloat(tx.amount || 0);
      
//       // Update running balance - treat "Make Payment" as debit
//       if (tx.balance_type === 'Debit' || tx.balance_type === 'Make Payment') {
//         balance -= amount;
//       } else {
//         balance += amount;
//       }
      
//       return {
//         ...tx,
//         amount,
//         running_balance: balance,
//         from_entity: vendorMap[tx.from_id] && 
//           ["vender", "vendor", "customer"].includes(String(tx.from_type).toLowerCase())
//           ? vendorMap[tx.from_id]
//           : null,
//       };
//     });
    
//     // Calculate totals
//     let totalDebits = 0;
//     let totalCredits = 0;
    
//     ledgerWithBalance.forEach(tx => {
//       // Treat "Make Payment" as debit
//       if (tx.balance_type === 'Debit' || tx.balance_type === 'Make Payment') {
//         totalDebits += tx.amount;
//       } else {
//         totalCredits += tx.amount;
//       }
//     });
    
//     // Get closing balance
//     const closingBalance = ledgerWithBalance.length > 0 
//       ? ledgerWithBalance[ledgerWithBalance.length - 1].running_balance 
//       : openingBalance;
    
//     res.status(200).json({
//       success: true,
//       message: "Ledger fetched successfully",
//       data: {
//         transactions: ledgerWithBalance,
//         opening_balance: openingBalance,
//         closing_balance: closingBalance,
//         total_debits: totalDebits,
//         total_credits: totalCredits
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch ledger",
//       error: error.message,
//     });
//   }
// };
export const getLedger = async (req, res) => {
  try {
    const { 
      company_id, 
      account_type, 
      from_type, 
      from_id,
      from_date, 
      to_date
    } = req.query;

    const where = {};

    if (company_id) where.company_id = parseInt(company_id);
    if (account_type) where.account_type = account_type;
    if (from_type) where.from_type = from_type;
    if (from_id) where.from_id = parseInt(from_id);

    if (from_date || to_date) {
      where.date = {};
      if (from_date) where.date.gte = from_date;
      if (to_date) where.date.lte = to_date;
    }

    const transactions = await prisma.transactions.findMany({
      where,
      orderBy: [
        { date: "asc" },
        { created_at: "asc" }
      ],
      include: {
        company: { select: { id: true, name: true } }
      }
    });

    if (!transactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found",
        data: {
          transactions: [],
          opening_balance: 0,
          closing_balance: 0,
          total_debits: 0,
          total_credits: 0
        }
      });
    }

    // Get vendor/customer list
    const vendorCustomerIds = [
      ...new Set(
        transactions
          .filter(t => ["vender", "vendor", "customer"].includes(String(t.from_type).toLowerCase()))
          .map(t => t.from_id)
      )
    ];

    const vendorCustomers = await prisma.vendorscustomer.findMany({
      where: { id: { in: vendorCustomerIds } },
      select: {
        id: true,
        type: true,
        name_english: true,
        company_name: true
      }
    });

    const vendorMap = {};
    vendorCustomers.forEach(v => vendorMap[v.id] = v);

    // Opening balance
    let openingBalance = 0;

    if (from_date) {
      const openingTx = await prisma.transactions.findMany({
        where: { ...where, date: { lt: from_date } },
        select: { balance_type: true, amount: true }
      });

      openingTx.forEach(tx => {
        const amt = parseFloat(tx.amount || 0);
        if (tx.balance_type === "Make Payment" || tx.balance_type === "Debit") {
          openingBalance -= amt;
        } else {
          openingBalance += amt;
        }
      });
    }

    // Build Ledger View
    let balance = openingBalance;
    let totalDebits = 0;
    let totalCredits = 0;

    const ledger = transactions.map(tx => {
      const amount = parseFloat(tx.amount || 0);

      let debit = 0;
      let credit = 0;

      if (tx.balance_type === "Make Payment" || tx.balance_type === "Debit") {
        debit = amount;
        balance -= amount;
        totalDebits += amount;
      } else {
        credit = amount;
        balance += amount;
        totalCredits += amount;
      }

      const entity = vendorMap[tx.from_id];
      const from_to = entity
        ? (entity.company_name || entity.name_english)
        : "";

      const balanceType = balance >= 0 ? "Cr" : "Dr";
      const formattedBalance = Math.abs(balance) + " " + balanceType;

      return {
        id: tx.id,
        date: tx.date,
        voucher_type: tx.voucher_type,
        voucher_no: tx.voucher_no,
        from_to,
        debit,
        credit,
        balance: formattedBalance
      };
    });

    const closingBalance = balance;

    res.status(200).json({
      success: true,
      message: "Ledger fetched successfully",
      data: {
        transactions: ledger,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        total_debits: totalDebits,
        total_credits: totalCredits
      }
    });

  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ledger",
      error: error.message
    });
  }
};
