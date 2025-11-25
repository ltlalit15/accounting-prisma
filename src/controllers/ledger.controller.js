import prisma from "../config/db.js";

export const getLedgerReport = async (req, res) => {
  try {
    const company_id = Number(req.params.company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    let rows = [];

    // ----------------------------------------------------
    // 1️⃣ SALES INVOICE (pos_invoices)
    // ----------------------------------------------------
    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id },
      include: { customer: true }
    });

    invoices.forEach(v => {
  const row = {
    id: v.id,
    date: v.created_at,
    voucher_type: "Invoice",
    voucher_no: `INV-${v.id}`,
    from_to: v.customer?.name_english || "Customer",
    narration: `Sales to ${v.customer?.name_english || ""}`,
    debit: 0,
    credit: Number(v.total),
  };

  row.balance = row.credit - row.debit;

  rows.push(row);
});

    // ----------------------------------------------------
    // 2️⃣ PAYMENT (expensevouchers)
    // ----------------------------------------------------
    const payments = await prisma.expensevouchers.findMany({
      where: { company_id }
    });

   payments.forEach(v => {
  const row = {
    id: v.id,
    date: v.voucher_date,
    voucher_type: "Payment",
    voucher_no: v.auto_receipt_no,
    from_to: v.narration || "",
    narration: v.narration || "",
    debit: Number(v.total_amount),
    credit: 0,
  };

  row.balance = row.credit - row.debit;

  rows.push(row);
});

    // ----------------------------------------------------
    // 3️⃣ RECEIPTS (income_vouchers)
    // ----------------------------------------------------
    const receipts = await prisma.income_vouchers.findMany({
      where: { company_id }
    });

    receipts.forEach(v => {
  const row = {
    id: v.id,
    date: v.voucher_date,
    voucher_type: "Receipt",
    voucher_no: v.auto_receipt_no,
    from_to: v.narration || "",
    narration: v.narration || "",
    debit: 0,
    credit: Number(v.total_amount),
  };

  row.balance = row.credit - row.debit;

  rows.push(row);
});

    // ----------------------------------------------------
    // 4️⃣ CREDIT NOTE (sales_return)
    // ----------------------------------------------------
    const creditNotes = await prisma.sales_return.findMany({
      where: { company_id }
    });

    creditNotes.forEach(v => {
  const row = {
    id: v.id,
    date: v.return_date,
    voucher_type: "Credit Note",
    voucher_no: v.return_no,
    from_to: v.reason_for_return || "",
    narration: v.narration || "",
    debit: Number(v.grand_total),
    credit: 0,
  };

  row.balance = row.credit - row.debit;

  rows.push(row);
});

    // ----------------------------------------------------
    // 5️⃣ DEBIT NOTE (purchase_return)
    // ----------------------------------------------------
    const debitNotes = await prisma.purchase_return.findMany({
      where: { company_id }
    });

    debitNotes.forEach(v => {
  const row = {
    id: v.id,
    date: v.return_date,
    voucher_type: "Debit Note",
    voucher_no: v.return_no,
    from_to: v.reason_for_return || "",
    narration: v.reason_for_return || "",
    debit: 0,
    credit: Number(v.grand_total),
  };

  row.balance = row.credit - row.debit;

  rows.push(row);
});

    // ----------------------------------------------------
    // SORT BY DATE ASC → FOR CORRECT RUNNING BALANCE
    // ----------------------------------------------------
    // rows.sort((a, b) => new Date(a.date) - new Date(b.date));

    // let balance = 0;
    // rows = rows.map(r => {
    //   balance += Number(r.credit) - Number(r.debit);
    //   return {
    //     ...r,
    //     balance: `${balance} Cr`,
    //   };
    // });

    // ----------------------------------------------------
    // SORT BACK DESC → MATCH UI
    // ----------------------------------------------------
    // rows.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json({
      success: true,
      total_entries: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


// export const getLedgerVoucherDetails = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "id is required"
//       });
//     }

//     let data;

//     // ------------------------------
//     // 1️⃣ INVOICE (pos_invoices)
//     // ------------------------------
//     data = await prisma.pos_invoices.findUnique({
//       where: { id },
//       include: { customer: true }
//     });

//     if (data) {
//       return res.json({
//         success: true,
//         type: "Invoice",
//         details: {
//           date: data.created_at,
//           voucher_type: "Invoice",
//           voucher_no: `INV-${data.id}`,
//           from: data.customer?.name_english || "",
//           narration: `Sales to ${data.customer?.name_english || ""}`,
//           debit: 0,
//           credit: Number(data.total),
//           balance: 
//         }
//       });
//     }

//     // ------------------------------
//     // 2️⃣ PAYMENT (expensevouchers)
//     // ------------------------------
//     data = await prisma.expensevouchers.findUnique({ where: { id } });

//     if (data) {
//       return res.json({
//         success: true,
//         type: "Payment",
//         details: {
//           date: data.voucher_date,
//           voucher_type: "Payment",
//           voucher_no: data.auto_receipt_no,
//           from: data.narration || "",
//           narration: data.narration || "",
//           debit: Number(data.total_amount),
//           credit: 0,
//           balance: -Number(data.total_amount)
//         }
//       });
//     }

