import prisma from "../config/db.js";

// export const getInventorySummary = async (req, res) => {
//   try {
//     const { companyId, search, page = 1, limit = 10 } = req.query;

//     const whereClause = {
//       product: { company_id: Number(companyId) },
//       ...(search && {
//         OR: [
//           { product: { item_name: { contains: search } } },
//           { product: { sku: { contains: search } } },
//           { warehouse: { warehouse_name: { contains: search } } },
//         ],
//       }),
//     };

//     const totalCount = await prisma.product_warehouses.count({ where: whereClause });

//     const rows = await prisma.product_warehouses.findMany({
//       where: whereClause,
//       include: {
//         product: {
//           select: {
//             id: true,
//             item_name: true,
//             sku: true,
//             sale_price: true,
//             purchase_price: true,
//             total_stock: true,
//             min_order_qty: true,
//           }
//         },
//         warehouse: true,
//       },
//       skip: (page - 1) * limit,
//       take: Number(limit),
//     });

//     const formatted = rows.map((r) => {
//       const price = Number(r.product.sale_price || r.product.purchase_price || 0);
//       const closing = Number(r.stock_qty || 0);
//       let status = "In Stock";
//       if (closing <= 0) status = "Out of Stock";
//       else if (closing <= (r.product.min_order_qty || 0)) status = "Low Stock";

//       return {
//         id: r.id,
//         productId: r.product_id,
//         productName: r.product.item_name,
//         sku: r.product.sku,
//         warehouse: r.warehouse.warehouse_name,
//         warehouseId: r.warehouse_id,
//         opening: r.product.total_stock, 
//         inward: 0, 
//         outward: 0, 
//         closing: closing,
//         price: price,
//         totalValue: closing * price,
//         status,
//       };
//     });

