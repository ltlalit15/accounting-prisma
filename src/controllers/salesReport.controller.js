// src/controllers/salesReport.controller.js

import prisma from "../config/db.js";

// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Get Sales Report Summary Metrics
export const getSalesReportSummary = async (req, res) => {
  try {
    const { company_id, start_date, end_date } = req.query;

    // Build where clause
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    // Get all sales orders with items
    const salesOrders = await prisma.salesorder.findMany({
      where,
      include: {
        salesorderitems: true
      }
    });

    // Calculate metrics
    let totalAmount = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;
    let overdue = 0;

    salesOrders.forEach(order => {
      const orderTotal = toNumber(order.total_amount || order.total || 0);
      const amountReceived = toNumber(order.amount_received || 0);
      const balance = toNumber(order.balance || 0);
      const paymentStatus = order.payment_status || 'Pending';

      totalAmount += orderTotal;

      if (paymentStatus === 'Paid' || paymentStatus === 'paid') {
        totalPaid += amountReceived;
      } else {
        totalUnpaid += balance || (orderTotal - amountReceived);
      }

      // Check if overdue (balance > 0 and status is not paid)
      if (balance > 0 && paymentStatus !== 'Paid' && paymentStatus !== 'paid') {
        // Check if due date has passed (if due_date exists)
        if (order.due_date) {
          const dueDate = new Date(order.due_date);
          const today = new Date();
          if (dueDate < today) {
            overdue += balance;
          }
        } else {
          // If no due_date, consider unpaid as overdue
          overdue += balance;
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Sales report summary fetched successfully",
      data: {
        total_amount: totalAmount.toFixed(2),
        total_paid: totalPaid.toFixed(2),
        total_unpaid: totalUnpaid.toFixed(2),
        overdue: overdue.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error fetching sales report summary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Get Detailed Sales Report with Filtering
export const getSalesReport = async (req, res) => {
  try {
    const {
      company_id,
      start_date,
      end_date,
      category,
      customer_name,
      product_name,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause for sales orders
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    // Filter by customer name if provided
    if (customer_name) {
      where.OR = [
        { qoutation_to_customer_name: { contains: customer_name } },
        { bill_to_customer_name: { contains: customer_name } }
      ];
    }

    // Get sales orders with items
    const salesOrders = await prisma.salesorder.findMany({
      where,
      include: {
        salesorderitems: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Process and flatten the data
    let reportData = [];

    for (const order of salesOrders) {
      for (const item of order.salesorderitems) {
        // Get product details if product_id exists in item
        let product = null;
        let categoryName = null;
        let sku = null;
        let instockQty = 0;

        // Try to find product by item_name
        if (item.item_name) {
          product = await prisma.products.findFirst({
            where: {
              item_name: { contains: item.item_name },
              ...(company_id ? { company_id: parseInt(company_id) } : {})
            },
            include: {
              item_category: true
            }
          });

          if (product) {
            sku = product.sku || null;
            instockQty = toNumber(product.initial_qty || 0);
            categoryName = product.item_category?.item_category_name || null;
          }
        }

        // Apply filters
        if (category && categoryName && !categoryName.toLowerCase().includes(category.toLowerCase())) {
          continue;
        }
        if (product_name && item.item_name && !item.item_name.toLowerCase().includes(product_name.toLowerCase())) {
          continue;
        }

        // Get customer Arabic name if available
        let customerArabicName = null;
        if (order.qoutation_to_customer_name || order.bill_to_customer_name) {
          const customerName = order.qoutation_to_customer_name || order.bill_to_customer_name;
          const customer = await prisma.vendorscustomer.findFirst({
            where: {
              name_english: { contains: customerName },
              type: 'customer',
              ...(company_id ? { company_id: parseInt(company_id) } : {})
            }
          });
          if (customer) {
            customerArabicName = customer.name_arabic || null;
          }
        }

        reportData.push({
          sku: sku || 'N/A',
          customer_name: order.qoutation_to_customer_name || order.bill_to_customer_name || 'N/A',
          customer_name_arabic: customerArabicName || 'N/A',
          product_name: item.item_name || 'N/A',
          category: categoryName || 'N/A',
          sold_qty: toNumber(item.qty || 0),
          sold_amount: toNumber(item.amount || 0),
          instock_qty: instockQty,
          status: order.payment_status || 'Pending',
          order_date: order.created_at,
          order_id: order.id
        });
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = reportData.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: "Sales report fetched successfully",
      data: paginatedData,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_records: reportData.length,
        total_pages: Math.ceil(reportData.length / limitNum),
        showing_from: startIndex + 1,
        showing_to: Math.min(endIndex, reportData.length)
      }
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ✅ Get Sales Report (Optimized Version - Single Query)
export const getSalesReportOptimized = async (req, res) => {
  try {
    const {
      company_id,
      start_date,
      end_date,
      category,
      customer_name,
      product_name,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    if (customer_name) {
      where.OR = [
        { qoutation_to_customer_name: { contains: customer_name } },
        { bill_to_customer_name: { contains: customer_name } }
      ];
    }

    // Get all sales orders first (we'll paginate after filtering items)
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const salesOrders = await prisma.salesorder.findMany({
      where,
      include: {
        salesorderitems: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get all unique product names and customer names for batch lookup
    const productNames = [...new Set(salesOrders.flatMap(order => 
      order.salesorderitems.map(item => item.item_name).filter(Boolean)
    ))];

    const customerNames = [...new Set(salesOrders
      .map(order => order.qoutation_to_customer_name || order.bill_to_customer_name)
      .filter(Boolean)
    )];

    // Batch fetch products
    const products = await prisma.products.findMany({
      where: {
        item_name: { in: productNames },
        ...(company_id ? { company_id: parseInt(company_id) } : {})
      },
      include: {
        item_category: true
      }
    });

    // Batch fetch customers
    const customers = await prisma.vendorscustomer.findMany({
      where: {
        name_english: { in: customerNames },
        type: 'customer',
        ...(company_id ? { company_id: parseInt(company_id) } : {})
      }
    });

    // Create lookup maps
    const productMap = new Map();
    products.forEach(product => {
      if (product.item_name) {
        productMap.set(product.item_name.toLowerCase(), {
          sku: product.sku,
          instock_qty: toNumber(product.initial_qty || 0),
          category: product.item_category?.item_category_name || null
        });
      }
    });

    const customerMap = new Map();
    customers.forEach(customer => {
      if (customer.name_english) {
        customerMap.set(customer.name_english.toLowerCase(), customer.name_arabic || null);
      }
    });

    // Process and flatten the data
    let reportData = [];

    for (const order of salesOrders) {
      for (const item of order.salesorderitems) {
        const itemName = item.item_name || '';
        const productInfo = productMap.get(itemName.toLowerCase()) || {
          sku: 'N/A',
          instock_qty: 0,
          category: null
        };

        // Apply filters
        if (category && productInfo.category && 
            !productInfo.category.toLowerCase().includes(category.toLowerCase())) {
          continue;
        }
        if (product_name && itemName && 
            !itemName.toLowerCase().includes(product_name.toLowerCase())) {
          continue;
        }

        const customerName = order.qoutation_to_customer_name || order.bill_to_customer_name || '';
        const customerArabicName = customerMap.get(customerName.toLowerCase()) || 'N/A';

        reportData.push({
          sku: productInfo.sku || 'N/A',
          customer_name: customerName || 'N/A',
          customer_name_arabic: customerArabicName,
          product_name: itemName || 'N/A',
          category: productInfo.category || 'N/A',
          sold_qty: toNumber(item.qty || 0),
          sold_amount: toNumber(item.amount || 0),
          instock_qty: productInfo.instock_qty,
          status: order.payment_status || 'Pending',
          order_date: order.created_at,
          order_id: order.id
        });
      }
    }

    // Apply pagination after filtering
    const totalRecords = reportData.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = reportData.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: "Sales report fetched successfully",
      data: paginatedData,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limitNum),
        showing_from: totalRecords > 0 ? startIndex + 1 : 0,
        showing_to: Math.min(endIndex, totalRecords)
      }
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// export const getSalesReportTable = async (req, res) => {
//   try {
//     const { company_id } = req.query;

//     if (!company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "company_id is required",
//       });
//     }

//     // Fetch all sales with joins
//     const sales = await prisma.pos_invoice_products.findMany({
//       where: {
//         invoice: { company_id: Number(company_id) }
//       },
//       include: {
//         invoice: {
//           include: {
//             customer: true,
//           },
//         },
//         product: {
//           include: {
//             item_category: true,
//           },
//         },
//       },
//       orderBy: { id: "desc" },
//     });

//     // DEBUG - See raw customer data
//     console.log("RAW SALES DATA:", JSON.stringify(sales, null, 2));

//     // Transform for UI table
//     const table = sales.map((row) => ({
//       sku: row.product?.sku ?? "",
//       customerName: row.invoice.customer?.name_english ?? "",
//       customerArabicName: row.invoice.customer?.name_arabic ?? "",
//       productName: row.product?.item_name ?? "",
//       category: row.product?.item_category?.item_category_name ?? "",
//       soldQty: row.quantity ?? 0,
//       soldAmount: Number(row.price ?? 0) * Number(row.quantity ?? 0),
//       instockQty: row.product?.total_stock ?? 0,
//       status: row.invoice.payment_status,
//     }));

//     // ----- TOTALS CALCULATION -----

//     // Total amount (sum of all soldAmount)
//     const totalAmount = table.reduce((sum, row) => sum + row.soldAmount, 0);

//     // Paid
//     const totalPaid = table
//       .filter((row) => row.status?.toLowerCase() === "paid")
//       .reduce((sum, row) => sum + row.soldAmount, 0);

//     // Unpaid / Pending
//     const totalUnpaid = table
//       .filter(
//         (row) =>
//           row.status?.toLowerCase() === "pending" ||
//           row.status?.toLowerCase() === "unpaid"
//       )
//       .reduce((sum, row) => sum + row.soldAmount, 0);

//     // Overdue
//     const overdue = table
//       .filter((row) => row.status?.toLowerCase() === "overdue")
//       .reduce((sum, row) => sum + row.soldAmount, 0);

//     return res.status(200).json({
//       success: true,
//       totals: {
//         totalAmount,
//         totalPaid,
//         totalUnpaid,
//         overdue,
//       },
//       table,
//     });

//   } catch (error) {
//     console.log("Sales Table Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching sales table",
//       error: error.message,
//     });
//   }
// };

export const getSalesReportTable = async (req, res) => {
  try {
    const company_id = Number(req.query.company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
      });
    }

    // 1️⃣ Fetch orders + items
    const orders = await prisma.salesorder.findMany({
      where: { company_id },
      include: { salesorderitems: true },
      orderBy: { id: "desc" },
    });

    const table = [];

    for (const order of orders) {
      // Pick the best available name in SO
      const rawName =
        order.bill_to_customer_name ||
        order.bill_to_company_name ||
        order.qoutation_to_customer_name ||
        order.payment_received_customer_name ||
        "";

      // Lookup vendorscustomer (if rawName exists)
      let customer = null;
      if (rawName.trim() !== "") {
        customer = await prisma.vendorscustomer.findFirst({
          where: {
            company_id,
            OR: [
              { name_english: rawName },
              { name_arabic: rawName },
              { company_name: rawName },
            ],
          },
        });
      }

      for (const item of order.salesorderitems) {
        // Fetch product by item_name
        const product = await prisma.products.findFirst({
          where: {
            company_id,
            item_name: item.item_name,
          },
          include: {
            item_category: true,
            product_warehouses: true,
          },
        });

        // Stock only from selected warehouse
        const stockRecord = product?.product_warehouses?.find(
          (w) => w.warehouse_id === item.warehouse_id
        );

        table.push({
          sku: order?.SO_no || "",
          customerName: customer?.name_english || rawName,
          customerArabicName: customer?.name_arabic || "",
          productName: item.item_name,
          category: product?.item_category?.item_category_name || "",
          soldQty: Number(item.qty),
          soldAmount: Number(item.amount),
          instockQty: stockRecord?.stock_qty || 0,
          status: order.payment_status || order.sales_order_status || "Pending",
        });
      }
    }

    const normalizeStatus = (status) => {
  if (!status) return "pending";
  const s = status.toLowerCase();

  if (["paid", "completed", "partial", "partialpaid"].includes(s))
    return "paid";

  if (["overdue", "late"].includes(s))
    return "overdue";

  if (["pending", "unpaid"].includes(s))
    return "pending";

  return "pending";
};

    // Totals
    const totalAmount = table.reduce((s, r) => s + r.soldAmount, 0);
    const totalPaid = table
  .filter((r) => normalizeStatus(r.status) === "paid")
  .reduce((s, r) => s + r.soldAmount, 0);

const totalUnpaid = table
  .filter((r) => normalizeStatus(r.status) === "pending")
  .reduce((s, r) => s + r.soldAmount, 0);

const overdue = table
  .filter((r) => normalizeStatus(r.status) === "overdue")
  .reduce((s, r) => s + r.soldAmount, 0);

    return res.status(200).json({
      success: true,
      totals: {
        totalAmount,
        totalPaid,
        totalUnpaid,
        overdue,
      },
      table,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales report",
      error: error.message,
    });
  }
};