//     // ------------------------------
//     // 3️⃣ RECEIPT (income_vouchers)
//     // ------------------------------
//     data = await prisma.income_vouchers.findUnique({ where: { id } });

//     if (data) {
//       return res.json({
//         success: true,
//         type: "Receipt",
//         details: {
//           date: data.voucher_date,
//           voucher_type: "Receipt",
//           voucher_no: data.auto_receipt_no,
//           from: data.narration || "",
//           narration: data.narration || "",
//           debit: 0,
//           credit: Number(data.total_amount),
//           balance: Number(data.total_amount)
//         }
//       });
//     }

//     // ------------------------------
//     // 4️⃣ CREDIT NOTE (sales_return)
//     // ------------------------------
//     data = await prisma.sales_return.findUnique({ where: { id } });

//     if (data) {
//       return res.json({
//         success: true,
//         type: "Credit Note",
//         details: {
//           date: data.return_date,
//           voucher_type: "Credit Note",
//           voucher_no: data.return_no,
//           from: data.reason_for_return || "",
//           narration: data.reason_for_return || "",
//           debit: Number(data.grand_total),
//           credit: 0,
//           balance: -Number(data.grand_total)
//         }
//       });
//     }

//     // ------------------------------
//     // 5️⃣ DEBIT NOTE (purchase_return)
//     // ------------------------------
//     data = await prisma.purchase_return.findUnique({ where: { id } });

//     if (data) {
//       return res.json({
//         success: true,
//         type: "Debit Note",
//         details: {
//           date: data.return_date,
//           voucher_type: "Debit Note",
//           voucher_no: data.return_no,
//           from: data.reason_for_return || "",
//           narration: data.reason_for_return || "",
//           debit: 0,
//           credit: Number(data.grand_total),
//           balance: Number(data.grand_total)
//         }
//       });
//     }

//     return res.json({
//       success: false,
//       message: "No voucher found with this ID"
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

export const getLedgerVoucherDetails = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required"
      });
    }

    let data;

    // ------------------------------
    // 1️⃣ INVOICE (pos_invoices)
    // ------------------------------
    data = await prisma.pos_invoices.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (data) {
      const debit = 0;
      const credit = Number(data.total);

      return res.json({
        success: true,
        type: "Invoice",
        details: {
          date: data.created_at,
          voucher_type: "Invoice",
          voucher_no: `INV-${data.id}`,
          from: data.customer?.name_english || "",
          narration: `Sales to ${data.customer?.name_english || ""}`,
          debit,
          credit,
          balance: credit - debit
        }
      });
    }

    // ------------------------------
    // 2️⃣ PAYMENT (expensevouchers)
    // ------------------------------
    data = await prisma.expensevouchers.findUnique({ where: { id } });

    if (data) {
      const debit = Number(data.total_amount);
      const credit = 0;

      return res.json({
        success: true,
        type: "Payment",
        details: {
          date: data.voucher_date,
          voucher_type: "Payment",
          voucher_no: data.auto_receipt_no,
          from: data.narration || "",
          narration: data.narration || "",
          debit,
          credit,
          balance: credit - debit
        }
      });
    }

    // ------------------------------
    // 3️⃣ RECEIPT (income_vouchers)
    // ------------------------------
    data = await prisma.income_vouchers.findUnique({ where: { id } });

    if (data) {
      const debit = 0;
      const credit = Number(data.total_amount);

      return res.json({
        success: true,
        type: "Receipt",
        details: {
          date: data.voucher_date,
          voucher_type: "Receipt",
          voucher_no: data.auto_receipt_no,
          from: data.narration || "",
          narration: data.narration || "",
          debit,
          credit,
          balance: credit - debit
        }
      });
    }

    // ------------------------------
    // 4️⃣ CREDIT NOTE (sales_return)
    // ------------------------------
    data = await prisma.sales_return.findUnique({ where: { id } });

    if (data) {
      const debit = Number(data.grand_total);
      const credit = 0;

      return res.json({
        success: true,
        type: "Credit Note",
        details: {
          date: data.return_date,
          voucher_type: "Credit Note",
          voucher_no: data.return_no,
          from: data.reason_for_return || "",
          narration: data.narration || "",
          debit,
          credit,
          balance: credit - debit
        }
      });
    }

    // ------------------------------
    // 5️⃣ DEBIT NOTE (purchase_return)
    // ------------------------------
    data = await prisma.purchase_return.findUnique({ where: { id } });

    if (data) {
      const debit = 0;
      const credit = Number(data.grand_total);

      return res.json({
        success: true,
        type: "Debit Note",
        details: {
          date: data.return_date,
          voucher_type: "Debit Note",
          voucher_no: data.return_no,
          from: data.reason_for_return || "",
          narration: data.reason_for_return || "",
          debit,
          credit,
          balance: credit - debit
        }
      });
    }

    return res.json({
      success: false,
      message: "No voucher found with this ID"
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
};


