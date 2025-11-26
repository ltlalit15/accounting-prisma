import prisma from "../config/db.js";
// export const getPurchaseTaxReport = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     // Fetch all purchase orders for company
//     const purchaseOrders = await prisma.purchaseorder.findMany({
//       where: { company_id: Number(company_id) },
//       include: {
//         purchaseorderitems: true
//       },
//       orderBy: { created_at: "desc" }
//     });

//     const result = [];

//     for (const order of purchaseOrders) {
//       // Get vendor record
//       const vendor = await prisma.vendorscustomer.findFirst({
//         where: {
//           company_id: Number(company_id),
//           name_english: order.bill_to_vendor_name
//         }
//       });

//       // Get payment method from transactions table
//       const payment = await prisma.transactions.findFirst({
//         where: {
//           company_id: Number(company_id),
//           voucher_no: order.Bill_no // linking using reference on UI
//         }
//       });

//       result.push({
//         reference: order.Bill_no || order.ref_no,
//         vendor: vendor?.name_english || "-",
//         vendor_arabic: vendor?.name_arabic || "-",
//         date: order.created_at,
//         amount: order.total,
//         payment_method: payment?.from_type || "-",
//         discount: order.discount,
//         tax_amount: order.tax
//       });
//     }

//     res.json({
//       success: true,
//       total_results: result.length,
//       data: result
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error generating purchase tax report"
//     });
//   }
// };


export const getPurchaseTaxReport = async (req, res) => {
  try {
    const { company_id } = req.params;

    const purchaseOrders = await prisma.purchaseorder.findMany({
      where: { company_id: Number(company_id) },
      orderBy: { created_at: "desc" }
    });

    const result = [];

    for (const order of purchaseOrders) {
      // 1️⃣ Vendor Name directly from Purchase Order
      const vendorName =
        order.quotation_from_vendor_name ||
        order.bill_to_vendor_name ||
        order.payment_made_vendor_name ||
        null;

      // 2️⃣ Fetch Vendor Arabic name from vendorscustomer table if vendorName exists
      let vendorArabic = "-";
      if (vendorName) {
        const matchedVendor = await prisma.vendorscustomer.findFirst({
          where: {
            company_id: Number(company_id),
            OR: [
              { company_name: vendorName },
              { name_english: vendorName }
            ]
          },
          select: {
            name_arabic:true
          }
        });

        if (matchedVendor?.name_arabic) {
          vendorArabic = matchedVendor.name_arabic;
        }
      }

      // 3️⃣ Lookup payment method
      const referenceForPayment =
        order.Bill_no ||
        order.Manual_Bill_no ||
        order.ref_no ||
        order.PO_no ||
        null;

      let paymentMethod = "-";
      if (referenceForPayment) {
        const payment = await prisma.transactions.findFirst({
          where: {
            company_id: Number(company_id),
            voucher_no: referenceForPayment
          }
        });

        if (payment?.from_type) {
          paymentMethod = payment.from_type;
        }
      }

      // 4️⃣ Push final formatted row
      result.push({
        reference: referenceForPayment || "-",
        vendor: vendorName || "-",
        vendor_arabic: vendorArabic,
        date: order.created_at,
        amount: Number(order.total),
        payment_method: paymentMethod,
        discount: Number(order.discount || 0),
        tax_amount: Number(order.tax || 0)
      });
    }

    return res.json({
      success: true,
      total_results: result.length,
      data: result
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error generating purchase tax report",
      error: error.message
    });
  }
};



// export const getSalesTaxReport = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     // Fetch invoices
//     const invoices = await prisma.pos_invoices.findMany({
//       where: { company_id: Number(company_id) },
//       include: {
//         products: true,
//         customer: true,
//         tax_class: true
//       },
//       orderBy: { created_at: "desc" }
//     });

//     const result = [];

//     for (const invoice of invoices) {
//       // Calculate item-level tax
//       let taxAmount = 0;
//       for (const row of invoice.products) {
//         const percent = Number(invoice.tax_class?.tax_value) || 0;
//         taxAmount += Number(row.quantity) * Number(row.price) * (percent / 100);
//       }

//       // Find payment method inside transaction table
//       const payment = await prisma.transactions.findFirst({
//         where: {
//           company_id: Number(company_id),
//           voucher_no: invoice.id.toString()
//         }
//       });

//       result.push({
//         reference: invoice.id,
//         customer: invoice.customer?.name_english || "-",
//         customer_arabic: invoice.customer?.name_arabic || "-",
//         date: invoice.created_at,
//         amount: invoice.total,
//         payment_method: payment?.from_type || "-",
//         discount: Number(invoice.subtotal) - Number(invoice.total) + taxAmount,
//         tax_amount: taxAmount
//       });
//     }

//     res.json({
//       success: true,
//       total_results: result.length,
//       data: result
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error generating sales tax report"
//     });
//   }
// };


export const getSalesTaxReport = async (req, res) => {
  try {
    const { company_id } = req.params;

    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id: Number(company_id) },
      include: {
        products: true,      // just in case you need them later
        customer: true,
        tax_class: true      // to get tax_value %
      },
      orderBy: { created_at: "desc" }
    });


    const result = [];

    for (const invoice of invoices) {
      // 🔹 1) Calculate tax from tax_class
      const taxRate = Number(invoice.tax_class?.tax_value || 0); // e.g. 5, 12, 18
      const subtotal = Number(invoice.subtotal || 0);
      const total = Number(invoice.total || 0);

      const taxAmount = (subtotal * taxRate) / 100;

      // 🔹 2) Calculate discount (always positive for report)
      // Formula (if system is: total = subtotal + tax - discount)
      // discount = subtotal + tax - total
      let discountAmount = subtotal + taxAmount - total;

      // avoid negative sign in report – user wants positive discount column
      if (discountAmount < 0) discountAmount = discountAmount * -1;

      // 🔹 3) Get payment method (if transactions exist)
      const referenceNo = invoice.invoice_no ?? invoice.id.toString();

      const payment = await prisma.transactions.findFirst({
        where: {
          company_id: Number(company_id),
          voucher_no: referenceNo
        }
      });

      result.push({
        reference: referenceNo,
        customer: invoice.customer?.name_english || "-",
        customer_arabic: invoice.customer?.name_arabic || "-",
        date: invoice.created_at,
        amount: invoice.total,              // will come as Decimal/ string from Prisma
        payment_method: payment?.from_type || "-",
        discount: Number(discountAmount.toFixed(2)),
        tax_amount: Number(taxAmount.toFixed(2))
      });
    }

    res.json({
      success: true,
      total_results: result.length,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error generating sales tax report"
    });
  }
};