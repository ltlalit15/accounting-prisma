import { uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/db.js";

const toNumber = (val) => (val == null ? null : Number(val));

// export const createProduct = async (req, res) => {
//   try {
//     const {
//       company_id,
//       warehouse_id,
//       item_category_id,
//       item_name,
//       unit_id,
//       hsn,
//       barcode,
//       sku,
//       description,
//       initial_qty,
//       min_order_qty,
//       as_of_date,
//       initial_cost,
//       sale_price,
//       purchase_price,
//       discount,
//       tax_account,
//       remarks,
//     } = req.body;

//     let imageUrl = null;
//     if (req.file) {
//       imageUrl = await uploadToCloudinary(req.file.buffer, "products");
//     }

//     const product = await prisma.products.create({
//       data: {
//         company_id: toNumber(company_id),
//         warehouse_id: toNumber(warehouse_id),
//         item_category_id: toNumber(item_category_id),
//         item_name,
//         hsn,
//         barcode,
//         sku,
//         description,
//         initial_qty: toNumber(initial_qty),
//         min_order_qty: toNumber(min_order_qty),
//         as_of_date,
//         initial_cost: toNumber(initial_cost),
//         sale_price: toNumber(sale_price),
//         purchase_price: toNumber(purchase_price),
//         discount: toNumber(discount),
//         tax_account,
//         remarks,
//         image: imageUrl,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       data: product,
//     });
//   } catch (error) {
//     console.error("Create product error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const createProduct = async (req, res) => {
//   try {
//     const {
//       company_id,
//       item_category_id,
//       unit_detail_id,
//       item_name,
//       hsn,
//       barcode,
//       sku,
//       description,
//       initial_qty,
//       min_order_qty,
//       as_of_date,
//       initial_cost,
//       sale_price,
//       purchase_price,
//       discount,
//       tax_account,
//       remarks,
//       warehouses, // [{ warehouse_id, stock_qty }]
//     } = req.body;

//     // ✅ Upload image if provided
//     let imageUrl = null;
//     if (req.file) {
//       imageUrl = await uploadToCloudinary(req.file.buffer, "products");
//     }

//     // ✅ Parse warehouses safely
//     let parsedWarehouses = [];
//     if (typeof warehouses === "string") {
//       try {
//         parsedWarehouses = JSON.parse(warehouses);
//       } catch (err) {
//         console.warn("⚠️ Invalid warehouses JSON, skipping");
//         parsedWarehouses = [];
//       }
//     } else if (Array.isArray(warehouses)) {
//       parsedWarehouses = warehouses;
//     }

//     // ✅ Calculate total stock
//     const totalStock = parsedWarehouses.reduce(
//       (sum, w) => sum + (Number(w.stock_qty) || 0),
//       0
//     );

//     // ✅ Create product with warehouse relations
//     const product = await prisma.products.create({
//       data: {
//         company_id: Number(company_id),
//         item_category_id: Number(item_category_id),
//         unit_detail_id: Number(unit_detail_id),
//         item_name,
//         hsn,
//         barcode,
//         sku,
//         description,
//         initial_qty: Number(initial_qty),
//         min_order_qty: Number(min_order_qty),
//         as_of_date,
//         initial_cost: Number(initial_cost),
//         sale_price: Number(sale_price),
//         purchase_price: Number(purchase_price),
//         discount: Number(discount),
//         tax_account,
//         remarks,
//         image: imageUrl,
//         total_stock: totalStock,
//         product_warehouses: {
//           create: parsedWarehouses.map((w) => ({
//             warehouse_id: Number(w.warehouse_id),
//             stock_qty: Number(w.stock_qty) || 0,
//           })),
//         },
//       },
//       include: {
//         product_warehouses: {
//           include: {
//             warehouse: {
//               select: {
//                 id: true,
//                 warehouse_name: true,
//                 location: true,
//               },
//             },
//           },
//         },
//         item_category: { select: { id: true, item_category_name: true } },
//         unit_detail: {
//           select: {
//             id: true,
//     company_id: true,
//     uom_name: true,       // ✔ Correct field
//     category: true,       // ✔ Also part of your schema
//     weight_per_unit: true,
//     created_at: true,
//           },
//         },
//       },
//     });

//     // ✅ Simplify warehouse structure
//     const simplifiedWarehouses = product.product_warehouses.map((pw) => ({
//       warehouse_id: pw.warehouse.id,
//       warehouse_name: pw.warehouse.warehouse_name,
//       location: pw.warehouse.location,
//       stock_qty: pw.stock_qty,
//     }));

//     // ✅ Final unified product response
//     return res.status(201).json({
//       success: true,
//       message: "✅ Product created successfully with warehouse mapping",
//       data: {
//         id: product.id,
//         company_id: product.company_id,
//         item_category: product.item_category,
//         unit_detail: product.unit_detail,
//         item_name: product.item_name,
//         hsn: product.hsn,
//         barcode: product.barcode,
//         sku: product.sku,
//         description: product.description,
//         initial_qty: product.initial_qty,
//         min_order_qty: product.min_order_qty,
//         as_of_date: product.as_of_date,
//         initial_cost: product.initial_cost,
//         sale_price: product.sale_price,
//         purchase_price: product.purchase_price,
//         discount: product.discount,
//         tax_account: product.tax_account,
//         remarks: product.remarks,
//         total_stock: product.total_stock,
//         image: product.image,
//         warehouses: simplifiedWarehouses,
//         created_at: product.created_at,
//         updated_at: product.updated_at,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Create product error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const createProduct = async (req, res) => {
  try {
    const {
      company_id,
      item_category_id,
      unit_detail_id,
      item_name,
      hsn,
      barcode,
      sku,
      description,
      initial_qty,
      min_order_qty,
      as_of_date,
      initial_cost,
      sale_price,
      purchase_price,
      discount,
      tax_account,
      remarks,
      warehouses, // UI array: [{ warehouse_id, quantity, min_order_qty, initial_qty }]
    } = req.body;

    // ---------------------------
    // 📌 Upload Image if Available
    // ---------------------------
    let imageUrl = null;
    if (req.files && req.files.image) {
      imageUrl = await uploadToCloudinary(req.files.image, "products");
    }

    // ---------------------------
    // 📌 Parse Warehouses
    // ---------------------------
    let parsedWarehouses = [];
    if (typeof warehouses === "string") {
      try {
        parsedWarehouses = JSON.parse(warehouses);
      } catch {
        parsedWarehouses = [];
      }
    } else if (Array.isArray(warehouses)) {
      parsedWarehouses = warehouses;
    }

    // ---------------------------
    // 📌 Calculate Total Stock
    // Supports: stock_qty, quantity, initial_qty
    // ---------------------------
    const totalStock = parsedWarehouses.reduce((sum, w) => {
      const qty = Number(w.stock_qty ?? w.quantity ?? w.initial_qty ?? 0);
      return sum + qty;
    }, 0);

    // ---------------------------
    // 📌 Create Product
    // ---------------------------
    const product = await prisma.products.create({
      data: {
        company_id: Number(company_id),
        item_category_id: Number(item_category_id),
        unit_detail_id: Number(unit_detail_id),
        item_name,
        hsn,
        barcode,
        sku,
        description,
        initial_qty: Number(initial_qty),
        min_order_qty: Number(min_order_qty),
        as_of_date,
        initial_cost: Number(initial_cost),
        sale_price: Number(sale_price),
        purchase_price: Number(purchase_price),
        discount: Number(discount),
        tax_account,
        remarks,
        image: imageUrl,
        total_stock: totalStock,

        // Create Warehouse Stock Rows
        product_warehouses: {
          create: parsedWarehouses.map((w) => ({
            warehouse_id: Number(w.warehouse_id),
            stock_qty: Number(w.stock_qty ?? w.quantity ?? w.initial_qty ?? 0),
          })),
        },
      },

      // Include related data
      include: {
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
              },
            },
          },
        },
        item_category: { select: { id: true, item_category_name: true } },
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_name: true,
            category: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
    });

    // ---------------------------
    // 📌 Prepare Warehouse View
    // ---------------------------
    const simplifiedWarehouses = product.product_warehouses.map((pw) => ({
      warehouse_id: pw.warehouse.id,
      warehouse_name: pw.warehouse.warehouse_name,
      location: pw.warehouse.location,
      stock_qty: pw.stock_qty,
    }));

    // ---------------------------
    // 📌 Response
    // ---------------------------
    return res.status(201).json({
      success: true,
      message: "Product created successfully with warehouse mapping",
      data: {
        id: product.id,
        company_id: product.company_id,
        item_category: product.item_category,
        unit_detail: product.unit_detail,
        item_name: product.item_name,
        hsn: product.hsn,
        barcode: product.barcode,
        sku: product.sku,
        description: product.description,
        initial_qty: product.initial_qty,
        min_order_qty: product.min_order_qty,
        as_of_date: product.as_of_date,
        initial_cost: product.initial_cost,
        sale_price: product.sale_price,
        purchase_price: product.purchase_price,
        discount: product.discount,
        tax_account: product.tax_account,
        remarks: product.remarks,
        total_stock: product.total_stock,
        image: product.image,
        warehouses: simplifiedWarehouses,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await prisma.products.findMany({
//       include: {
//         warehouse: { select: { id: true, warehouse_name: true, location: true } },
//         item_category: { select: { id: true, item_category_name: true } },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     res.json({ success: true, data: products });
//   } catch (error) {
//     console.error("Get all products error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await prisma.products.findMany({
//       include: {
//         // ✅ Include all linked warehouses with stock details
//         product_warehouses: {
//           include: {
//             warehouse: {
//               select: {
//                 id: true,
//                 warehouse_name: true,
//                 location: true,
//                 city: true,
//                 state: true,
//               },
//             },
//           },
//         },

//         // ✅ Include category info
//         item_category: {
//           select: { id: true, item_category_name: true },
//         },

//         // ✅ Include unit details
//         unit_detail: {
//           select: {
//             id: true,
//             company_id: true,
//             uom_id: true,
//             weight_per_unit: true,
//             created_at: true,
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     // ✅ Optionally, compute total stock dynamically if not stored (safe fallback)
//     const formattedProducts = products.map((p) => ({
//       ...p,
//       total_stock:
//         p.total_stock ??
//         p.product_warehouses.reduce((sum, pw) => sum + (pw.stock_qty || 0), 0),
//     }));

//     res.status(200).json({
//       success: true,
//       message: "✅ Products fetched successfully",
//       total: formattedProducts.length,
//       data: formattedProducts,
//     });
//   } catch (error) {
//     console.error("❌ Get all products error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch products",
//       error: error.message,
//     });
//   }
// };
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
              },
            },
          },
        },

        item_category: {
          select: { id: true, item_category_name: true },
        },

        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_name: true,
            category: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const formattedProducts = products.map((p) => ({
      ...p,
      total_stock:
        p.total_stock ??
        p.product_warehouses.reduce((sum, pw) => sum + (pw.stock_qty || 0), 0),
    }));

    res.status(200).json({
      success: true,
      message: "✅ Products fetched successfully",
      total: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// export const getProductsByCompany = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     // ✅ Validate company_id
//     const companyId = Number(company_id);
//     if (!companyId || isNaN(companyId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or missing company_id parameter",
//       });
//     }

//     // ✅ Fetch products with related data
//     const products = await prisma.products.findMany({
//       where: { company_id: companyId },
//       include: {
//         product_warehouses: {
//           include: {
//             warehouse: {
//               select: {
//                 id: true,
//                 warehouse_name: true,
//                 location: true,
//               },
//             },
//           },
//         },
//         item_category: {
//           select: {
//             id: true,
//             item_category_name: true,
//           },
//         },
//         unit_detail: {
//           select: {
//             id: true,
//             company_id: true,
//             uom_id: true,
//             weight_per_unit: true,
//             created_at: true,
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     // ✅ Format and flatten warehouses
//     const formattedProducts = products.map((product) => {
//       const warehouses = product.product_warehouses.map((pw) => ({
//         warehouse_id: pw.warehouse?.id,
//         warehouse_name: pw.warehouse?.warehouse_name,
//         location: pw.warehouse?.location,
//         stock_qty: pw.stock_qty ?? 0,
//       }));

//       const totalStock =
//         product.total_stock ??
//         warehouses.reduce((sum, w) => sum + (w.stock_qty || 0), 0);

//       return {
//         id: product.id,
//         company_id: product.company_id,
//         item_category: product.item_category,
//         unit_detail: product.unit_detail,
//         item_name: product.item_name,
//         hsn: product.hsn,
//         barcode: product.barcode,
//         sku: product.sku,
//         description: product.description,
//         initial_qty: product.initial_qty,
//         min_order_qty: product.min_order_qty,
//         as_of_date: product.as_of_date,
//         initial_cost: product.initial_cost,
//         sale_price: product.sale_price,
//         purchase_price: product.purchase_price,
//         discount: product.discount,
//         tax_account: product.tax_account,
//         remarks: product.remarks,
//         total_stock: totalStock,
//         image: product.image,
//         warehouses,
//         created_at: product.created_at,
//         updated_at: product.updated_at,
//       };
//     });

//     if (formattedProducts.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No products found for company_id ${companyId}`,
//       });
//     }

//     // ✅ Final success response
//     return res.status(200).json({
//       success: true,
//       message: `✅ Products fetched successfully for company_id ${companyId}`,
//       total_products: formattedProducts.length,
//       data: formattedProducts,
//     });
//   } catch (error) {
//     console.error("❌ Get products by company error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };;

export const getProductsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    // ✅ Validate company_id
    const companyId = Number(company_id);
    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing company_id parameter",
      });
    }

    // ✅ Fetch products with related data
    const products = await prisma.products.findMany({
      where: { company_id: companyId },
      include: {
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
              },
            },
          },
        },
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_name: true, // Using uom_name instead of uom_id
            category: true, // Include category field
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // ✅ Format and flatten warehouses
    const formattedProducts = products.map((product) => {
      const warehouses = product.product_warehouses.map((pw) => ({
        warehouse_id: pw.warehouse?.id,
        warehouse_name: pw.warehouse?.warehouse_name,
        location: pw.warehouse?.location,
        stock_qty: pw.stock_qty ?? 0,
      }));

      const totalStock =
        product.total_stock ??
        warehouses.reduce((sum, w) => sum + (w.stock_qty || 0), 0);

      return {
        id: product.id,
        company_id: product.company_id,
        item_category: product.item_category,
        unit_detail: product.unit_detail,
        item_name: product.item_name,
        hsn: product.hsn,
        barcode: product.barcode,
        sku: product.sku,
        description: product.description,
        initial_qty: product.initial_qty,
        min_order_qty: product.min_order_qty,
        as_of_date: product.as_of_date,
        initial_cost: product.initial_cost,
        sale_price: product.sale_price,
        purchase_price: product.purchase_price,
        discount: product.discount,
        tax_account: product.tax_account,
        remarks: product.remarks,
        total_stock: totalStock,
        image: product.image,
        warehouses,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };
    });

    if (formattedProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found for company_id ${companyId}`,
      });
    }

    // ✅ Final success response
    return res.status(200).json({
      success: true,
      message: `✅ Products fetched successfully for company_id ${companyId}`,
      total_products: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Get products by company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const getProductsByCompanyAndWarehouse = async (req, res) => {
  try {
    const { company_id, warehouse_id } = req.params;

    // ✅ Validate params
    const companyId = Number(company_id);
    const warehouseId = Number(warehouse_id);

    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing company_id parameter",
      });
    }

    if (!warehouseId || isNaN(warehouseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing warehouse_id parameter",
      });
    }

    // ✅ Fetch products linked to the company AND the specified warehouse
    const products = await prisma.products.findMany({
      where: {
        company_id: companyId,
        product_warehouses: {
          some: {
            warehouse_id: warehouseId,
          },
        },
      },
      include: {
        // ✅ Include linked warehouses with stock details
        product_warehouses: {
          where: { warehouse_id: warehouseId }, // only include the selected warehouse
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },

        // ✅ Include item category
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },

        // ✅ Include unit details
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_name: true,
            category: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // ✅ Calculate total stock dynamically
    const formattedProducts = products.map((product) => {
      const totalStock =
        product.total_stock ??
        product.product_warehouses.reduce(
          (sum, pw) => sum + (pw.stock_qty || 0),
          0
        );

      return { ...product, total_stock: totalStock };
    });

    // ✅ If no products found
    if (formattedProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found for company_id ${companyId} in warehouse_id ${warehouseId}`,
      });
    }

    // ✅ Success response
    res.status(200).json({
      success: true,
      message: `✅ Products fetched successfully for company_id ${companyId} in warehouse_id ${warehouseId}`,
      total_products: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Get by company and warehouse error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * 🟢 GET PRODUCT BY ID
 */

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    const productId = Number(id);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID",
      });
    }

    // ✅ Fetch product by ID with related data
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        // ✅ Include all linked warehouses via product_warehouses
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },

        // ✅ Include category info
        item_category: {
          select: {
            id: true,
            item_category_name: true,
          },
        },

        // ✅ Include unit details info
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_name: true,
            category: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
    });

    // ✅ If no product found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Calculate total_stock dynamically (if not already stored)
    const totalStock =
      product.total_stock ??
      product.product_warehouses.reduce(
        (sum, pw) => sum + (pw.stock_qty || 0),
        0
      );

    // ✅ Return formatted response
    return res.status(200).json({
      success: true,
      message: "✅ Product fetched successfully",
      data: {
        ...product,
        total_stock: totalStock,
      },
    });
  } catch (error) {
    console.error("❌ Get product by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * 🟠 UPDATE PRODUCT
 */

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       company_id,
//       item_category_id,
//       unit_detail_id,
//       item_name,
//       hsn,
//       barcode,
//       sku,
//       description,
//       initial_qty,
//       min_order_qty,
//       as_of_date,
//       initial_cost,
//       sale_price,
//       purchase_price,
//       discount,
//       tax_account,
//       remarks,
//       warehouses, // ✅ Expected: [{ warehouse_id, stock_qty }]
//     } = req.body;

//     const productId = Number(id);
//     if (!productId || isNaN(productId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or missing product ID",
//       });
//     }

//     // ✅ Check if product exists
//     const existingProduct = await prisma.products.findUnique({
//       where: { id: productId },
//       include: { product_warehouses: true },
//     });

//     if (!existingProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // ✅ Handle new image upload (optional)
//     let imageUrl = existingProduct.image;
//     if (req.file) {
//       imageUrl = await uploadToCloudinary(req.file.buffer, "products");
//     }

//     // ✅ Parse warehouses input (can come as JSON string in form-data)
//     let parsedWarehouses = [];
//     if (typeof warehouses === "string") {
//       try {
//         parsedWarehouses = JSON.parse(warehouses);
//       } catch {
//         parsedWarehouses = [];
//       }
//     } else if (Array.isArray(warehouses)) {
//       parsedWarehouses = warehouses;
//     }

//     // ✅ Calculate total stock
//     let totalStock = parsedWarehouses.length
//       ? parsedWarehouses.reduce((sum, w) => sum + (Number(w.stock_qty) || 0), 0)
//       : existingProduct.total_stock;

//     // ✅ Update product_warehouses mapping (replace all for simplicity)
//     if (parsedWarehouses.length > 0) {
//       await prisma.product_warehouses.deleteMany({
//         where: { product_id: productId },
//       });

//       await prisma.product_warehouses.createMany({
//         data: parsedWarehouses.map((w) => ({
//           product_id: productId,
//           warehouse_id: Number(w.warehouse_id),
//           stock_qty: Number(w.stock_qty) || 0,
//         })),
//       });
//     }

//     // ✅ Prepare update data
//     const updateData = {
//       company_id: company_id ? Number(company_id) : existingProduct.company_id,
//       item_name: item_name ?? existingProduct.item_name,
//       hsn: hsn ?? existingProduct.hsn,
//       barcode: barcode ?? existingProduct.barcode,
//       sku: sku ?? existingProduct.sku,
//       description: description ?? existingProduct.description,
//       initial_qty: initial_qty
//         ? Number(initial_qty)
//         : existingProduct.initial_qty,
//       min_order_qty: min_order_qty
//         ? Number(min_order_qty)
//         : existingProduct.min_order_qty,
//       as_of_date: as_of_date ?? existingProduct.as_of_date,
//       initial_cost: initial_cost
//         ? Number(initial_cost)
//         : existingProduct.initial_cost,
//       sale_price: sale_price ? Number(sale_price) : existingProduct.sale_price,
//       purchase_price: purchase_price
//         ? Number(purchase_price)
//         : existingProduct.purchase_price,
//       discount: discount ? Number(discount) : existingProduct.discount,
//       tax_account: tax_account ?? existingProduct.tax_account,
//       remarks: remarks ?? existingProduct.remarks,
//       image: imageUrl,
//       total_stock: totalStock,
//       updated_at: new Date(),
//     };

//     // ✅ Handle relational updates properly
//     if (item_category_id) {
//       updateData.item_category = { connect: { id: Number(item_category_id) } };
//     }
//     if (unit_detail_id) {
//       updateData.unit_detail = { connect: { id: Number(unit_detail_id) } };
//     }

//     // ✅ Update product
//     const updatedProduct = await prisma.products.update({
//       where: { id: productId },
//       data: updateData,
//       include: {
//         product_warehouses: {
//           include: {
//             warehouse: {
//               select: {
//                 id: true,
//                 warehouse_name: true,
//                 location: true,
//                 city: true,
//                 state: true,
//                 country: true,
//               },
//             },
//           },
//         },
//         item_category: { select: { id: true, item_category_name: true } },
//         unit_detail: {
//           select: {
//             id: true,
//     company_id: true,
//     uom_name: true,
//     category: true,
//     weight_per_unit: true,
//     created_at: true,
//           },
//         },
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "✅ Product updated successfully",
//       data: updatedProduct,
//     });
//   } catch (error) {
//     console.error("❌ Update product error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      item_category_id,
      unit_detail_id,
      item_name,
      hsn,
      barcode,
      sku,
      description,
      initial_qty,
      min_order_qty,
      as_of_date,
      initial_cost,
      sale_price,
      purchase_price,
      discount,
      tax_account,
      remarks,
      warehouses,
    } = req.body;

    const productId = Number(id);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID",
      });
    }

    // Check if product exists
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
      include: { product_warehouses: true },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle image upload
    let imageUrl = existingProduct.image;
    if (req.files && req.files.image) {
      imageUrl = await uploadToCloudinary(req.files.image, "products");
    }

    // Parse warehouses
    let parsedWarehouses = [];
    if (typeof warehouses === "string") {
      try {
        parsedWarehouses = JSON.parse(warehouses);
      } catch {
        parsedWarehouses = [];
      }
    } else if (Array.isArray(warehouses)) {
      parsedWarehouses = warehouses;
    }

    // ----------------------------------------------------------
    // ✅ VALIDATE: Make sure warehouse_id exists in DB
    // ----------------------------------------------------------
    if (parsedWarehouses.length > 0) {
      const warehouseIds = parsedWarehouses.map((w) => Number(w.warehouse_id));

      const existing = await prisma.warehouses.findMany({
        where: { id: { in: warehouseIds } },
        select: { id: true },
      });

      const existingIds = existing.map((w) => w.id);

      const invalidIds = warehouseIds.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid warehouse_id found",
          invalid_ids: invalidIds,
        });
      }
    }

    // ----------------------------------------------------------
    // ✅ FIX: Correct stock_qty logic for frontend payload
    // ----------------------------------------------------------
    const deriveStockQty = (w) =>
      Number(w.stock_qty ?? w.quantity ?? w.initial_qty ?? 0);

    // Calculate total stock
    let totalStock = parsedWarehouses.length
      ? parsedWarehouses.reduce((sum, w) => sum + deriveStockQty(w), 0)
      : existingProduct.total_stock;

    // Update product_warehouses (replace all)
    if (parsedWarehouses.length > 0) {
      await prisma.product_warehouses.deleteMany({
        where: { product_id: productId },
      });

      await prisma.product_warehouses.createMany({
        data: parsedWarehouses.map((w) => ({
          product_id: productId,
          warehouse_id: Number(w.warehouse_id),
          stock_qty: deriveStockQty(w),
        })),
      });
    }

    // Prepare update data
    const updateData = {
      company_id: company_id ? Number(company_id) : existingProduct.company_id,
      item_name: item_name ?? existingProduct.item_name,
      hsn: hsn ?? existingProduct.hsn,
      barcode: barcode ?? existingProduct.barcode,
      sku: sku ?? existingProduct.sku,
      description: description ?? existingProduct.description,
      initial_qty: initial_qty
        ? Number(initial_qty)
        : existingProduct.initial_qty,
      min_order_qty: min_order_qty
        ? Number(min_order_qty)
        : existingProduct.min_order_qty,
      as_of_date: as_of_date ?? existingProduct.as_of_date,
      initial_cost: initial_cost
        ? Number(initial_cost)
        : existingProduct.initial_cost,
      sale_price: sale_price ? Number(sale_price) : existingProduct.sale_price,
      purchase_price: purchase_price
        ? Number(purchase_price)
        : existingProduct.purchase_price,
      discount: discount ? Number(discount) : existingProduct.discount,
      tax_account: tax_account ?? existingProduct.tax_account,
      remarks: remarks ?? existingProduct.remarks,
      image: imageUrl,
      total_stock: totalStock,
      updated_at: new Date(),
    };

    if (item_category_id) {
      updateData.item_category = { connect: { id: Number(item_category_id) } };
    }
    if (unit_detail_id) {
      updateData.unit_detail = { connect: { id: Number(unit_detail_id) } };
    }

    // Update product
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      include: {
        product_warehouses: {
          include: {
            warehouse: {
              select: {
                id: true,
                warehouse_name: true,
                location: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        item_category: { select: { id: true, item_category_name: true } },
        unit_detail: {
          select: {
            id: true,
            company_id: true,
            uom_name: true,
            category: true,
            weight_per_unit: true,
            created_at: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * 🔴 DELETE PRODUCT
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    // 1️⃣ Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: { product_warehouses: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "❌ Product not found",
      });
    }

    // 2️⃣ Delete related warehouse mappings first
    await prisma.product_warehouses.deleteMany({
      where: { product_id: productId },
    });

    // 3️⃣ Then delete the product
    await prisma.products.delete({
      where: { id: productId },
    });

    // ✅ Success response
    return res.json({
      success: true,
      message: "✅ Product and related warehouse mappings deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getInventoryItemDetails = async (req, res) => {
  try {
    const { product_id, company_id } = req.params;

    const productId = Number(product_id);
    const companyId = Number(company_id);

    // =============================
    // 1️⃣ PRODUCT DETAILS
    // =============================
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        item_category: true,
        unit_detail: true,
        product_warehouses: { include: { warehouse: true } },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Primary warehouse (first one)
    const primaryWarehouse =
      product.product_warehouses.length > 0
        ? product.product_warehouses[0].warehouse?.warehouse_name
        : "-";

    // =============================
    // 2️⃣ ALL TRANSFER ITEMS
    // =============================
    const transferItems = await prisma.transfer_items.findMany({
      where: { product_id: productId },
      include: {
        transfers: true,
        warehouses: true,
      },
      orderBy: { id: "asc" }, // chronological order for closing stock
    });

    // =============================
    // 3️⃣ MAP EACH ROW → EXACT UI FORMAT
    // =============================
    let closingQty = 0;

    const mapTransaction = async (item) => {
      const t = item.transfers;

      // Fetch vendor/customer
      const vendor = await prisma.vendorscustomer.findFirst({
        where: { id: Number(t.company_id) },
      });

      // IN / OUT logic
      let inwardQty = 0;
      let outwardQty = 0;

      if (t.vch_type === "Purchase") {
        inwardQty = Number(item.qty);
      } else if (t.vch_type === "Purchase Return") {
        outwardQty = Number(item.qty);
      } else if (
        t.vch_type === "Sales Invoice" ||
        t.vch_type === "Delivery Challan"
      ) {
        outwardQty = Number(item.qty);
      } else if (t.vch_type === "Sales Return") {
        inwardQty = Number(item.qty);
      }

      // Update closing qty
      closingQty = closingQty + inwardQty - outwardQty;

      return {
        date: t.transfer_date,
        vch_type: t.vch_type,
        particulars: vendor?.name_english || "-",
        vch_no: t.manual_voucher_no || "-",
        voucher_no: t.voucher_no,
        warehouse: item.warehouses?.warehouse_name || "-",
        rate: Number(item.rate),
        inward_qty: inwardQty,
        inward_value: inwardQty * Number(item.rate),
        outward_qty: outwardQty,
        outward_value: outwardQty * Number(item.rate),
        closing_qty: closingQty,
        description: product.unit_detail?.unit_name || "",
        narration: item.narration || "",
      };
    };

    const allTransactions = await Promise.all(
      transferItems.map((t) => mapTransaction(t))
    );

    // =============================
    // 4️⃣ FILTER SPECIFIC SECTIONS
    // =============================
    const purchaseHistory = allTransactions.filter(
      (t) => t.vch_type === "Purchase"
    );

    const salesHistory = allTransactions.filter((t) =>
      ["Sales Invoice", "Delivery Challan"].includes(t.vch_type)
    );

    const returnHistory = allTransactions.filter((t) =>
      ["Sales Return", "Purchase Return"].includes(t.vch_type)
    );

    // =============================
    // 5️⃣ PRODUCT STATUS
    // =============================
    const status = closingQty > 0 ? "In Stock" : "Out of Stock";

    // =============================
    // 6️⃣ FINAL RESPONSE
    // =============================
    res.status(200).json({
      success: true,
      message: "Item details fetched successfully",

      product: {
        id: product.id,
        name: product.item_name,
        barcode: product.barcode,
        hsn: product.hsn,
        category: product.item_category?.category_name,
        unit: product.unit_detail?.unit_name,
        image: product.image,
        current_stock: closingQty,
        warehouse_name: primaryWarehouse, // ⭐ added
        status: status, // ⭐ added
      },

      allTransactions,
      purchaseHistory,
      salesHistory,
      returnHistory,
    });
  } catch (error) {
    console.error("Inventory Error: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory details",
      error: error.message,
    });
  }
};

// export const getInventoryDetails = async (req, res) => {
//  try {
//     const { company_id, product_id } = req.params;

//     // 1️⃣ Product Details
//     const product = await prisma.products.findFirst({
//       where: { id: Number(product_id), company_id: Number(company_id) },
//       include: {
//         item_category: true,
//         unit_detail: true,
//         product_warehouses: {
//           include: { warehouse: true }
//         }
//       }
//     });

//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     // 2️⃣ All Transactions (Merged Across All Modules)
//     let allTransactions = [];

//     // PURCHASE
//     const purchase = await prisma.voucher_items.findMany({
//       where: { item_name: product.item_name, vouchers: { company_id: Number(company_id), voucher_type: "Purchase" } },
//       include: { vouchers: true }
//     });

//     purchase.forEach(p => {
//       allTransactions.push({
//         date: p.vouchers.date,
//         vch_type: p.vouchers.voucher_type,
//         particulars: p.vouchers.from_name || "", // vendor name stored in vouchers
//         vch_no: p.vouchers.voucher_number,
//         auto_voucher_no: p.vouchers.manual_voucher_no || p.vouchers.voucher_number,
//         rate: p.rate,
//         inwards_qty: p.quantity,
//         inwards_value: p.amount,
//         outwards_qty: 0,
//         outwards_value: 0,
//         description: p.description,
//         narration: p.vouchers.notes
//       });
//     });

//     // SALES
//     const sales = await prisma.pos_invoice_products.findMany({
//       where: { product_id: Number(product_id), invoice: { company_id: Number(company_id) } },
//       include: { invoice: { include: { customer: true } } }
//     });

//     sales.forEach(s => {
//       allTransactions.push({
//         date: s.invoice.created_at,
//         vch_type: "Sales Invoice",
//         particulars: s.invoice.customer?.name_english || "",
//         vch_no: s.invoice.id,
//         auto_voucher_no: s.invoice.id,
//         rate: s.price,
//         inwards_qty: 0,
//         inwards_value: 0,
//         outwards_qty: s.quantity,
//         outwards_value: (Number(s.quantity) * Number(s.price)),
//         description: "",
//         narration: ""
//       });
//     });

//     // PURCHASE RETURN
//     const purchaseReturn = await prisma.purchase_return_items.findMany({
//       where: { product_id: Number(product_id), purchase_return: { company_id: Number(company_id) } },
//       include: { purchase_return: true }
//     });

//     purchaseReturn.forEach(r => {
//       allTransactions.push({
//         date: r.purchase_return.return_date,
//         vch_type: r.purchase_return.return_type,
//         particulars: r.purchase_return.vendor_name || "",
//         vch_no: r.purchase_return.return_no,
//         auto_voucher_no: r.purchase_return.auto_voucher_no,
//         rate: r.rate,
//         inwards_qty: 0,
//         inwards_value: 0,
//         outwards_qty: r.quantity,
//         outwards_value: r.amount,
//         description: r.narration,
//         narration: r.purchase_return.notes
//       });
//     });

//     // SALES RETURN
//     const salesReturn = await prisma.sales_return_items.findMany({
//       where: { product_id: Number(product_id), sales_return: { company_id: Number(company_id) } },
//       include: { sales_return: true }
//     });

//     salesReturn.forEach(r => {
//       allTransactions.push({
//         date: r.sales_return.return_date,
//         vch_type: r.sales_return.return_type,
//         particulars: r.sales_return.customer_id ? r.sales_return.customer_id : "",
//         vch_no: r.sales_return.return_no,
//         auto_voucher_no: r.sales_return.auto_voucher_no,
//         rate: r.rate,
//         inwards_qty: r.quantity,
//         inwards_value: r.amount,
//         outwards_qty: 0,
//         outwards_value: 0,
//         description: r.narration,
//         narration: r.sales_return.notes
//       });
//     });

//     // DELIVERY CHALLAN (sales order)
//     const deliveryChallan = await prisma.salesorderitems.findMany({
//       where: { item_name: product.item_name, salesorder: { company_id: Number(company_id) } },
//       include: { salesorder: true }
//     });

//     deliveryChallan.forEach(dc => {
//       allTransactions.push({
//         date: dc.salesorder.quotation_date,
//         vch_type: "Delivery Challan",
//         particulars: dc.salesorder.bill_to_customer_name || dc.salesorder.bill_to_company_name || "",
//         vch_no: dc.salesorder.Challan_no,
//         auto_voucher_no: dc.salesorder.Manual_challan_no || dc.salesorder.Challan_no,
//         rate: dc.rate,
//         inwards_qty: 0,
//         inwards_value: 0,
//         outwards_qty: dc.qty,
//         outwards_value: Number(dc.qty) * Number(dc.rate),
//         description: "",
//         narration: dc.salesorder.notes
//       });
//     });

//     // Sort by date
//     allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // 3️⃣ Separate sections for Purchase / Sales / Return History
//     const purchase_history = purchase;
//     const sales_history = sales;
//     const return_history = [...purchaseReturn, ...salesReturn];

//     return res.status(200).json({
//       success: true,
//       product_info: product,
//       all_transactions: allTransactions,
//       purchase_history,
//       sales_history,
//       return_history
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

export const getInventoryDetails = async (req, res) => {
  try {
    const { company_id, product_id } = req.params;
    const companyId = Number(company_id);
    const productId = Number(product_id);

    // 1️⃣ Get Product Master Details
    const product = await prisma.products.findFirst({
      where: { id: productId, company_id: companyId },
      include: {
        item_category: true,
        unit_detail: true,
        product_warehouses: {
          include: { warehouse: true },
        },
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Helper to find a suitable default warehouse
    const getDefaultWarehouse = () => {
      const mainWarehouse = product.product_warehouses.find(
        (pw) =>
          pw.warehouse.warehouse_name.toLowerCase().includes("main") ||
          pw.warehouse.warehouse_name.toLowerCase().includes("default")
      );
      return (
        mainWarehouse?.warehouse.warehouse_name ||
        product.product_warehouses[0]?.warehouse.warehouse_name ||
        "Unassigned Warehouse"
      );
    };

    let allTransactionsForLedger = [];

    // A. PURCHASES (from Vouchers)
    const purchaseItems = await prisma.voucher_items.findMany({
      where: {
        item_name: product.item_name,
        vouchers: { company_id: companyId, voucher_type: "Purchase" },
      },
      include: { vouchers: true },
    });
    purchaseItems.forEach((p) => {
      allTransactionsForLedger.push({
        date: p.vouchers.date,
        rawType: "PURCHASE",
        // DYNAMIC: Use voucher type directly from the DB
        vchType: p.vouchers.voucher_type,
        particulars: p.vouchers.from_name || "N/A",
        vchNo: p.vouchers.voucher_number,
        autoVoucherNo:
          p.vouchers.manual_voucher_no || p.vouchers.voucher_number,
        rate: Number(p.rate),
        quantity: Number(p.quantity), // Inflow
        // DYNAMIC: Acknowledge schema limitation, use a smart fallback
        warehouseName: getDefaultWarehouse(),
        description: p.description,
        narration: p.vouchers.notes || "",
      });
    });

    // B. SALES (from POS Invoices)
    const salesItems = await prisma.pos_invoice_products.findMany({
      where: { product_id: productId, invoice: { company_id: companyId } },
      include: { invoice: { include: { customer: true } }, warehouse: true },
    });
    salesItems.forEach((s) => {
      allTransactionsForLedger.push({
        date: s.invoice.created_at,
        rawType: "SALE",
        // DYNAMIC: This is a reasonable label as the table doesn't have a type field
        vchType: "Sales Invoice",
        particulars: s.invoice.customer?.name_english || "N/A",
        vchNo: `INV-${s.invoice_id}`,
        autoVoucherNo: `INV-${s.invoice_id}`,
        rate: Number(s.price),
        quantity: -Number(s.quantity), // Outflow
        // DYNAMIC: Use the actual linked warehouse
        warehouseName: s.warehouse?.warehouse_name || "Unassigned Warehouse",
        description: product.item_name,
        narration: "",
      });
    });

    // C. PURCHASE RETURNS
    const purchaseReturnItems = await prisma.purchase_return_items.findMany({
      where: {
        product_id: productId,
        purchase_return: { company_id: companyId },
      },
      include: { purchase_return: true },
    });
    purchaseReturnItems.forEach((r) => {
      allTransactionsForLedger.push({
        date: r.purchase_return.return_date,
        rawType: "PURCHASE_RETURN",
        // DYNAMIC: Use the return_type field from the database
        vchType: r.purchase_return.return_type,
        particulars: r.purchase_return.vendor_name || "N/A",
        vchNo: r.purchase_return.return_no,
        autoVoucherNo: r.purchase_return.auto_voucher_no,
        rate: Number(r.rate),
        quantity: -Number(r.quantity), // Outflow
        // DYNAMIC: Acknowledge schema limitation
        warehouseName: getDefaultWarehouse(),
        description: r.item_name,
        narration: r.purchase_return.notes || "",
      });
    });

    // D. SALES RETURNS
    const salesReturnItems = await prisma.sales_return_items.findMany({
      where: { product_id: productId, sales_return: { company_id: companyId } },
      include: { sales_return: true },
    });
    const customerIds = [
      ...new Set(
        salesReturnItems.map((r) => r.sales_return.customer_id).filter(Boolean)
      ),
    ];
    const customers = await prisma.vendorscustomer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name_english: true },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c.name_english]));

    salesReturnItems.forEach((r) => {
      allTransactionsForLedger.push({
        date: r.sales_return.return_date,
        rawType: "SALES_RETURN",
        // DYNAMIC: Use the return_type field from the database
        vchType: r.sales_return.return_type,
        particulars: customerMap.get(r.sales_return.customer_id) || "N/A",
        vchNo: r.sales_return.return_no,
        autoVoucherNo: r.sales_return.auto_voucher_no,
        rate: Number(r.rate),
        quantity: Number(r.quantity), // Inflow
        // DYNAMIC: Acknowledge schema limitation
        warehouseName: getDefaultWarehouse(),
        description: r.item_name,
        narration: r.sales_return.notes || "",
      });
    });

    // E. DELIVERY CHALLAN (from Sales Orders)
    const deliveryChallanItems = await prisma.salesorderitems.findMany({
      where: {
        item_name: product.item_name,
        salesorder: { company_id: companyId },
      },
      include: { salesorder: true, warehouse: true },
    });
    deliveryChallanItems.forEach((dc) => {
      allTransactionsForLedger.push({
        date: dc.salesorder.quotation_date || dc.salesorder.created_at,
        rawType: "DELIVERY_CHALLAN",
        // DYNAMIC: This is a reasonable label as the table doesn't have a type field
        vchType: "Delivery Challan",
        particulars:
          dc.salesorder.qoutation_to_customer_name ||
          dc.salesorder.bill_to_customer_name ||
          "N/A",
        vchNo: dc.salesorder.Challan_no,
        autoVoucherNo:
          dc.salesorder.Manual_challan_no || dc.salesorder.Challan_no,
        rate: Number(dc.rate),
        quantity: -Number(dc.qty), // Outflow
        // DYNAMIC: Use the actual linked warehouse
        warehouseName: dc.warehouse?.warehouse_name || "Unassigned Warehouse",
        description: dc.item_name,
        narration: dc.salesorder.notes || "",
      });
    });

    // F. STOCK TRANSFERS
    const transferItems = await prisma.transfer_items.findMany({
      where: { product_id: productId, transfers: { company_id: companyId } },
      include: { transfers: true, warehouses: true },
    });
    transferItems.forEach((t) => {
      allTransactionsForLedger.push({
        date: t.transfers.transfer_date,
        rawType: "TRANSFER",
        // DYNAMIC: Create a more descriptive type
        vchType: `Transfer from ${t.warehouses.warehouse_name}`,
        particulars: `Transfer to Destination`, // This could be enhanced to get destination warehouse name
        vchNo: t.transfers.voucher_no,
        autoVoucherNo: t.transfers.manual_voucher_no || t.transfers.voucher_no,
        rate: Number(t.rate),
        quantity: -Number(t.qty), // Outflow from source warehouse
        // DYNAMIC: Use the actual source warehouse
        warehouseName: t.warehouses.warehouse_name,
        description: product.item_name,
        narration: t.narration || "",
      });
    });

    // G. ADJUSTMENTS
    const adjustmentItems = await prisma.adjustment_items.findMany({
      where: { product_id: productId, adjustments: { company_id: companyId } },
      include: { adjustments: true },
    });
    adjustmentItems.forEach((a) => {
      allTransactionsForLedger.push({
        date: a.adjustments.voucher_date,
        rawType: "ADJUSTMENT",
        // DYNAMIC: Create a more descriptive type
        vchType: `Stock Adjustment (${a.adjustments.adjustment_type})`,
        particulars: `Stock Adjustment`,
        vchNo: a.adjustments.voucher_no,
        autoVoucherNo:
          a.adjustments.manual_voucher_no || a.adjustments.voucher_no,
        rate: Number(a.rate),
        quantity: Number(a.quantity), // Can be positive or negative
        // DYNAMIC: Acknowledge schema limitation
        warehouseName: getDefaultWarehouse(),
        description: product.item_name,
        narration: a.narration || "",
      });
    });

    // H. OPENING STOCK
    if (product.initial_qty > 0) {
      allTransactionsForLedger.push({
        date: new Date(product.as_of_date || "2000-01-01"),
        rawType: "OPENING_STOCK",
        // DYNAMIC: This is a reasonable label
        vchType: "Opening Balance",
        particulars: "Opening Balance",
        vchNo: null,
        autoVoucherNo: `OPEN-${product.id}`,
        rate: Number(product.initial_cost || 0),
        quantity: Number(product.initial_qty), // Inflow
        // DYNAMIC: Acknowledge schema limitation
        warehouseName: getDefaultWarehouse(),
        description: product.item_name,
        narration: "Initial stock entry.",
      });
    }

    // 3️⃣ Process Data for UI Views
    allTransactionsForLedger.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // A. Create "All Transactions" Ledger with Running Balance
    let runningQuantity = 0;
    const all_transactions = allTransactionsForLedger.map((tx) => {
      const value = Math.abs(tx.quantity * tx.rate);
      const formattedDate = new Date(tx.date).toISOString().split("T")[0];
      // DYNAMIC: Use the dynamic vchType created earlier
      const vchType = tx.vchType;

      let inwardsQty = 0,
        inwardsValue = 0,
        outwardsQty = 0,
        outwardsValue = 0;

      if (tx.quantity > 0) {
        inwardsQty = tx.quantity;
        inwardsValue = value;
        runningQuantity += tx.quantity;
      } else {
        outwardsQty = Math.abs(tx.quantity);
        outwardsValue = value;
        runningQuantity -= Math.abs(tx.quantity);
      }

      return {
        DATE: formattedDate,
        "VCH TYPE": vchType,
        PARTICULARS: tx.particulars,
        "VCH NO": tx.vchNo,
        "VOUCHER NO (AUTO)": tx.autoVoucherNo,
        WAREHOUSE: tx.warehouseName,
        "RATE/UNIT": tx.rate.toFixed(2),
        "INWARDS (QTY)": inwardsQty,
        "INWARDS (VALUE)": inwardsValue.toFixed(2),
        "OUTWARDS (QTY)": outwardsQty,
        "OUTWARDS (VALUE)": outwardsValue.toFixed(2),
        "CLOSING QUANTITY": runningQuantity,
        DESCRIPTION: tx.description,
        NARRATION: tx.narration,
      };
    });

    // B. Create "Sales History" View
    const sales_history_array = allTransactionsForLedger
      .filter((tx) => tx.rawType === "SALE")
      .map((tx) => ({
        DATE: new Date(tx.date).toISOString().split("T")[0],
        "VCH TYPE": tx.vchType, // Use dynamic type
        PARTICULARS: tx.particulars,
        "VCH NO": tx.vchNo,
        "VOUCHER NO (AUTO)": tx.autoVoucherNo,
        WAREHOUSE: tx.warehouseName,
        "RATE/UNIT": tx.rate.toFixed(2),
        QTY: Math.abs(tx.quantity),
        VALUE: Math.abs(tx.quantity * tx.rate).toFixed(2),
        DESCRIPTION: tx.description,
        NARRATION: tx.narration,
      }));

    // C. Create "Purchase History" View
    const purchase_history_array = allTransactionsForLedger
      .filter((tx) => tx.rawType === "PURCHASE")
      .map((tx) => ({
        DATE: new Date(tx.date).toISOString().split("T")[0],
        "VCH TYPE": tx.vchType, // Use dynamic type
        PARTICULARS: tx.particulars,
        "VCH NO": tx.vchNo,
        "VOUCHER NO (AUTO)": tx.autoVoucherNo,
        WAREHOUSE: tx.warehouseName,
        "RATE/UNIT": tx.rate.toFixed(2),
        QTY: tx.quantity,
        VALUE: (tx.quantity * tx.rate).toFixed(2),
        DESCRIPTION: tx.description,
        NARRATION: tx.narration,
      }));

    // D. Create "Return History" View
    const return_history_array = allTransactionsForLedger
      .filter((tx) => tx.rawType.includes("RETURN"))
      .map((tx) => ({
        DATE: new Date(tx.date).toISOString().split("T")[0],
        "VCH TYPE": tx.vchType, // Use dynamic type
        PARTICULARS: tx.particulars,
        "VCH NO": tx.vchNo,
        "VOUCHER NO (AUTO)": tx.autoVoucherNo,
        WAREHOUSE: tx.warehouseName,
        "RATE/UNIT": tx.rate.toFixed(2),
        QTY: Math.abs(tx.quantity),
        VALUE: Math.abs(tx.quantity * tx.rate).toFixed(2),
        DESCRIPTION: tx.description,
        NARRATION: tx.narration,
      }));

    // 4️⃣ Calculate Totals and Inventory Values
    const total_sales = sales_history_array.reduce(
      (sum, item) => sum + parseFloat(item["VALUE"]),
      0
    );
    const total_purchase = purchase_history_array.reduce(
      (sum, item) => sum + parseFloat(item["VALUE"]),
      0
    );
    const total_return = return_history_array.reduce(
      (sum, item) => sum + parseFloat(item["VALUE"]),
      0
    );

    const total_sales_cost = sales_history_array.reduce(
      (sum, item) =>
        sum + parseFloat(item["QTY"]) * parseFloat(product.purchase_price || 0),
      0
    );
    const total_purchase_cost = total_purchase; // Cost is the same as total purchase value
    const total_return_cost = return_history_array.reduce((sum, item) => {
      // DYNAMIC: Check the VCH TYPE to apply the correct cost logic
      if (item["VCH TYPE"] === "Sales Return") {
        return (
          sum +
          parseFloat(item["QTY"]) * parseFloat(product.purchase_price || 0)
        );
      } else {
        // "Purchase Return"
        return sum + parseFloat(item["VALUE"]);
      }
    }, 0);

    const opening_inventory = Number(product.initial_qty || 0);
    const closing_inventory = Number(product.total_stock || 0);

    // 5️⃣ Assemble and Return Final Response
    return res.status(200).json({
      success: true,
      product_info: product,
      opening_inventory,
      closing_inventory,
      sales_history: {
        transactions: sales_history_array,
        total_sales: total_sales.toFixed(2),
        total_sales_cost: total_sales_cost.toFixed(2),
      },
      purchase_history: {
        transactions: purchase_history_array,
        total_purchase: total_purchase.toFixed(2),
        total_purchase_cost: total_purchase_cost.toFixed(2),
      },
      return_history: {
        transactions: return_history_array,
        total_return: total_return.toFixed(2),
        total_return_cost: total_return_cost.toFixed(2),
      },
      all_transactions,
    });
  } catch (error) {
    console.error("Inventory Details Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
