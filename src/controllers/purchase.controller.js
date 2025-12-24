// src/controllers/purchaseReturn.controller.js

import prisma from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
});

// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

// Generate Reference ID (e.g., REF-PR-1001)
const generateReferenceId = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const paddedCount = String(count + 1).padStart(4, "0");
  return `REF-PR-${paddedCount}`;
};

// Generate Auto Voucher No (e.g., VOU-PR-2025-001)
const generateAutoVoucherNo = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const paddedCount = String(count + 1).padStart(3, "0");
  return `VOU-PR-${year}-${paddedCount}`;
};

// Generate Return Number (e.g., PR-2025-001)
const generateReturnNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_return.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const paddedCount = String(count + 1).padStart(3, "0");
  return `PR-${year}-${paddedCount}`;
};

// ✅ Create Purchase Return
export const createPurchaseReturn = async (req, res) => {
  try {
    const data = { ...req.body };

    /* ================= BASIC VALIDATION ================= */
    if (!data.company_id || !data.warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "company_id and warehouse_id are required",
      });
    }

    let items =
      typeof data.items === "string"
        ? JSON.parse(data.items)
        : data.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    /* ================= TRANSACTION ================= */
    const purchaseReturn = await prisma.$transaction(async (tx) => {
      /* ---------- CREATE PURCHASE RETURN ---------- */
      const createdReturn = await tx.purchase_return.create({
        data: {
          company_id: Number(data.company_id),
          reference_id: data.reference_id || null,
          manual_voucher_no: data.manual_voucher_no || null,
          auto_voucher_no: data.auto_voucher_no || null,
          return_no: data.return_no || null,
          invoice_no: data.invoice_no || null,
          return_date: data.return_date
            ? new Date(data.return_date)
            : new Date(),

          return_type: "Purchase Return",
          warehouse_id: Number(data.warehouse_id),

          vendor_id: data.vendor_id ? Number(data.vendor_id) : null,
          vendor_name: data.vendor_name || null,

          reason_for_return: data.reason_for_return || null,
          notes: data.notes || null,

          bank_name: data.bank_name || null,
          account_no: data.account_no || null,
          account_holder: data.account_holder || null,
          ifsc_code: data.ifsc_code || null,

          sub_total: data.sub_total || 0,
          tax_total: data.tax_total || 0,
          discount_total: data.discount_total || 0,
          grand_total: data.grand_total || 0,

          status: "pending",
        },
      });

      /* ---------- ITEMS + STOCK UPDATE ---------- */
      for (const item of items) {
        const qty = Number(item.quantity);
        const productId = Number(item.product_id);
        const warehouseId = Number(data.warehouse_id);

        if (!qty || qty <= 0) {
          throw new Error("Invalid item quantity");
        }

        /* ---- CREATE RETURN ITEM ---- */
        await tx.purchase_return_items.create({
          data: {
            purchase_return_id: createdReturn.id,
            product_id: productId,
            item_name: item.item_name || null,
            quantity: qty,
            rate: item.rate || 0,
            tax_percent: item.tax_percent || 0,
            discount: item.discount || 0,
            amount: item.amount || 0,
          },
        });

        /* ---- CHECK PRODUCT ---- */
        const product = await tx.products.findUnique({
          where: { id: productId },
        });

        if (!product || product.total_stock < qty) {
          throw new Error(`Insufficient stock for product ${productId}`);
        }

        /* ---- UPDATE PRODUCT TOTAL STOCK ---- */
        await tx.products.update({
          where: { id: productId },
          data: {
            total_stock: {
              decrement: qty,
            },
          },
        });

        /* ---- UPDATE WAREHOUSE STOCK ---- */
        const warehouseStock = await tx.product_warehouses.findFirst({
          where: {
            product_id: productId,
            warehouse_id: warehouseId,
          },
        });

        if (!warehouseStock || warehouseStock.stock_qty < qty) {
          throw new Error(
            `Insufficient warehouse stock for product ${productId}`
          );
        }

        await tx.product_warehouses.update({
          where: { id: warehouseStock.id },
          data: {
            stock_qty: {
              decrement: qty,
            },
          },
        });
      }

      return createdReturn;
    });

    /* ================= FULL RESPONSE (WITH ITEMS) ================= */
    const fullData = await prisma.purchase_return.findFirst({
      where: { id: purchaseReturn.id },
      include: {
        purchase_return_items: true,
      },
    });
    const formattedData = {
      ...fullData,

      // 🔹 Header totals
      sub_total: toNumber(fullData.sub_total),
      tax_total: toNumber(fullData.tax_total),
      discount_total: toNumber(fullData.discount_total),
      grand_total: toNumber(fullData.grand_total),

      // 🔹 Items
      purchase_return_items: fullData.purchase_return_items.map((item) => ({
        ...item,
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        tax_percent: toNumber(item.tax_percent),
        discount: toNumber(item.discount),
        amount: toNumber(item.amount),
      })),
    };

    return res.status(201).json({
      success: true,
      message: "Purchase return created & stock updated successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Purchase Return Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ✅ Get All Purchase Returns
export const getAllPurchaseReturns = async (req, res) => {
  try {
    const {
      company_id,
      status,
      warehouse,
      start_date,
      end_date,
      return_no,
      invoice_no,
      vendor,
    } = req.query;

    const where = {};
    if (company_id) where.company_id = parseInt(company_id);
    if (status) where.status = status;
    if (warehouse) where.warehouse_id = parseInt(warehouse);
    if (vendor) where.vendor_name = { contains: vendor };
    if (return_no) where.return_no = { contains: return_no };
    if (invoice_no) where.invoice_no = { contains: invoice_no };
    if (start_date || end_date) {
      where.return_date = {};
      if (start_date) where.return_date.gte = new Date(start_date);
      if (end_date) where.return_date.lte = new Date(end_date);
    }

    const purchaseReturns = await prisma.purchase_return.findMany({
      where,
      include: {
        purchase_return_items: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Purchase returns fetched successfully",
      data: purchaseReturns,
      count: purchaseReturns.length,
    });
  } catch (error) {
    console.error("Error fetching purchase returns:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get Purchase Return by ID
export const getPurchaseReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter",
      });
    }

    const purchaseReturn = await prisma.purchase_return.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchase_return_items: true,
      },
    });

    if (!purchaseReturn) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase return fetched successfully",
      data: purchaseReturn,
    });
  } catch (error) {
    console.error("Error fetching purchase return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Update Purchase Return
// export const updatePurchaseReturn = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid purchase return ID",
//       });
//     }

//     const data = { ...req.body };
//     const items =
//       typeof data.items === "string"
//         ? JSON.parse(data.items)
//         : data.items || [];

//     if (!items.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Items are required",
//       });
//     }

//     /* ================= TRANSACTION ================= */
//     const result = await prisma.$transaction(async (tx) => {
//       /* ---------- FETCH EXISTING ---------- */
//       const existing = await tx.purchase_return.findUnique({
//         where: { id },
//         include: { purchase_return_items: true },
//       });

//       if (!existing) {
//         throw new Error("Purchase return not found");
//       }

//       const oldWarehouseId = Number(existing.warehouse_id);
//       const newWarehouseId =
//         data.warehouse_id !== undefined
//           ? Number(data.warehouse_id)
//           : oldWarehouseId;

//       /* ---------- MAP OLD & NEW ITEMS ---------- */
//       /* ---------- MAP OLD & NEW ITEMS (FIXED) ---------- */
//       const oldItemsMap = new Map();
//       existing.purchase_return_items.forEach((i) => {
//         const productId = Number(i.product_id);
//         const qty = toNumber(i.quantity);
//         oldItemsMap.set(productId, (oldItemsMap.get(productId) || 0) + qty);
//       });

//       const newItemsMap = new Map();
//       items.forEach((i) => {
//         const productId = Number(i.product_id);
//         const qty = toNumber(i.quantity);
//         newItemsMap.set(productId, (newItemsMap.get(productId) || 0) + qty);
//       });

//       const allProductIds = new Set([
//         ...oldItemsMap.keys(),
//         ...newItemsMap.keys(),
//       ]);

//       /* ---------- STOCK DIFFERENCE LOGIC ---------- */
//       for (const productId of allProductIds) {
//         const oldQty = oldItemsMap.get(productId) || 0;
//         const newQty = newItemsMap.get(productId) || 0;

//         /* ================= CASE 1: SAME WAREHOUSE ================= */
//         if (oldWarehouseId === newWarehouseId) {
//           const diff = newQty - oldQty;
//           if (diff === 0) continue;

//           // 🔹 Product total stock
//           await tx.products.update({
//             where: { id: productId },
//             data:
//               diff > 0
//                 ? { total_stock: { decrement: diff } } // qty increased → more return → stock kam
//                 : { total_stock: { increment: Math.abs(diff) } },
//           });

//           // 🔹 Warehouse stock
//           const whStock = await tx.product_warehouses.findFirst({
//             where: {
//               product_id: productId,
//               warehouse_id: newWarehouseId,
//             },
//           });

//           if (!whStock) {
//             throw new Error(
//               `Warehouse stock not found for product ${productId}`
//             );
//           }

//           await tx.product_warehouses.update({
//             where: { id: whStock.id },
//             data:
//               diff > 0
//                 ? { stock_qty: { decrement: diff } }
//                 : { stock_qty: { increment: Math.abs(diff) } },
//           });
//         } else {

//         /* ================= CASE 2: WAREHOUSE CHANGED ================= */
//           // 🔁 OLD warehouse → stock wapas add
//           if (oldQty > 0) {
//             await tx.products.update({
//               where: { id: productId },
//               data: { total_stock: { increment: oldQty } },
//             });

//             const oldWh = await tx.product_warehouses.findFirst({
//               where: {
//                 product_id: productId,
//                 warehouse_id: oldWarehouseId,
//               },
//             });

//             if (!oldWh) {
//               throw new Error(
//                 `Old warehouse stock not found for product ${productId}`
//               );
//             }

//             await tx.product_warehouses.update({
//               where: { id: oldWh.id },
//               data: { stock_qty: { increment: oldQty } },
//             });
//           }

//           // 🔻 NEW warehouse → stock kam
//           if (newQty > 0) {
//             await tx.products.update({
//               where: { id: productId },
//               data: { total_stock: { decrement: newQty } },
//             });

//             const newWh = await tx.product_warehouses.findFirst({
//               where: {
//                 product_id: productId,
//                 warehouse_id: newWarehouseId,
//               },
//             });

//             if (!newWh) {
//               throw new Error(
//                 `New warehouse stock not found for product ${productId}`
//               );
//             }

//             await tx.product_warehouses.update({
//               where: { id: newWh.id },
//               data: { stock_qty: { decrement: newQty } },
//             });
//           }
//         }
//       }

//       /* ---------- REPLACE ITEMS ---------- */
//       await tx.purchase_return_items.deleteMany({
//         where: { purchase_return_id: id },
//       });

//       for (const item of items) {
//         await tx.purchase_return_items.create({
//           data: {
//             purchase_return_id: id,
//             product_id: Number(item.product_id),
//             item_name: item.item_name,
//             quantity: toNumber(item.quantity),
//             rate: toNumber(item.rate),
//             tax_percent: toNumber(item.tax_percent || 0),
//             discount: toNumber(item.discount || 0),
//             amount: toNumber(item.amount),
//           },
//         });
//       }

//       /* ---------- UPDATE MASTER ---------- */
//       return await tx.purchase_return.update({
//         where: { id },
//         data: {
//           manual_voucher_no: data.manual_voucher_no,
//           vendor_id: data.vendor_id ? Number(data.vendor_id) : null,
//           vendor_name: data.vendor_name,
//           return_no: data.return_no,
//           invoice_no: data.invoice_no,
//           return_date: data.return_date
//             ? new Date(data.return_date)
//             : existing.return_date,
//           warehouse_id: newWarehouseId,
//           sub_total: toNumber(data.sub_total),
//           tax_total: toNumber(data.tax_total),
//           discount_total: toNumber(data.discount_total),
//           grand_total: toNumber(data.grand_total),
//           notes: data.notes,
//           updated_at: new Date(),
//         },
//         include: { purchase_return_items: true },
//       });
//     });

//     /* ================= FORMAT RESPONSE (NO STRINGS) ================= */
//     const formattedResult = {
//       ...result,
//       sub_total: toNumber(result.sub_total),
//       tax_total: toNumber(result.tax_total),
//       discount_total: toNumber(result.discount_total),
//       grand_total: toNumber(result.grand_total),
//       purchase_return_items: result.purchase_return_items.map((item) => ({
//         ...item,
//         product_id: Number(item.product_id),
//         quantity: toNumber(item.quantity),
//         rate: toNumber(item.rate),
//         tax_percent: toNumber(item.tax_percent),
//         discount: toNumber(item.discount),
//         amount: toNumber(item.amount),
//       })),
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Purchase return updated successfully",
//       data: formattedResult,
//     });
//   } catch (error) {
//     console.error("Update Purchase Return Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };
export const updatePurchaseReturn = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const data = { ...req.body };
    const items =
      typeof data.items === "string"
        ? JSON.parse(data.items)
        : data.items || [];

    if (!items.length) {
      return res.status(400).json({ success: false, message: "Items required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const warehouseId = Number(data.warehouse_id);

      /* ================= ONLY REDUCE STOCK ================= */
      for (const item of items) {
        const qty = Number(item.quantity);

        // 🔻 product stock
        await tx.products.update({
          where: { id: Number(item.product_id) },
          data: {
            total_stock: { decrement: qty },
          },
        });

        // 🔻 warehouse stock
        const wh = await tx.product_warehouses.findFirst({
          where: {
            product_id: Number(item.product_id),
            warehouse_id: warehouseId,
          },
        });

        if (!wh) {
          throw new Error(
            `Warehouse stock not found for product ${item.product_id}`
          );
        }

        await tx.product_warehouses.update({
          where: { id: wh.id },
          data: {
            stock_qty: { decrement: qty },
          },
        });
      }

      /* ================= REPLACE ITEMS ================= */
      await tx.purchase_return_items.deleteMany({
        where: { purchase_return_id: id },
      });

      for (const item of items) {
        await tx.purchase_return_items.create({
          data: {
            purchase_return_id: id,
            product_id: Number(item.product_id),
            item_name: item.item_name,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            tax_percent: Number(item.tax_percent || 0),
            discount: Number(item.discount || 0),
            amount: Number(item.amount),
          },
        });
      }

      /* ================= UPDATE MASTER ================= */
      return tx.purchase_return.update({
        where: { id },
        data: {
          warehouse_id: warehouseId,
          manual_voucher_no: data.manual_voucher_no,
          vendor_id: Number(data.vendor_id),
          vendor_name: data.vendor_name,
          return_no: data.return_no,
          invoice_no: data.invoice_no,
          return_date: new Date(data.return_date),
          sub_total: Number(data.sub_total),
          tax_total: Number(data.tax_total),
          discount_total: Number(data.discount_total),
          grand_total: Number(data.grand_total),
          notes: data.notes,
          updated_at: new Date(),
        },
        include: { purchase_return_items: true },
      });
    });

    return res.json({
      success: true,
      message: "Purchase return updated (stock reduced)",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete Purchase Return
export const deletePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID parameter",
      });
    }

    const existing = await prisma.purchase_return.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found",
      });
    }

    await prisma.purchase_return.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Purchase return deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