//     res.json({
//       success: true,
//       data: formatted,
//       pagination: {
//         page: Number(page),
//         limit: Number(limit),
//         totalCount,
//         totalPages: Math.ceil(totalCount / limit),
//       }
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getInventorySummary = async (req, res) => {
  try {
    const { companyId, search, page = 1, limit = 10 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    // ----------------- FILTER -----------------
    const whereClause = {
      product: { company_id: Number(companyId) },
      ...(search && {
        OR: [
          { product: { item_name: { contains: search } } },
          { product: { sku: { contains: search } } },
          { warehouse: { warehouse_name: { contains: search } } },
        ],
      }),
    };

    const totalCount = await prisma.product_warehouses.count({
      where: whereClause,
    });

    const mappings = await prisma.product_warehouses.findMany({
      where: whereClause,
      include: {
        product: true,
        warehouse: true,
      },
      skip: (page - 1) * limit,
      take: Number(limit),
    });

    let summary = [];

    for (const m of mappings) {
      const productId = m.product_id;
      const warehouseId = m.warehouse_id;

      // Opening stock
      const opening = Number(m.stock_qty || 0);

      // ------------------ INWARD ------------------

      const inwardPurchase = await prisma.purchaseorderitems.aggregate({
        _sum: { qty: true },
        where: {
          item_name: m.product.item_name,
          purchaseorder: { company_id: Number(companyId) },
        },
      });

      const inwardTransfer = await prisma.transfer_items.aggregate({
        _sum: { qty: true },
        where: {
          product_id: productId,
          transfers: { destination_warehouse_id: warehouseId },
        },
      });

      const inwardAdjustment = await prisma.adjustment_items.aggregate({
        _sum: { quantity: true },
        where: {
          product_id: productId,
          warehouse_id: warehouseId,
          adjustments: {
            company_id: Number(companyId),
            adjustment_type: "Increase",
          },
        },
      });

      const inward =
        Number(inwardPurchase._sum.qty || 0) +
        Number(inwardTransfer._sum.qty || 0) +
        Number(inwardAdjustment._sum.quantity || 0);

      // ------------------ OUTWARD ------------------

      const outwardSales = await prisma.pos_invoice_products.aggregate({
        _sum: { quantity: true },
        where: {
          product_id: productId,
          warehouse_id: warehouseId,
        },
      });

      const outwardTransfer = await prisma.transfer_items.aggregate({
        _sum: { qty: true },
        where: {
          product_id: productId,
          source_warehouse_id: warehouseId,
        },
      });

      const outwardAdjustment = await prisma.adjustment_items.aggregate({
        _sum: { quantity: true },
        where: {
          product_id: productId,
          warehouse_id: warehouseId,
          adjustments: {
            company_id: Number(companyId),
            adjustment_type: "Decrease",
          },
        },
      });

      const outward =
        Number(outwardSales._sum.quantity || 0) +
        Number(outwardTransfer._sum.qty || 0) +
        Number(outwardAdjustment._sum.quantity || 0);

      // ------------------ CLOSING ------------------
      const closing = Number(opening + inward - outward);

      // ------------------ PRICE ------------------
      const price = Number(
        m.product.sale_price || m.product.purchase_price || 0
      );

      const totalValue = Number(closing * price);

      // ------------------ STATUS ------------------
      let status = "In Stock";
      if (closing <= 0) status = "Out of Stock";
      else if (closing <= (m.product.min_order_qty || 0))
        status = "Low Stock";

      // ------------------ PUSH RESULT ------------------
      summary.push({
        id: m.id,
        productId,
        productName: m.product.item_name,
        sku: m.product.sku,
        warehouse: m.warehouse?.warehouse_name,
        opening: Number(opening),
        inward: Number(inward),
        outward: Number(outward),
        closing: Number(closing),
        price: Number(price),
        totalValue: Number(totalValue),
        status,
      });
    }

    return res.json({
      success: true,
      count: summary.length,
      data: summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("Inventory Summary Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getProductInventoryDetails = async (req, res) => {
  try {
    const { companyId, productId } = req.params;

    const company = Number(companyId);
    const productID = Number(productId);

    // 1️⃣ PRODUCT MASTER
    const product = await prisma.products.findUnique({
      where: { id: productID },
      include: { item_category: true, unit_detail: true }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2️⃣ PRODUCT WAREHOUSES (remove duplicates)
    const warehouses = await prisma.product_warehouses.findMany({
      where: { product_id: productID },
      include: { warehouse: true }
    });

    const uniqueWarehouses = Object.values(
      warehouses.reduce((acc, row) => {
        acc[row.warehouse_id] = row;
        return acc;
      }, {})
    );

    // 3️⃣ PURCHASE HISTORY (soft matching by item_name)
    const purchaseHistory = await prisma.purchaseorderitems.findMany({
      where: {
        item_name: { contains: product.item_name.trim() },
        purchaseorder: { company_id: company }
      },
      include: { purchaseorder: true },
      orderBy: { id: "desc" }
    });

    // 4️⃣ SALES HISTORY (allow warehouse_id NULL)
    const salesHistory = await prisma.pos_invoice_products.findMany({
      where: {
        product_id: productID,
        invoice: { company_id: company }
      },
      include: { invoice: true, warehouse: true },
      orderBy: { id: "desc" }
    });

    // 5️⃣ STOCK SUMMARY
    const stockSummary = await Promise.all(
      uniqueWarehouses.map(async (w) => {
        const wId = w.warehouse_id;

        const salesInWarehouse = salesHistory.filter(
          (s) => s.warehouse_id === wId || s.warehouse_id === null
        );

        const totalSalesQty = salesInWarehouse.reduce(
          (sum, s) => sum + Number(s.quantity || 0), 0
        );

        const totalPurchaseQty = purchaseHistory.reduce(
          (sum, p) => sum + Number(p.qty || 0), 0
        );

        return {
          warehouse: w.warehouse.warehouse_name,
          opening: Number(product.initial_qty || 0),
          inward: totalPurchaseQty,
          outward: totalSalesQty,
          closing: Number(w.stock_qty || 0),
          purchaseValue: purchaseHistory.reduce(
            (sum, p) => sum + Number(p.qty || 0) * Number(p.rate || 0), 0),
          salesValue: salesInWarehouse.reduce(
            (sum, s) => sum + Number(s.quantity || 0) * Number(s.price || 0), 0),
          stockValue: Number(w.stock_qty || 0) * Number(product.sale_price || 0),
          lastPurchaseDate:
            purchaseHistory.length ? purchaseHistory[0].purchaseorder.created_at : null,
          lastSaleDate:
            salesInWarehouse.length ? salesInWarehouse[0].invoice.created_at : null,
          status:
            w.stock_qty <= 0
              ? "Out of Stock"
              : w.stock_qty <= product.min_order_qty
              ? "Low Stock"
              : "In Stock"
        };
      })
    );

    // 6️⃣ OVERVIEW
    const overview = {
      totalProducts: 1,
      totalOpening: Number(product.initial_qty || 0),
      totalPurchases: purchaseHistory.reduce((s, p) => s + Number(p.qty || 0), 0),
      totalPurchaseValue: purchaseHistory.reduce(
        (s, p) => s + Number(p.qty || 0) * Number(p.rate || 0), 0),
      totalSales: salesHistory.reduce((s, i) => s + Number(i.quantity || 0), 0),
      totalSalesValue: salesHistory.reduce(
        (s, i) => s + Number(i.quantity || 0) * Number(i.price || 0), 0),
      totalClosing: uniqueWarehouses.reduce(
        (s, w) => s + Number(w.stock_qty || 0), 0),
      totalStockValue: uniqueWarehouses.reduce(
        (s, w) => s + Number(w.stock_qty || 0) * Number(product.sale_price || 0),
        0),
    };

    return res.json({
      success: true,
      productMaster: product,
      warehouseLocations: uniqueWarehouses.map((w) => w.warehouse.warehouse_name),
      stockSummary,
      purchaseHistory,
      salesHistory,
      warehouseOverview: overview
    });

  } catch (err) {
    console.error("Inventory Product Details Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

