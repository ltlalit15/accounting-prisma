import prisma from "../config/db.js";
export const getVatSummary = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    const cid = Number(company_id);

    // --------------------------------------------------
    // 1️⃣ OUTWARD SUPPLIES → SALES RETURN
    // --------------------------------------------------

    const salesReturns = await prisma.sales_return.findMany({
      where: { company_id: cid },
    });

    let outwardTaxable = 0;
    let outwardVat = 0;
    let outwardRate = 0;

    salesReturns.forEach((sr) => {
      const taxable = Number(sr.sub_total || 0);
      const vat = Number(sr.tax_total || 0);

      outwardTaxable += taxable;
      outwardVat += vat;

      outwardRate =
        taxable > 0 ? (vat / taxable) * 100 : 0;
    });

    // --------------------------------------------------
    // 2️⃣ INWARD SUPPLIES → PURCHASE RETURN
    // --------------------------------------------------

    const purchaseReturns = await prisma.purchase_return.findMany({
      where: { company_id: cid },
    });

    let inwardTaxable = 0;
    let inwardVat = 0;
    let inwardRate = 0;

    purchaseReturns.forEach((pr) => {
      const taxable = Number(pr.sub_total || 0);
      const vat = Number(pr.tax_total || 0);

      inwardTaxable += taxable;
      inwardVat += vat;

      inwardRate =
        taxable > 0 ? (vat / taxable) * 100 : 0;
    });

    // --------------------------------------------------
    // 3️⃣ ADJUSTMENTS → FROM adjustments + items
    // --------------------------------------------------

    const adjustments = await prisma.adjustments.findMany({
      where: { company_id: cid },
      include: {
        adjustment_items: true,
      },
    });

    let adjustmentTaxable = 0;

    for (const adj of adjustments) {
      if (adj.total_value) {
        adjustmentTaxable += Number(adj.total_value);
      } else {
        adj.adjustment_items.forEach((itm) => {
          const amount =
            Number(itm.quantity || 0) * Number(itm.rate || 0);
          adjustmentTaxable += amount;
        });
      }
    }

    // VAT DOES NOT APPLY IN ADJUSTMENT (usually).
    const adjustmentVat = 0;
    const adjustmentRate = 0;

    // --------------------------------------------------
    // 4️⃣ EXEMPT SUPPLIES → ZERO VAT
    // --------------------------------------------------

    const zeroRated = await prisma.pos_invoices.findMany({
      where: {
        company_id: cid,
        tax_class: { tax_value: 0 },
      },
      include: { tax_class: true },
    });

    let exemptTaxable = 0;
    zeroRated.forEach((inv) => {
      exemptTaxable += Number(inv.subtotal || 0);
    });

    // --------------------------------------------------
    // FINAL STRUCTURE
    // --------------------------------------------------

    const vatSummary = [
      {
        type: "Outward Supplies",
        description: "Sales Return",
        taxableAmount: outwardTaxable,
        vatRate: outwardRate,
        vatAmount: outwardVat,
      },
      {
        type: "Inward Supplies",
        description: "Purchase Return",
        taxableAmount: inwardTaxable,
        vatRate: inwardRate,
        vatAmount: inwardVat,
      },
      {
        type: "Adjustments",
        description: "Stock / value adjustments",
        taxableAmount: adjustmentTaxable,
        vatRate: adjustmentRate,
        vatAmount: adjustmentVat,
      },
      {
        type: "Exempt Supplies",
        description: "Zero tax value invoices",
        taxableAmount: exemptTaxable,
        vatRate: 0,
        vatAmount: 0,
      },
    ];

    return res.json({ success: true, vatSummary });

  } catch (err) {
    console.error("VAT Summary Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
