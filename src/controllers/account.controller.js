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
    const account_id = Number(req.params.account_id);
    const company_id = Number(req.params.company_id);

    if (!account_id || !company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id & account_id required" });
    }

    // ---------------- OPENING BALANCE ----------------
    const accountInfo = await prisma.accounts.findFirst({
      where: { id: account_id, company_id },
      select: { accountBalance: true },
    });

    // ---------------- VENDOR / CUSTOMER (by account_id) ----------------
    const party = await prisma.vendorscustomer.findFirst({
      where: { account_id: account_id, company_id },
      select: {
        id: true,
        name_english: true,
        type: true,
        account_type: true,
        account_name: true,
        creation_date: true,
      },
    });

    const partyInfo = party
      ? {
          vendor_customer_id: party.id,
          vendor_customer_name: party.name_english,
          account_type: party.account_type,
          account_name: party.account_name,
        }
      : {
          vendor_customer_id: null,
          vendor_customer_name: null,
          account_type: null,
          account_name: null,
        };

    let rows = [];

    // ---------------- 1) VOUCHERS ----------------
    const vouchers = await prisma.vouchers.findMany({
      where: {
        company_id,
        OR: [{ from_account: account_id }, { to_account: account_id }],
      },
    });

    vouchers.forEach((v) => {
      const isDebit = v.from_account === account_id;
      rows.push({
        date: v.date,
        vch_type: v.voucher_type,
        debit: isDebit ? Number(v.transfer_amount) : 0,
        credit: isDebit ? 0 : Number(v.transfer_amount),
        ...partyInfo,
      });
    });

    // ---------------- 2) CONTRA ----------------
    const contra = await prisma.contra_vouchers.findMany({
      where: {
        company_id,
        OR: [{ account_from_id: account_id }, { account_to_id: account_id }],
      },
    });

    contra.forEach((c) => {
      const isDebit = c.account_from_id === account_id;
      rows.push({
        date: c.voucher_date,
        vch_type: "Contra",
        debit: isDebit ? Number(c.amount) : 0,
        credit: isDebit ? 0 : Number(c.amount),
        ...partyInfo,
      });
    });

    // ---------------- 3) INCOME ----------------
    const income = await prisma.income_voucher_entries.findMany({
      where: {
        income_vouchers: { company_id },
        income_account: String(account_id),
      },
      include: { income_vouchers: true },
    });

    income.forEach((i) => {
      rows.push({
        date: i.income_vouchers.voucher_date,
        vch_type: "Income",
        debit: 0,
        credit: Number(i.amount),
        ...partyInfo,
      });
    });

    // ---------------- 4) EXPENSE ----------------
    const expense = await prisma.expensevouchers.findMany({
      where: { company_id, paid_from_account_id: account_id },
    });

    expense.forEach((e) => {
      rows.push({
        date: e.voucher_date,
        vch_type: "Expense",
        debit: Number(e.total_amount),
        credit: 0,
        ...partyInfo,
      });
    });

    // ---------------- 5) POS INVOICE ----------------
    const posInvoices = await prisma.pos_invoices.findMany({
      where: { company_id },
    });

    posInvoices.forEach((p) => {
      if (p.payment_status === "Paid") {
        rows.push({
          date: p.created_at,
          vch_type: "POS",
          debit: 0,
          credit: Number(p.total),
          ...partyInfo,
        });
      }
    });

    // ---------------- 6) SALES RETURN ----------------
    const salesReturn = await prisma.sales_return.findMany({
      where: { company_id },
    });

    salesReturn.forEach((s) => {
      rows.push({
        date: s.return_date,
        vch_type: "Sales Return",
        debit: Number(s.grand_total),
        credit: 0,
        ...partyInfo,
      });
    });

    // ---------------- 7) PURCHASE ORDER ----------------
    const purchaseOrders = await prisma.purchaseorder.findMany({
      where: { company_id },
    });

    purchaseOrders.forEach((p) => {
      rows.push({
        date: p.created_at,
        vch_type: "Purchase Order",
        debit: 0,
        credit: Number(p.total),
        ...partyInfo,
      });
    });

    // ---------------- 8) PURCHASE RETURN ----------------
    const purchaseReturn = await prisma.purchase_return.findMany({
      where: { company_id },
    });

    purchaseReturn.forEach((p) => {
      rows.push({
        date: p.return_date,
        vch_type: "Purchase Return",
        debit: Number(p.grand_total),
        credit: 0,
        ...partyInfo,
      });
    });

    // ---------------- 9) ADJUSTMENTS ----------------
    const adjustments = await prisma.adjustments.findMany({
      where: { company_id },
    });

    adjustments.forEach((a) => {
      rows.push({
        date: a.voucher_date,
        vch_type: "Adjustment",
        debit: Number(a.total_value),
        credit: 0,
        ...partyInfo,
      });
    });

    // ---------------- 10) JOURNAL ----------------
    const journal = await prisma.transactions.findMany({
      where: { company_id },
    });

    journal.forEach((j) => {
      if (Number(j.from_id) === account_id) {
        rows.push({
          date: j.date,
          vch_type: j.voucher_type,
          debit: Number(j.amount),
          credit: 0,
          ...partyInfo,
        });
      }

      if (Number(j.balance_type) === account_id) {
        rows.push({
          date: j.date,
          vch_type: j.voucher_type,
          debit: 0,
          credit: Number(j.amount),
          ...partyInfo,
        });
      }
    });

    // If party exists, add a creation/opening row containing party details (inside ledger)

    // ---------------- SORT & RUNNING BALANCE ----------------
    rows.sort((a, b) => new Date(a.date) - new Date(b.date));

    let running = Number(accountInfo?.accountBalance || 0);
    rows = rows.map((r) => {
      running = running + r.credit - r.debit;
      return { ...r, running_balance: running.toFixed(2) };
    });

    // ---------------- RESPONSE ----------------
    return res.json({
      success: true,
      account_id: account_id,
      opening_balance: Number(accountInfo?.accountBalance || 0),
      closing_balance: running.toFixed(2),
      ledger: rows,
    });
  } catch (err) {
    console.log(err);
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
