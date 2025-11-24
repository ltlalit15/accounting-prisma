import prisma from "../config/db.js";
export const getPOSReport = async (req, res) => {
  try {
    const company_id = Number(req.query.company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    // 1️⃣ Fetch all invoices + products + tax class
    const invoices = await prisma.pos_invoices.findMany({
      where: { company_id },
      include: {
        products: {
          include: {
            product: true,
            warehouse: true,
          },
        },
        customer: true,
        tax_class: true,
      },
      orderBy: { id: "desc" },
    });

    let totalInvoices = invoices.length;
    let totalAmount = 0;
    let totalGST = 0;

    const table = [];

    invoices.forEach((invoice) => {
      // Extract date & time
      const time = new Date(invoice.created_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      invoice.products.forEach((p) => {
        const amount = Number(p.price) * Number(p.quantity);
        const gstRate = Number(invoice.tax_class?.tax_value || 0);
        const gstAmount = (amount * gstRate) / 100;
        const totalWithGST = amount + gstAmount;

        totalAmount += totalWithGST;
        totalGST += gstAmount;

        table.push({
          invoiceNo: "INV" + invoice.id,
          product: p.product?.item_name || "",
          paymentType: invoice.payment_status || "",
          time,
          amount,
          gst: gstAmount,
          total: totalWithGST,
        });
      });
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalInvoices,
        totalAmount,
        totalGST,
      },
      table,
    });
  } catch (error) {
    console.error("POS Report Error", error);
    return res.status(500).json({
      success: false,
      message: "Error generating POS report",
      error: error.message,
    });
  }
};
