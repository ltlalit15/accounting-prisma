
{/* 
// Create Purchase Order
export const createPurchaseOrder = async (req, res) => {
  try {
    const {
      company_id,
      company_name,
      company_address,
      company_email,
      company_phone,
      logo_url,
      quotation_from_vendor_name,
      quotation_from_vendor_address,
      quotation_from_vendor_email,
      quotation_from_vendor_phone,
      ref_no,
      Manual_ref_ro,
      quotation_no,
      manual_quo_no,
      quotation_date,
      valid_till,
      due_date,
      subtotal,
      tax,
      discount,
      total,
      bank_name,
      account_no,
      account_holder,
      ifsc_code,
      bank_details,
      notes,
      terms,
      signature_url,
      photo_url,
      attachment_url,
      bill_to_attention_name,
      bill_to_company_name,
      bill_to_company_address,
      bill_to_company_phone,
      bill_to_company_email,
      bill_to_vendor_name,
      bill_to_vendor_address,
      bill_to_vendor_email,
      bill_to_vendor_phone,
      ship_to_attention_name,
      ship_to_company_name,
      ship_to_company_address,
      ship_to_company_phone,
      ship_to_company_email,
      ship_to_vendor_name,
      ship_to_vendor_address,
      ship_to_vendor_email,
      ship_to_vendor_phone,
      payment_made_vendor_name,
      payment_made_vendor_address,
      payment_made_vendor_email,
      payment_made_vendor_phone,
      driver_name,
      driver_phone,
      driver_details,
      amount_paid,
      total_amount,
      payment_status,
      total_bill,
      balance,
      payment_note,
      quotation_status,
      purchase_order_status,
      goods_receipt_status,
      bill_status,
      draft_status,
      PO_no,
      Manual_PO_ref,
      GR_no,
      Manual_GR_no,
      Bill_no,
      Manual_Bill_no,
      Payment_no,
      Manual_payment_no,
      vendor_ref,
      items // Array of items
    } = req.body;

    // Validation
    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required"
      });
    }

    // Create Purchase Order with Items
    const purchaseOrder = await prisma.purchaseorder.create({
      data: {
        company_id,
        company_name,
        company_address,
        company_email,
        company_phone,
        logo_url,
        quotation_from_vendor_name,
        quotation_from_vendor_address,
        quotation_from_vendor_email,
        quotation_from_vendor_phone,
        ref_no,
        Manual_ref_ro,
        quotation_no,
        manual_quo_no,
        quotation_date: quotation_date ? new Date(quotation_date) : null,
        valid_till: valid_till ? new Date(valid_till) : null,
        due_date: due_date ? new Date(due_date) : null,
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total) || 0,
        bank_name,
        account_no,
        account_holder,
        ifsc_code,
        bank_details,
        notes,
        terms,
        signature_url,
        photo_url,
        attachment_url,
        bill_to_attention_name,
        bill_to_company_name,
        bill_to_company_address,
        bill_to_company_phone,
        bill_to_company_email,
        bill_to_vendor_name,
        bill_to_vendor_address,
        bill_to_vendor_email,
        bill_to_vendor_phone,
        ship_to_attention_name,
        ship_to_company_name,
        ship_to_company_address,
        ship_to_company_phone,
        ship_to_company_email,
        ship_to_vendor_name,
        ship_to_vendor_address,
        ship_to_vendor_email,
        ship_to_vendor_phone,
        payment_made_vendor_name,
        payment_made_vendor_address,
        payment_made_vendor_email,
        payment_made_vendor_phone,
        driver_name,
        driver_phone,
        driver_details,
        amount_paid: parseFloat(amount_paid) || 0,
        total_amount: parseFloat(total_amount) || 0,
        payment_status: payment_status || "Pending",
        total_bill: parseFloat(total_bill) || 0,
        balance: parseFloat(balance) || 0,
        payment_note,
        quotation_status: quotation_status || "Pending",
        purchase_order_status: purchase_order_status || "Pending",
        goods_receipt_status: goods_receipt_status || "Pending",
        bill_status: bill_status || "Pending",
        draft_status: draft_status || "Draft",
        PO_no,
        Manual_PO_ref,
        GR_no,
        Manual_GR_no,
        Bill_no,
        Manual_Bill_no,
        Payment_no,
        Manual_payment_no,
        vendor_ref,
        
        // Create items
        purchaseorderitems: {
          create: items.map(item => ({
            item_name: item.item_name,
            qty: parseFloat(item.qty),
            rate: parseFloat(item.rate),
            tax_percent: parseFloat(item.tax_percent) || 0,
            discount: parseFloat(item.discount) || 0,
            amount: parseFloat(item.amount)
          }))
        }
      },
      include: {
        purchaseorderitems: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "Purchase Order created successfully",
      data: purchaseOrder
    });

  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Purchase Order",
      error: error.message
    });
  }
};

// Get All Purchase Orders with Filters
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const {
      company_id,
      purchase_order_status,
      payment_status,
      quotation_status,
      draft_status,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause
    const where = {};

    if (company_id) {
      where.company_id = parseInt(company_id);
    }

    if (purchase_order_status) {
      where.purchase_order_status = purchase_order_status;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (quotation_status) {
      where.quotation_status = quotation_status;
    }

    if (draft_status) {
      where.draft_status = draft_status;
    }

    if (start_date || end_date) {
      where.quotation_date = {};
      if (start_date) {
        where.quotation_date.gte = new Date(start_date);
      }
      if (end_date) {
        where.quotation_date.lte = new Date(end_date);
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch Purchase Orders
    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseorder.findMany({
        where,
        include: {
          purchaseorderitems: true
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.purchaseorder.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: "Purchase Orders fetched successfully",
      data: {
        purchaseOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error("Get Purchase Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Purchase Orders",
      error: error.message
    });
  }
};

// Get Purchase Order by ID
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseorder.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        purchaseorderitems: true
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase Order fetched successfully",
      data: purchaseOrder
    });

  } catch (error) {
    console.error("Get Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Purchase Order",
      error: error.message
    });
  }
};

// Update Purchase Order
export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if exists
    const exists = await prisma.purchaseorder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // Separate items from main data
    const { items, ...mainData } = updateData;

    // Update Purchase Order
    const updatedPurchaseOrder = await prisma.purchaseorder.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...mainData,
        updated_at: new Date(),
        
        // Update items if provided
        ...(items && {
          purchaseorderitems: {
            deleteMany: {},
            create: items.map(item => ({
              item_name: item.item_name,
              qty: parseFloat(item.qty),
              rate: parseFloat(item.rate),
              tax_percent: parseFloat(item.tax_percent) || 0,
              discount: parseFloat(item.discount) || 0,
              amount: parseFloat(item.amount)
            }))
          }
        })
      },
      include: {
        purchaseorderitems: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully",
      data: updatedPurchaseOrder
    });

  } catch (error) {
    console.error("Update Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order",
      error: error.message
    });
  }
};

// Delete Purchase Order
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exists
    const exists = await prisma.purchaseorder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // Delete (items will be cascade deleted)
    await prisma.purchaseorder.delete({
      where: {
        id: parseInt(id)
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Order deleted successfully"
    });

  } catch (error) {
    console.error("Delete Purchase Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Purchase Order",
      error: error.message
    });
  }
};

// Update Purchase Order Status
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { purchase_order_status, payment_status, quotation_status, draft_status } = req.body;

    const updateData = {};
    
    if (purchase_order_status) updateData.purchase_order_status = purchase_order_status;
    if (payment_status) updateData.payment_status = payment_status;
    if (quotation_status) updateData.quotation_status = quotation_status;
    if (draft_status) updateData.draft_status = draft_status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No status field provided"
      });
    }

    const updatedPurchaseOrder = await prisma.purchaseorder.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Order status updated successfully",
      data: updatedPurchaseOrder
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order status",
      error: error.message
    });
  }
};

*/}
// Helper: structure a purchase order into the same "steps" + shipping_details format

import { uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/db.js";

// Helper function to convert base64 to buffer
const base64ToBuffer = (base64String) => {
  if (!base64String || !base64String.startsWith("data:")) {
    return null;
  }

  const base64Data = base64String.split(",")[1];
  return Buffer.from(base64Data, "base64");
};

// Helper function to check if a step is completed
const isStepCompleted = (stepData, requiredFields) => {
  if (!stepData) return false;

  return requiredFields.every((field) => {
    const value = stepData[field];
    return value !== null && value !== undefined && value !== "";
  });
};

// Helper function to determine step status
const determineStepStatus = (stepData, stepType) => {
  if (!stepData) return "pending";

  const requiredFields = {
    quotation: ["quotation_no", "quotation_date"],
    sales_order: ["SO_no"],
    delivery_challan: ["Challan_no"],
    invoice: ["invoice_no", "invoice_date"],
    payment: ["Payment_no", "amount_received"],
  };

  return isStepCompleted(stepData, requiredFields[stepType])
    ? "completed"
    : "pending";
};

// Helper function to handle file uploads
const handleFileUploads = async (data, fileFields) => {
  const result = { ...data };

  for (const field of fileFields) {
    if (result[field]) {
      try {
        // Convert base64 to buffer if needed
        const fileBuffer = base64ToBuffer(result[field]);
        if (fileBuffer) {
          const uploaded = await uploadToCloudinary(fileBuffer);
          result[field] = uploaded || "";
        }
      } catch (error) {
        console.error(`Error uploading ${field}:`, error);
        result[field] = "";
      }
    }
  }

  return result;
};
// const structurePurchaseOrderBySteps = (order) => {
//   return {
//     company_info: {
//       company_id: order.company_id,
//       company_name: order.company_name,
//       company_address: order.company_address,
//       company_email: order.company_email,
//       company_phone: order.company_phone,
//       logo_url: order.logo_url,
//       bank_name: order.bank_name,
//       account_no: order.account_no,
//       account_holder: order.account_holder,
//       ifsc_code: order.ifsc_code,
//       terms: order.terms,
//       id: order.id,
//       created_at: order.created_at,
//       updated_at: order.updated_at,
//     },

//     shipping_details: {
//       bill_to_name: order.bill_to_company_name,
//       bill_to_address: order.bill_to_company_address,
//       bill_to_email: order.bill_to_company_email,
//       bill_to_phone: order.bill_to_company_phone,
//       bill_to_attention_name: order.bill_to_attention_name,

//       ship_to_name: order.ship_to_company_name,
//       ship_to_address: order.ship_to_company_address,
//       ship_to_email: order.ship_to_company_email,
//       ship_to_phone: order.ship_to_company_phone,
//       ship_to_attention_name: order.ship_to_attention_name,
//     },

//     items: order.purchaseorderitems || [],

//     sub_total: order.subtotal,
//     total: order.total,

//     steps: [
//       {
//         step: "quotation",
//         status: order.quotation_status,
//         data: {
//           quotation_no: order.quotation_no,
//           manual_quo_no: order.manual_quo_no,
//           quotation_date: order.quotation_date,
//           valid_till: order.valid_till,
//           quotation_from_vendor_name: order.quotation_from_vendor_name,
//           quotation_from_vendor_address: order.quotation_from_vendor_address,
//           quotation_from_vendor_email: order.quotation_from_vendor_email,
//           quotation_from_vendor_phone: order.quotation_from_vendor_phone,
//           notes: order.notes,
//         },
//       },
//       {
//         step: "purchase_order",
//         status: order.purchase_order_status,
//         data: {
//           PO_no: order.PO_no,
//           Manual_PO_ref: order.Manual_PO_ref,
//           manual_quo_no: order.manual_quo_no,
//         },
//       },
//       {
//         step: "goods_receipt",
//         status: order.goods_receipt_status,
//         data: {
//           GR_no: order.GR_no,
//           Manual_GR_no: order.Manual_GR_no,
//         },
//       },
//       {
//         step: "bill",
//         status: order.bill_status,
//         data: {
//           Bill_no: order.Bill_no,
//           manual_bill_no: order.Manual_Bill_no,
//           due_date: order.due_date,
//         },
//       },
//       {
//         step: "payment",
//         status: order.payment_status,
//         data: {
//           Payment_no: order.Payment_no,
//           Manual_payment_no: order.Manual_payment_no,
//           payment_date: order.payment_date,
//           amount_paid: order.amount_paid,
//           payment_note: order.payment_note,
//         },
//       },
//     ],

//     additional_info: {
//       signature_url: order.signature_url,
//       photo_url: order.photo_url,
//       attachment_url: order.attachment_url,
//     },
//   };
// };

// export const createOrUpdatePurchaseOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ================= VALIDATION =================
//     if (!orderId && !body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory for new orders",
//       });
//     }

//     if (!orderId && (!Array.isArray(body.items) || body.items.length === 0)) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty for new orders",
//       });
//     }

//     let existingOrder = null;
//     let existingItems = [];

//     if (orderId) {
//       existingOrder = await prisma.purchaseorder.findUnique({
//         where: { id: orderId },
//         include: { purchaseorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Purchase order not found",
//         });
//       }

//       existingItems = existingOrder.purchaseorderitems || [];
//     }

//     // ================= FILE UPLOAD HANDLER =================
//     if (body.company_info) {
//       body.company_info = await handleFileUploads(body.company_info, ["logo_url"]);
//     }

//     if (body.additional_info) {
//       body.additional_info = await handleFileUploads(body.additional_info, [
//         "signature_url",
//         "photo_url",
//         "attachment_url",
//       ]);
//     }

//     // ================= STEP RULES (same pattern) =================
//     const stepCompleted = (data, fields) =>
//       fields.every((field) => data[field] !== "" && data[field] !== null && data[field] !== undefined);

//     const stepRules = {
//       quotation: ["quotation_no", "quotation_date"],
//       purchase_order: ["PO_no"],
//       goods_receipt: ["GR_no"],
//       bill: ["Bill_no", "due_date"],
//       payment: ["Payment_no", "amount_paid"],
//     };

//     const steps = {
//       quotation: orderId
//         ? {
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             quotation_from_vendor_name: existingOrder.quotation_from_vendor_name || "",
//             quotation_from_vendor_address: existingOrder.quotation_from_vendor_address || "",
//             quotation_from_vendor_email: existingOrder.quotation_from_vendor_email || "",
//             quotation_from_vendor_phone: existingOrder.quotation_from_vendor_phone || "",
//             notes: existingOrder.notes || "",
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       purchase_order: orderId
//         ? {
//             PO_no: existingOrder.PO_no || "",
//             Manual_PO_ref: existingOrder.Manual_PO_ref || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             purchase_order_status: existingOrder.purchase_order_status,
//             ...(body.steps?.purchase_order || {}),
//           }
//         : body.steps?.purchase_order || {},

//       goods_receipt: orderId
//         ? {
//             GR_no: existingOrder.GR_no || "",
//             Manual_GR_no: existingOrder.Manual_GR_no || "",
//             goods_receipt_status: existingOrder.goods_receipt_status,
//             ...(body.steps?.goods_receipt || {}),
//           }
//         : body.steps?.goods_receipt || {},

//       bill: orderId
//         ? {
//             Bill_no: existingOrder.Bill_no || "",
//             Manual_Bill_no: existingOrder.Manual_Bill_no || "",
//             due_date: existingOrder.due_date,
//             bill_status: existingOrder.bill_status,
//             ...(body.steps?.bill || {}),
//           }
//         : body.steps?.bill || {},

//       payment: orderId
//         ? {
//             Payment_no: existingOrder.Payment_no || "",
//             Manual_payment_no: existingOrder.Manual_payment_no || "",
//             payment_date: existingOrder.payment_date,
//             amount_paid: existingOrder.amount_paid || 0,
//             payment_note: existingOrder.payment_note || "",
//             payment_status: existingOrder.payment_status,
//             ...(body.steps?.payment || {}),
//           }
//         : body.steps?.payment || {},
//     };

//     for (const step of Object.keys(steps)) {
//       steps[step].status = stepCompleted(steps[step], stepRules[step]) ? "completed" : "pending";
//     }

//     // ================= SHIPPING DETAILS =================
//     const shipping = body.shipping_details
//       ? {
//           bill_to_company_name: body.shipping_details.bill_to_name || "",
//           bill_to_company_address: body.shipping_details.bill_to_address || "",
//           bill_to_company_email: body.shipping_details.bill_to_email || "",
//           bill_to_company_phone: body.shipping_details.bill_to_phone || "",
//           bill_to_attention_name: body.shipping_details.bill_to_attention_name || "",

//           ship_to_company_name: body.shipping_details.ship_to_name || "",
//           ship_to_company_address: body.shipping_details.ship_to_address || "",
//           ship_to_company_email: body.shipping_details.ship_to_email || "",
//           ship_to_company_phone: body.shipping_details.ship_to_phone || "",
//           ship_to_attention_name: body.shipping_details.ship_to_attention_name || "",
//         }
//       : orderId
//       ? {
//           bill_to_company_name: existingOrder.bill_to_company_name || "",
//           bill_to_company_address: existingOrder.bill_to_company_address || "",
//           bill_to_company_email: existingOrder.bill_to_company_email || "",
//           bill_to_company_phone: existingOrder.bill_to_company_phone || "",
//           bill_to_attention_name: existingOrder.bill_to_attention_name || "",

//           ship_to_company_name: existingOrder.ship_to_company_name || "",
//           ship_to_company_address: existingOrder.ship_to_company_address || "",
//           ship_to_company_email: existingOrder.ship_to_company_email || "",
//           ship_to_company_phone: existingOrder.ship_to_company_phone || "",
//           ship_to_attention_name: existingOrder.ship_to_attention_name || "",
//         }
//       : {};

//     // ================= COMPANY INFO =================
//     const companyData = body.company_info
//       ? {
//           company_id: Number(body.company_info.company_id),
//           company_name: body.company_info.company_name,
//           company_address: body.company_info.company_address,
//           company_email: body.company_info.company_email,
//           company_phone: body.company_info.company_phone,
//           logo_url: body.company_info.logo_url ?? "",
//           bank_name: body.company_info.bank_name ?? "",
//           account_no: body.company_info.account_no ?? "",
//           account_holder: body.company_info.account_holder ?? "",
//           ifsc_code: body.company_info.ifsc_code ?? "",
//           terms: body.company_info.terms ?? "",
//         }
//       : orderId
//       ? {
//           company_id: existingOrder.company_id,
//           company_name: existingOrder.company_name,
//           company_address: existingOrder.company_address,
//           company_email: existingOrder.company_email,
//           company_phone: existingOrder.company_phone,
//           logo_url: existingOrder.logo_url,
//           bank_name: existingOrder.bank_name,
//           account_no: existingOrder.account_no,
//           account_holder: existingOrder.account_holder,
//           ifsc_code: existingOrder.ifsc_code,
//           terms: existingOrder.terms,
//         }
//       : {};

//     // ================= ITEMS =================
//     const itemsData = body.items
//       ? body.items.map((item) => ({
//           item_name: item.item_name,
//           qty: Number(item.qty),
//           rate: Number(item.rate),
//           tax_percent: Number(item.tax_percent ?? 0),
//           discount: Number(item.discount ?? 0),
//           amount: Number(item.amount ?? 0),
//         }))
//       : orderId
//       ? existingItems
//       : [];

//     // ================= DB PAYLOAD =================
//     const dbData = {
//       ...companyData,
//       ...shipping,

//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date ? new Date(steps.quotation.quotation_date) : null,
//       valid_till: steps.quotation.valid_till ? new Date(steps.quotation.valid_till) : null,
//       quotation_status: steps.quotation.status,
//       quotation_from_vendor_name: steps.quotation.quotation_from_vendor_name || "",
//       quotation_from_vendor_address: steps.quotation.quotation_from_vendor_address || "",
//       quotation_from_vendor_email: steps.quotation.quotation_from_vendor_email || "",
//       quotation_from_vendor_phone: steps.quotation.quotation_from_vendor_phone || "",
//       notes: steps.quotation.notes || "",

//       PO_no: steps.purchase_order.PO_no || "",
//       Manual_PO_ref: steps.purchase_order.Manual_PO_ref || "",
//       manual_quo_no: steps.purchase_order.manual_quo_no || "",
//       purchase_order_status: steps.purchase_order.status,

//       GR_no: steps.goods_receipt.GR_no || "",
//       Manual_GR_no: steps.goods_receipt.Manual_GR_no || "",
//       goods_receipt_status: steps.goods_receipt.status,

//       Bill_no: steps.bill.Bill_no || "",
//       Manual_Bill_no: steps.bill.Manual_Bill_no || "",
//       due_date: steps.bill.due_date ? new Date(steps.bill.due_date) : null,
//       bill_status: steps.bill.status,

//       Payment_no: steps.payment.Payment_no || "",
//       Manual_payment_no: steps.payment.Manual_payment_no || "",
//       payment_date: steps.payment.payment_date ? new Date(steps.payment.payment_date) : null,
//       payment_status: steps.payment.status,
//       amount_paid: Number(steps.payment.amount_paid) || 0,
//       payment_note: steps.payment.payment_note || "",

//       signature_url: body.additional_info?.signature_url ?? existingOrder?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? existingOrder?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? existingOrder?.attachment_url ?? "",

//       // sub_total and total accepted from frontend (no calc)
//       subtotal: body.sub_total ? Number(body.sub_total) : existingOrder?.subtotal || 0,
//       total: body.total ? Number(body.total) : existingOrder?.total || 0,

//       updated_at: new Date(),
//     };

//     // ================= CREATE OR UPDATE =================
//     let savedOrder;

//     if (orderId) {
//       if (body.items) {
//         await prisma.purchaseorderitems.deleteMany({
//           where: { purchase_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.purchaseorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           ...(body.items && { purchaseorderitems: { create: itemsData } }),
//         },
//         include: { purchaseorderitems: true },
//       });
//     } else {
//       savedOrder = await prisma.purchaseorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           purchaseorderitems: { create: itemsData },
//         },
//         include: { purchaseorderitems: true },
//       });
//     }

//     // ================= RESPONSE =================
//     const response = structurePurchaseOrderBySteps(savedOrder);

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Purchase order updated" : "Purchase order created",
//       data: response,
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };

// purchaseOrderController.js

// export const createOrUpdatePurchaseOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ------------------ existing order (for PUT) ------------------
//     let existingOrder = null;
//     let existingItems = [];

//     if (orderId) {
//       existingOrder = await prisma.purchaseorder.findUnique({
//         where: { id: orderId },
//         include: { purchaseorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Purchase order not found",
//         });
//       }

//       existingItems = existingOrder.purchaseorderitems || [];
//     }

//     // ------------------ file uploads (company / additional) ------------------
//     if (body.company_info) {
//       body.company_info = await handleFileUploads(body.company_info, ["logo_url"]);
//     }

//     if (body.additional_info) {
//       body.additional_info = await handleFileUploads(body.additional_info, [
//         "signature_url",
//         "photo_url",
//         "attachment_url",
//       ]);
//     }

//     // ------------------ step completion rules ------------------
//     const stepCompleted = (data, fields) =>
//       Array.isArray(fields) && fields.length > 0
//         ? fields.every((f) => data[f] !== "" && data[f] !== null && data[f] !== undefined)
//         : false;

//     const stepRules = {
//       quotation: [
//         "quotation_from_vendor_name",
//         "quotation_from_vendor_address",
//         "quotation_from_vendor_email",
//         "quotation_from_vendor_phone",
//         "ref_no",
//         "quotation_no",
//         "quotation_date",
//       ],
//       purchase_order: ["PO_no"],
//       goods_receipt: ["GR_no"],
//       bill: ["Bill_no"],
//       payment: ["Payment_no", "amount_paid"],
//     };

//     // ------------------ merge steps (use existing values when updating) ------------------
//     const steps = {
//       quotation: orderId
//         ? {
//             quotation_from_vendor_name: existingOrder.quotation_from_vendor_name || "",
//             quotation_from_vendor_address: existingOrder.quotation_from_vendor_address || "",
//             quotation_from_vendor_email: existingOrder.quotation_from_vendor_email || "",
//             quotation_from_vendor_phone: existingOrder.quotation_from_vendor_phone || "",
//             ref_no: existingOrder.ref_no || "",
//             Manual_ref_ro: existingOrder.Manual_ref_ro || "",
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             due_date: existingOrder.due_date,
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       purchase_order: orderId
//         ? {
//             PO_no: existingOrder.PO_no || "",
//             Manual_PO_ref: existingOrder.Manual_PO_ref || "",
//             purchase_order_status: existingOrder.purchase_order_status,
//             ...(body.steps?.purchase_order || {}),
//           }
//         : body.steps?.purchase_order || {},

//       goods_receipt: orderId
//         ? {
//             GR_no: existingOrder.GR_no || "",
//             Manual_GR_no: existingOrder.Manual_GR_no || "",
//             goods_receipt_status: existingOrder.goods_receipt_status,
//             ...(body.steps?.goods_receipt || {}),
//           }
//         : body.steps?.goods_receipt || {},

//       bill: orderId
//         ? {
//             Bill_no: existingOrder.Bill_no || "",
//             Manual_Bill_no: existingOrder.Manual_Bill_no || "",
//             due_date: existingOrder.due_date,
//             bill_status: existingOrder.bill_status,
//             ...(body.steps?.bill || {}),
//           }
//         : body.steps?.bill || {},

//       payment: orderId
//         ? {
//             Payment_no: existingOrder.Payment_no || "",
//             Manual_payment_no: existingOrder.Manual_payment_no || "",
//             amount_paid: existingOrder.amount_paid || 0,
//             total_amount: existingOrder.total_amount || 0,
//             payment_status: existingOrder.payment_status || "Pending",
//             total_bill: existingOrder.total_bill || 0,
//             balance: existingOrder.balance || 0,
//             payment_note: existingOrder.payment_note || "",
//             payment_made_vendor_name: existingOrder.payment_made_vendor_name || "",
//             payment_made_vendor_address: existingOrder.payment_made_vendor_address || "",
//             payment_made_vendor_email: existingOrder.payment_made_vendor_email || "",
//             payment_made_vendor_phone: existingOrder.payment_made_vendor_phone || "",
//             ...(body.steps?.payment || {}),
//           }
//         : body.steps?.payment || {},
//     };

//     // compute status for each step
//     for (const s of Object.keys(steps)) {
//       steps[s].status = stepCompleted(steps[s], stepRules[s]) ? "Completed" : "Pending";
//     }

//     // ------------------ shipping block merge ------------------
//     const shipping = body.shipping_details
//       ? {
//           // bill to (company/vendor)
//           bill_to_attention_name: body.shipping_details.bill_to_attention_name || "",
//           bill_to_company_name: body.shipping_details.bill_to_company_name || body.shipping_details.bill_to_vendor_name || "",
//           bill_to_company_address: body.shipping_details.bill_to_company_address || body.shipping_details.bill_to_vendor_address || "",
//           bill_to_company_phone: body.shipping_details.bill_to_company_phone || body.shipping_details.bill_to_vendor_phone || "",
//           bill_to_company_email: body.shipping_details.bill_to_company_email || body.shipping_details.bill_to_vendor_email || "",

//           // ship to (company/vendor)
//           ship_to_attention_name: body.shipping_details.ship_to_attention_name || "",
//           ship_to_company_name: body.shipping_details.ship_to_company_name || body.shipping_details.ship_to_vendor_name || "",
//           ship_to_company_address: body.shipping_details.ship_to_company_address || body.shipping_details.ship_to_vendor_address || "",
//           ship_to_company_phone: body.shipping_details.ship_to_company_phone || body.shipping_details.ship_to_vendor_phone || "",
//           ship_to_company_email: body.shipping_details.ship_to_company_email || body.shipping_details.ship_to_vendor_email || "",
//         }
//       : orderId
//       ? {
//           bill_to_attention_name: existingOrder.bill_to_attention_name || "",
//           bill_to_company_name: existingOrder.bill_to_company_name || existingOrder.bill_to_vendor_name || "",
//           bill_to_company_address: existingOrder.bill_to_company_address || existingOrder.bill_to_vendor_address || "",
//           bill_to_company_phone: existingOrder.bill_to_company_phone || existingOrder.bill_to_vendor_phone || "",
//           bill_to_company_email: existingOrder.bill_to_company_email || existingOrder.bill_to_vendor_email || "",

//           ship_to_attention_name: existingOrder.ship_to_attention_name || "",
//           ship_to_company_name: existingOrder.ship_to_company_name || existingOrder.ship_to_vendor_name || "",
//           ship_to_company_address: existingOrder.ship_to_company_address || existingOrder.ship_to_vendor_address || "",
//           ship_to_company_phone: existingOrder.ship_to_company_phone || existingOrder.ship_to_vendor_phone || "",
//           ship_to_company_email: existingOrder.ship_to_company_email || existingOrder.ship_to_vendor_email || "",
//         }
//       : {};

//     // ------------------ company data merge ------------------
//     const companyData = body.company_info
//       ? {
//           company_id: Number(body.company_info.company_id),
//           company_name: body.company_info.company_name,
//           company_address: body.company_info.company_address,
//           company_email: body.company_info.company_email,
//           company_phone: body.company_info.company_phone,
//           logo_url: body.company_info.logo_url ?? "",
//           bank_name: body.company_info.bank_name ?? "",
//           account_no: body.company_info.account_no ?? "",
//           account_holder: body.company_info.account_holder ?? "",
//           ifsc_code: body.company_info.ifsc_code ?? "",
//           bank_details: body.company_info.bank_details ?? "",
//           terms: body.company_info.terms ?? "",
//           notes: body.company_info.notes ?? "",
//         }
//       : orderId
//       ? {
//           company_id: existingOrder.company_id,
//           company_name: existingOrder.company_name,
//           company_address: existingOrder.company_address,
//           company_email: existingOrder.company_email,
//           company_phone: existingOrder.company_phone,
//           logo_url: existingOrder.logo_url,
//           bank_name: existingOrder.bank_name,
//           account_no: existingOrder.account_no,
//           account_holder: existingOrder.account_holder,
//           ifsc_code: existingOrder.ifsc_code,
//           bank_details: existingOrder.bank_details,
//           terms: existingOrder.terms,
//           notes: existingOrder.notes,
//         }
//       : {};

//     // ------------------ items mapping ------------------
//     const itemsData = body.items
//       ? body.items.map((it) => ({
//           item_name: it.item_name,
//           qty: Number(it.qty ?? 0),
//           rate: Number(it.rate ?? 0),
//           tax_percent: Number(it.tax_percent ?? 0),
//           discount: Number(it.discount ?? 0),
//           amount: Number(it.amount ?? 0),
//         }))
//       : orderId
//       ? existingItems
//       : [];

//     // ------------------ db payload ------------------
//     const dbData = {
//       ...companyData,
//       ...shipping,

//       // quotation fields
//       quotation_from_vendor_name: steps.quotation.quotation_from_vendor_name || "",
//       quotation_from_vendor_address: steps.quotation.quotation_from_vendor_address || "",
//       quotation_from_vendor_email: steps.quotation.quotation_from_vendor_email || "",
//       quotation_from_vendor_phone: steps.quotation.quotation_from_vendor_phone || "",
//       ref_no: steps.quotation.ref_no || "",
//       Manual_ref_ro: steps.quotation.Manual_ref_ro || "",
//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date ? new Date(steps.quotation.quotation_date) : null,
//       valid_till: steps.quotation.valid_till ? new Date(steps.quotation.valid_till) : null,
//       quotation_status: steps.quotation.status,

//       // purchase order
//       PO_no: steps.purchase_order.PO_no || "",
//       Manual_PO_ref: steps.purchase_order.Manual_PO_ref || "",
//       purchase_order_status: steps.purchase_order.status,

//       // goods receipt
//       GR_no: steps.goods_receipt.GR_no || "",
//       Manual_GR_no: steps.goods_receipt.Manual_GR_no || "",
//       goods_receipt_status: steps.goods_receipt.status,

//       // bill
//       Bill_no: steps.bill.Bill_no || "",
//       Manual_Bill_no: steps.bill.Manual_Bill_no || "",
//       due_date: steps.bill.due_date ? new Date(steps.bill.due_date) : null,
//       bill_status: steps.bill.status,

//       // payment
//       Payment_no: steps.payment.Payment_no || "",
//       Manual_payment_no: steps.payment.Manual_payment_no || "",
//       amount_paid: Number(steps.payment.amount_paid ?? 0),
//       total_amount: Number(steps.payment.total_amount ?? 0),
//       payment_status: steps.payment.payment_status || steps.payment.status || "Pending",
//       total_bill: Number(steps.payment.total_bill ?? 0),
//       balance: Number(steps.payment.balance ?? 0),
//       payment_note: steps.payment.payment_note || "",
//       payment_made_vendor_name: steps.payment.payment_made_vendor_name || "",
//       payment_made_vendor_address: steps.payment.payment_made_vendor_address || "",
//       payment_made_vendor_email: steps.payment.payment_made_vendor_email || "",
//       payment_made_vendor_phone: steps.payment.payment_made_vendor_phone || "",

//       // misc
//       driver_name: steps.goods_receipt.driver_name || existingOrder?.driver_name || "",
//       driver_phone: steps.goods_receipt.driver_phone || existingOrder?.driver_phone || "",
//       driver_details: body.driver_details || existingOrder?.driver_details || "",

//       // file urls fallback
//       signature_url: body.additional_info?.signature_url ?? existingOrder?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? existingOrder?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? existingOrder?.attachment_url ?? "",

//       // totals
//       subtotal: body.sub_total ? Number(body.sub_total) : existingOrder?.subtotal || 0,
//       tax: body.tax ? Number(body.tax) : existingOrder?.tax || 0,
//       discount: body.discount ? Number(body.discount) : existingOrder?.discount || 0,
//       total: body.total ? Number(body.total) : existingOrder?.total || 0,

//       // statuses default/updated
//       quotation_status: steps.quotation.status,
//       purchase_order_status: steps.purchase_order.status,
//       goods_receipt_status: steps.goods_receipt.status,
//       bill_status: steps.bill.status,
//       updated_at: new Date(),
//     };

//     // ------------------ create or update ------------------
//     let savedOrder;

//     if (orderId) {
//       // replace items if provided
//       if (body.items) {
//         await prisma.purchaseorderitems.deleteMany({
//           where: { purchase_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.purchaseorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           ...(body.items && { purchaseorderitems: { create: itemsData } }),
//         },
//         include: { purchaseorderitems: true },
//       });
//     } else {
//       savedOrder = await prisma.purchaseorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           purchaseorderitems: { create: itemsData },
//         },
//         include: { purchaseorderitems: true },
//       });
//     }

//     // ------------------ response shaping ------------------
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at,
//         terms: savedOrder.terms,
//       },

//       shipping_details: {
//         bill_to_attention_name: savedOrder.bill_to_attention_name,
//         bill_to_company_name: savedOrder.bill_to_company_name,
//         bill_to_company_address: savedOrder.bill_to_company_address,
//         bill_to_company_email: savedOrder.bill_to_company_email,
//         bill_to_company_phone: savedOrder.bill_to_company_phone,

//         ship_to_attention_name: savedOrder.ship_to_attention_name,
//         ship_to_company_name: savedOrder.ship_to_company_name,
//         ship_to_company_address: savedOrder.ship_to_company_address,
//         ship_to_company_email: savedOrder.ship_to_company_email,
//         ship_to_company_phone: savedOrder.ship_to_company_phone,
//       },

//       items: savedOrder.purchaseorderitems,
//       sub_total: savedOrder.subtotal,
//       tax: savedOrder.tax,
//       discount: savedOrder.discount,
//       total: savedOrder.total,

//       steps: [
//         {
//           step: "quotation",
//           status: savedOrder.quotation_status,
//           data: {
//             quotation_from_vendor_name: savedOrder.quotation_from_vendor_name,
//             quotation_from_vendor_address: savedOrder.quotation_from_vendor_address,
//             quotation_from_vendor_email: savedOrder.quotation_from_vendor_email,
//             quotation_from_vendor_phone: savedOrder.quotation_from_vendor_phone,
//             ref_no: savedOrder.ref_no,
//             Manual_ref_ro: savedOrder.Manual_ref_ro,
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//           },
//         },
//         {
//           step: "purchase_order",
//           status: savedOrder.purchase_order_status,
//           data: {
//             PO_no: savedOrder.PO_no,
//             Manual_PO_ref: savedOrder.Manual_PO_ref,
//           },
//         },
//         {
//           step: "goods_receipt",
//           status: savedOrder.goods_receipt_status,
//           data: {
//             GR_no: savedOrder.GR_no,
//             Manual_GR_no: savedOrder.Manual_GR_no,
//           },
//         },
//         {
//           step: "bill",
//           status: savedOrder.bill_status,
//           data: {
//             Bill_no: savedOrder.Bill_no,
//             Manual_Bill_no: savedOrder.Manual_Bill_no,
//             due_date: savedOrder.due_date,
//           },
//         },
//         {
//           step: "payment",
//           status: savedOrder.payment_status,
//           data: {
//             Payment_no: savedOrder.Payment_no,
//             Manual_payment_no: savedOrder.Manual_payment_no,
//             amount_paid: savedOrder.amount_paid,
//             total_amount: savedOrder.total_amount,
//             payment_status: savedOrder.payment_status,
//             total_bill: savedOrder.total_bill,
//             balance: savedOrder.balance,
//             payment_note: savedOrder.payment_note,
//             payment_made_vendor_name: savedOrder.payment_made_vendor_name,
//             payment_made_vendor_address: savedOrder.payment_made_vendor_address,
//             payment_made_vendor_email: savedOrder.payment_made_vendor_email,
//             payment_made_vendor_phone: savedOrder.payment_made_vendor_phone,
//           },
//         },
//       ],

//       additional_info: {
//         signature_url: savedOrder.signature_url,
//         photo_url: savedOrder.photo_url,
//         attachment_url: savedOrder.attachment_url,
//       },
//     };

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Purchase order updated" : "Purchase order created",
//       data: response,
//     });
//   } catch (err) {
//     console.error("PurchaseController Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };
export const createOrUpdatePurchaseOrder = async (req, res) => {
  try {
    const body = { ...req.body };
    const orderId = req.method === "PUT" ? Number(req.params.id) : null;

    // ================= INIT NESTED OBJECTS =================
    if (!body.company_info) body.company_info = {};
    if (!body.additional_info) body.additional_info = {};
    if (!body.steps) body.steps = {};
    if (!body.shipping_details) body.shipping_details = {};

    // ================= HANDLE FILE UPLOADS =================
    // if (req.files?.files?.length) {
    //   body.additional_info.files = req.files.files.map((f) => f.path);
    // }
    // if (req.files?.logo_url?.length) {
    //   body.company_info.logo_url = req.files.logo_url[0].path;
    // }
    // if (req.files?.signature_url?.length) {
    //   body.additional_info.signature_url = req.files.signature_url[0].path;
    // }
    // if (req.files?.photo_url?.length) {
    //   body.additional_info.photo_url = req.files.photo_url[0].path;
    // }
    // if (req.files?.attachment_url?.length) {
    //   body.additional_info.attachment_url = req.files.attachment_url[0].path;
    // }


    if (req.files) {

  // MULTIPLE IMAGES: files[]
  if (req.files.files) {
    const filesArr = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    body.additional_info.files = [];

    for (const file of filesArr) {
      const url = await uploadToCloudinary(file, "purchase_order_files");
      if (url) body.additional_info.files.push(url);
    }
  }

  // SINGLE FILE UPLOADS — ALWAYS USE index [0]

  if (req.files.logo_url) {
    const url = await uploadToCloudinary(req.files.logo_url[0], "purchase_logo");
    if (url) body.company_info.logo_url = url;
  }

  if (req.files.signature_url) {
    const url = await uploadToCloudinary(req.files.signature_url[0], "purchase_signature");
    if (url) body.additional_info.signature_url = url;
  }

  if (req.files.photo_url) {
    const url = await uploadToCloudinary(req.files.photo_url[0], "purchase_photo");
    if (url) body.additional_info.photo_url = url;
  }

  if (req.files.attachment_url) {
    const url = await uploadToCloudinary(req.files.attachment_url[0], "purchase_attachment");
    if (url) body.additional_info.attachment_url = url;
  }
}

    // ================= EXISTING ORDER FETCH =================
    let existingOrder = null;
    let existingItems = [];

    if (orderId) {
      existingOrder = await prisma.purchaseorder.findUnique({
        where: { id: orderId },
        include: { purchaseorderitems: true },
      });

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      existingItems = existingOrder.purchaseorderitems || [];
       if (!req.files?.files) {
    body.additional_info.files = existingOrder?.files ?? [];
  }
    }
    

    // ================= REQUIRED FIELDS FOR STEP COMPLETION =================
    const requiredFields = {
      quotation: [
        "quotation_from_vendor_name",
        "quotation_from_vendor_address",
        "quotation_from_vendor_email",
        "quotation_from_vendor_phone",
        "ref_no",
        "quotation_no",
        "quotation_date",
      ],
      purchase_order: ["PO_no"],
      goods_receipt: ["GR_no"],
      bill: ["Bill_no"],
      payment: ["Payment_no", "amount_paid"],
    };

    const stepCompleted = (data, fields) =>
      fields.every((f) => data[f] !== "" && data[f] !== null && data[f] !== undefined);

    // ================ SAFE MERGE FUNCTION =================
    const safeMerge = (step, field, defaultValue = "") => {
      if (body.steps?.[step]?.[field] !== undefined) {
        return body.steps[step][field];
      }
      if (orderId) {
        return existingOrder[field] ?? defaultValue;
      }
      return defaultValue;
    };

    // ================= MERGE ALL 5 STEPS =================
    const steps = {
      quotation: {
        quotation_from_vendor_name: safeMerge("quotation", "quotation_from_vendor_name"),
        quotation_from_vendor_address: safeMerge("quotation", "quotation_from_vendor_address"),
        quotation_from_vendor_email: safeMerge("quotation", "quotation_from_vendor_email"),
        quotation_from_vendor_phone: safeMerge("quotation", "quotation_from_vendor_phone"),
        ref_no: safeMerge("quotation", "ref_no"),
        Manual_ref_ro: safeMerge("quotation", "Manual_ref_ro"),
        quotation_no: safeMerge("quotation", "quotation_no"),
        manual_quo_no: safeMerge("quotation", "manual_quo_no"),
        quotation_date: safeMerge("quotation", "quotation_date", null),
        valid_till: safeMerge("quotation", "valid_till", null),
      },

      purchase_order: {
        PO_no: safeMerge("purchase_order", "PO_no"),
        Manual_PO_ref: safeMerge("purchase_order", "Manual_PO_ref"),
      },

      goods_receipt: {
        GR_no: safeMerge("goods_receipt", "GR_no"),
        Manual_GR_no: safeMerge("goods_receipt", "Manual_GR_no"),
      },

      bill: {
        Bill_no: safeMerge("bill", "Bill_no"),
        Manual_Bill_no: safeMerge("bill", "Manual_Bill_no"),
        due_date: safeMerge("bill", "due_date", null),
      },

      payment: {
        Payment_no: safeMerge("payment", "Payment_no"),
        Manual_payment_no: safeMerge("payment", "Manual_payment_no"),
        amount_paid: safeMerge("payment", "amount_paid", 0),
        total_amount: safeMerge("payment", "total_amount", 0),
        total_bill: safeMerge("payment", "total_bill", 0),
        balance: safeMerge("payment", "balance", 0),
        payment_status: safeMerge("payment", "payment_status", "Pending"),
        payment_note: safeMerge("payment", "payment_note"),
        payment_made_vendor_name: safeMerge("payment", "payment_made_vendor_name"),
        payment_made_vendor_address: safeMerge("payment", "payment_made_vendor_address"),
        payment_made_vendor_email: safeMerge("payment", "payment_made_vendor_email"),
        payment_made_vendor_phone: safeMerge("payment", "payment_made_vendor_phone"),
      },
    };

    // Compute step statuses (normalize to lowercase like sales order)
    Object.keys(steps).forEach((s) => {
      steps[s].status = stepCompleted(steps[s], requiredFields[s])
        ? "completed"
        : "pending";
    });

    // ================= SHIPPING MERGE =================
    const shipping = {
      bill_to_attention_name:
        body.shipping_details.bill_to_attention_name ??
        existingOrder?.bill_to_attention_name ??
        "",
      bill_to_company_name:
        body.shipping_details.bill_to_company_name ?? existingOrder?.bill_to_company_name ?? "",
      bill_to_company_address:
        body.shipping_details.bill_to_company_address ?? existingOrder?.bill_to_company_address ?? "",
      bill_to_company_email:
        body.shipping_details.bill_to_company_email ?? existingOrder?.bill_to_company_email ?? "",
      bill_to_company_phone:
        body.shipping_details.bill_to_company_phone ?? existingOrder?.bill_to_company_phone ?? "",
      ship_to_attention_name:
        body.shipping_details.ship_to_attention_name ?? existingOrder?.ship_to_attention_name ?? "",
      ship_to_company_name:
        body.shipping_details.ship_to_company_name ?? existingOrder?.ship_to_company_name ?? "",
      ship_to_company_address:
        body.shipping_details.ship_to_company_address ?? existingOrder?.ship_to_company_address ?? "",
      ship_to_company_email:
        body.shipping_details.ship_to_company_email ?? existingOrder?.ship_to_company_email ?? "",
      ship_to_company_phone:
        body.shipping_details.ship_to_company_phone ?? existingOrder?.ship_to_company_phone ?? "",
    };

    // ================= COMPANY MERGE (FIXED) =================
    // Previously this block only ran when company_id existed.
    // Now: if body.company_info has any keys, use them. Otherwise fallback to existingOrder (PUT) or empty object.
    const hasCompanyInfoInBody = body.company_info && Object.keys(body.company_info).length > 0;

    const company = hasCompanyInfoInBody
      ? {
          company_id: body.company_info.company_id ? Number(body.company_info.company_id) : null,
          company_name: body.company_info.company_name ?? "",
          company_address: body.company_info.company_address ?? "",
          company_email: body.company_info.company_email ?? "",
          company_phone: body.company_info.company_phone ?? "",
          logo_url: body.company_info.logo_url ?? existingOrder?.logo_url ?? "",
          bank_name: body.company_info.bank_name ?? existingOrder?.bank_name ?? "",
          account_no: body.company_info.account_no ?? existingOrder?.account_no ?? "",
          account_holder: body.company_info.account_holder ?? existingOrder?.account_holder ?? "",
          ifsc_code: body.company_info.ifsc_code ?? existingOrder?.ifsc_code ?? "",
          bank_details: body.company_info.bank_details ?? existingOrder?.bank_details ?? "",
          terms: body.company_info.terms ?? existingOrder?.terms ?? "",
          notes: body.company_info.notes ?? existingOrder?.notes ?? "",
        }
      : orderId
      ? {
          company_id: existingOrder.company_id,
          company_name: existingOrder.company_name,
          company_address: existingOrder.company_address,
          company_email: existingOrder.company_email,
          company_phone: existingOrder.company_phone,
          logo_url: existingOrder.logo_url,
          bank_name: existingOrder.bank_name,
          account_no: existingOrder.account_no,
          account_holder: existingOrder.account_holder,
          ifsc_code: existingOrder.ifsc_code,
          bank_details: existingOrder.bank_details,
          terms: existingOrder.terms,
          notes: existingOrder.notes,
        }
      : {};

    // ================= ITEMS =================
    const items = body.items
      ? body.items.map((i) => ({
          item_name: i.item_name,
          product_id: i.product_id ? Number(i.product_id) : null,
          warehouse_id: i.warehouse_id ? Number(i.warehouse_id) : null,
          qty: Number(i.qty ?? 0),
          rate: Number(i.rate ?? 0),
          tax_percent: Number(i.tax_percent ?? 0),
          discount: Number(i.discount ?? 0),
          amount: Number(i.amount ?? 0),
        }))
      : existingItems;

    // ================= DB PAYLOAD =================
    // Accept both body.sub_total and body.subtotal from frontend to be tolerant
    const subTotalFromBody = body.sub_total ?? body.subtotal ?? body.subTotal;
    const totalFromBody = body.total ?? body.total_amount ?? body.totalAmount;

    const dbData = {
      ...company,
      ...shipping,

      quotation_from_vendor_name: steps.quotation.quotation_from_vendor_name,
      quotation_from_vendor_address: steps.quotation.quotation_from_vendor_address,
      quotation_from_vendor_email: steps.quotation.quotation_from_vendor_email,
      quotation_from_vendor_phone: steps.quotation.quotation_from_vendor_phone,
      ref_no: steps.quotation.ref_no,
      Manual_ref_ro: steps.quotation.Manual_ref_ro,
      quotation_no: steps.quotation.quotation_no,
      manual_quo_no: steps.quotation.manual_quo_no,
      quotation_date: steps.quotation.quotation_date
        ? new Date(steps.quotation.quotation_date)
        : null,
      valid_till: steps.quotation.valid_till ? new Date(steps.quotation.valid_till) : null,
      quotation_status: steps.quotation.status,

      PO_no: steps.purchase_order.PO_no,
      Manual_PO_ref: steps.purchase_order.Manual_PO_ref,
      purchase_order_status: steps.purchase_order.status,

      GR_no: steps.goods_receipt.GR_no,
      Manual_GR_no: steps.goods_receipt.Manual_GR_no,
      goods_receipt_status: steps.goods_receipt.status,

      Bill_no: steps.bill.Bill_no,
      Manual_Bill_no: steps.bill.Manual_Bill_no,
      due_date: steps.bill.due_date ? new Date(steps.bill.due_date) : null,
      bill_status: steps.bill.status,

      Payment_no: steps.payment.Payment_no,
      Manual_payment_no: steps.payment.Manual_payment_no,
      amount_paid: Number(steps.payment.amount_paid) || 0,
      total_amount: Number(steps.payment.total_amount) || 0,
      payment_status: steps.payment.payment_status,
      total_bill: Number(steps.payment.total_bill) || 0,
      balance: Number(steps.payment.balance) || 0,
      payment_note: steps.payment.payment_note,
      payment_made_vendor_name: steps.payment.payment_made_vendor_name,
      payment_made_vendor_address: steps.payment.payment_made_vendor_address,
      payment_made_vendor_email: steps.payment.payment_made_vendor_email,
      payment_made_vendor_phone: steps.payment.payment_made_vendor_phone,

      signature_url: body.additional_info.signature_url ?? existingOrder?.signature_url ?? "",
      photo_url: body.additional_info.photo_url ?? existingOrder?.photo_url ?? "",
      attachment_url:
        body.additional_info.attachment_url ?? existingOrder?.attachment_url ?? "",

      subtotal: Number(subTotalFromBody ?? existingOrder?.subtotal ?? 0),
      tax: Number(body.tax ?? existingOrder?.tax ?? 0),
      discount: Number(body.discount ?? existingOrder?.discount ?? 0),
      total: Number(totalFromBody ?? existingOrder?.total ?? 0),
      updated_at: new Date(),
    };

    // ================= SAVE =================
    let saved;

    if (orderId) {
      if (body.items) {
        await prisma.purchaseorderitems.deleteMany({
          where: { purchase_order_id: orderId },
        });
      }

      saved = await prisma.purchaseorder.update({
        where: { id: orderId },
        data: {
          ...dbData,
          ...(body.items && {
            purchaseorderitems: { create: items },
          }),
        },
        include: { purchaseorderitems: true },
      });
    } else {
    saved = await prisma.$transaction(async (tx) => {

  // 1️⃣ CREATE PURCHASE ORDER
  const order = await tx.purchaseorder.create({
    data: {
      ...dbData,
      created_at: new Date(),
    },
  });

  // 2️⃣ CREATE ITEMS + UPDATE STOCK
  for (const item of items) {

    // 🔹 CREATE PURCHASE ITEM
    await tx.purchaseorderitems.create({
      data: {
        ...item,
        purchase_order_id: order.id,
      },
    });

    // 🔹 SAFETY CHECK
    if (!item.product_id || !item.warehouse_id) continue;

    const qty = Number(item.qty);

    // 3️⃣ PRODUCT MASTER STOCK ↑
    await tx.products.update({
      where: { id: item.product_id },
      data: {
        total_stock: { increment: qty },
      },
    });

    // 4️⃣ WAREHOUSE STOCK ↑ (UPSERT)
    await tx.product_warehouses.upsert({
      where: {
        product_id_warehouse_id: {
          product_id: item.product_id,
          warehouse_id: item.warehouse_id,
        },
      },
      update: {
        stock_qty: { increment: qty },
      },
      create: {
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        stock_qty: qty,
      },
    });
  }
// ================= 🔥 CREATE PURCHASE VOUCHER =================
const voucher = await tx.vouchers.create({
  data: {
    company_id: order.company_id,
    voucher_type: "Purchase",
    voucher_number: `PUR-${Date.now()}`,
    manual_voucher_no: order.Bill_no || null,
    purchase_order_id: order.id,
    date: new Date(),
    from_name: order.quotation_from_vendor_name,
    notes: "Auto generated from Purchase Order",
  },
});

// ================= 🔥 CREATE VOUCHER ITEMS =================
for (const item of items) {
  await tx.voucher_items.create({
    data: {
      voucher_id: voucher.id,
      product_id: item.product_id,
      item_name: item.item_name,
      quantity: item.qty,
      rate: item.rate,
      amount: Number(item.qty) * Number(item.rate),
    },
  });
}

  // 5️⃣ RETURN FULL ORDER
  return await tx.purchaseorder.findUnique({
    where: { id: order.id },
    include: { purchaseorderitems: true },
  });
});

    }

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      message: orderId ? "Purchase order updated" : "Purchase order created",
      data: {
        purchase_order_id: saved.id,
        company_info: {
          company_id: saved.company_id,
          company_name: saved.company_name,
          company_address: saved.company_address,
          company_email: saved.company_email,
          company_phone: saved.company_phone,
          logo_url: saved.logo_url,
          bank_name: saved.bank_name,
          account_no: saved.account_no,
          account_holder: saved.account_holder,
          ifsc_code: saved.ifsc_code,
          bank_details: saved.bank_details,
          terms: saved.terms,
          notes: saved.notes,
          id: saved.id,
          created_at: saved.created_at,
          updated_at: saved.updated_at,
        },

        shipping_details: {
          bill_to_attention_name: saved.bill_to_attention_name,
          bill_to_company_name: saved.bill_to_company_name,
          bill_to_company_address: saved.bill_to_company_address,
          bill_to_company_email: saved.bill_to_company_email,
          bill_to_company_phone: saved.bill_to_company_phone,

          ship_to_attention_name: saved.ship_to_attention_name,
          ship_to_company_name: saved.ship_to_company_name,
          ship_to_company_address: saved.ship_to_company_address,
          ship_to_company_email: saved.ship_to_company_email,
          ship_to_company_phone: saved.ship_to_company_phone,
        },

        items: saved.purchaseorderitems,

        sub_total: saved.subtotal,
        total: saved.total,

        steps: [
          {
            step: "quotation",
            status: steps.quotation.status,
            data: {
              quotation_from_vendor_name: steps.quotation.quotation_from_vendor_name,
              quotation_from_vendor_address: steps.quotation.quotation_from_vendor_address,
              quotation_from_vendor_email: steps.quotation.quotation_from_vendor_email,
              quotation_from_vendor_phone: steps.quotation.quotation_from_vendor_phone,
              quotation_no: steps.quotation.quotation_no,
              manual_quo_no: steps.quotation.manual_quo_no,
              ref_no: steps.quotation.ref_no,
              quotation_date: steps.quotation.quotation_date || null,
              valid_till: steps.quotation.valid_till || null,
            },
          },

          {
            step: "purchase_order",
            status: steps.purchase_order.status,
            data: {
              PO_no: steps.purchase_order.PO_no,
              Manual_PO_ref: steps.purchase_order.Manual_PO_ref,
            },
          },

          {
            step: "goods_receipt",
            status: steps.goods_receipt.status,
            data: {
              GR_no: steps.goods_receipt.GR_no,
              Manual_GR_no: steps.goods_receipt.Manual_GR_no,
            },
          },

          {
            step: "bill",
            status: steps.bill.status,
            data: {
              Bill_no: steps.bill.Bill_no,
              Manual_Bill_no: steps.bill.Manual_Bill_no,
              due_date: steps.bill.due_date || null,
            },
          },

          {
            step: "payment",
            status: steps.payment.status,
            data: {
              Payment_no: steps.payment.Payment_no,
              Manual_payment_no: steps.payment.Manual_payment_no,
              amount_paid: steps.payment.amount_paid,
              total_amount: steps.payment.total_amount,
              balance: steps.payment.balance,
              payment_note: steps.payment.payment_note,
              payment_status: steps.payment.payment_status,
              total_bill: steps.payment.total_bill,
            },
          },
        ],

        additional_info: {
          files: body.additional_info.files || existingOrder?.files || [],
          signature_url: saved.signature_url,
          photo_url: saved.photo_url,
          attachment_url: saved.attachment_url,
        },
      },
    });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// export const getPurchaseOrdersByCompanyId = async (req, res) => {
//   try {
//     const companyId = Number(req.params.companyId);

//     const orders = await prisma.purchaseorder.findMany({
//       where: { company_id: companyId },
//       include: { purchaseorderitems: true }
//     });

//     const formatted = orders.map(order => {
//       return {
//         company_info: {
//           company_id: order.company_id,
//           company_name: order.company_name,
//           company_address: order.company_address,
//           company_email: order.company_email,
//           company_phone: order.company_phone,
//           logo_url: order.logo_url,
//           bank_name: order.bank_name,
//           account_no: order.account_no,
//           account_holder: order.account_holder,
//           ifsc_code: order.ifsc_code,
//           bank_details: order.bank_details,
//           terms: order.terms,
//           notes: order.notes,
//           id: order.id,
//           created_at: order.created_at,
//           updated_at: order.updated_at
//         },

//         shipping_details: {
//           bill_to_attention_name: order.bill_to_attention_name,
//           bill_to_company_name: order.bill_to_company_name,
//           bill_to_company_address: order.bill_to_company_address,
//           bill_to_company_email: order.bill_to_company_email,
//           bill_to_company_phone: order.bill_to_company_phone,

//           ship_to_attention_name: order.ship_to_attention_name,
//           ship_to_company_name: order.ship_to_company_name,
//           ship_to_company_address: order.ship_to_company_address,
//           ship_to_company_email: order.ship_to_company_email,
//           ship_to_company_phone: order.ship_to_company_phone
//         },

//         items: order.purchaseorderitems,

//         sub_total: order.subtotal,
//         total: order.total,

//         steps: [
//           {
//             step: "quotation",
//             status: order.quotation_status.toLowerCase(),
//             data: {
//               quotation_from_vendor_name: order.quotation_from_vendor_name,
//               quotation_from_vendor_address: order.quotation_from_vendor_address,
//               quotation_from_vendor_email: order.quotation_from_vendor_email,
//               quotation_from_vendor_phone: order.quotation_from_vendor_phone,
//               quotation_no: order.quotation_no,
//               manual_quo_no: order.manual_quo_no,
//               ref_no: order.ref_no,
//               quotation_date: order.quotation_date,
//               valid_till: order.valid_till
//             }
//           },
//           {
//             step: "purchase_order",
//             status: order.purchase_order_status.toLowerCase(),
//             data: {
//               PO_no: order.PO_no,
//               Manual_PO_ref: order.Manual_PO_ref
//             }
//           },
//           {
//             step: "goods_receipt",
//             status: order.goods_receipt_status.toLowerCase(),
//             data: {
//               GR_no: order.GR_no,
//               Manual_GR_no: order.Manual_GR_no
//             }
//           },
//           {
//             step: "bill",
//             status: order.bill_status.toLowerCase(),
//             data: {
//               Bill_no: order.Bill_no,
//               Manual_Bill_no: order.Manual_Bill_no,
//               due_date: order.due_date
//             }
//           },
//           {
//             step: "payment",
//             status: order.payment_status.toLowerCase(),
//             data: {
//               Payment_no: order.Payment_no,
//               Manual_payment_no: order.Manual_payment_no,
//               amount_paid: order.amount_paid,
//               total_amount: order.total_amount,
//               balance: order.balance,
//               payment_note: order.payment_note,
//               payment_status: order.payment_status,
//               total_bill: order.total_bill
//             }
//           }
//         ],

//         additional_info: {
//           signature_url: order.signature_url,
//           photo_url: order.photo_url,
//           attachment_url: order.attachment_url
//         }
//       };
//     });

//     return res.json({
//       success: true,
//       message: "Purchase orders fetched successfully",
//       data: formatted
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

export const getPurchaseOrdersByCompanyId = async (req, res) => {
  try {
    const companyId = Number(req.params.companyId);

    const orders = await prisma.purchaseorder.findMany({
      where: { company_id: companyId },
      include: { purchaseorderitems: true }
    });

    const formatted = orders.map(order => {
      const stepStatus = (value) => value && value !== "" ? "completed" : "pending";
      return {
        company_info: {
          company_id: order.company_id,
          company_name: order.company_name,
          company_address: order.company_address,
          company_email: order.company_email,
          company_phone: order.company_phone,
          logo_url: order.logo_url,
          bank_name: order.bank_name,
          account_no: order.account_no,
          account_holder: order.account_holder,
          ifsc_code: order.ifsc_code,
          bank_details: order.bank_details,
          terms: order.terms,
          notes: order.notes,
          id: order.id,
          created_at: order.created_at,
          updated_at: order.updated_at
        },

        shipping_details: {
          bill_to_attention_name: order.bill_to_attention_name,
          bill_to_company_name: order.bill_to_company_name,
          bill_to_company_address: order.bill_to_company_address,
          bill_to_company_email: order.bill_to_company_email,
          bill_to_company_phone: order.bill_to_company_phone,

          ship_to_attention_name: order.ship_to_attention_name,
          ship_to_company_name: order.ship_to_company_name,
          ship_to_company_address: order.ship_to_company_address,
          ship_to_company_email: order.ship_to_company_email,
          ship_to_company_phone: order.ship_to_company_phone
        },

        items: order.purchaseorderitems,

        sub_total: order.subtotal,
        total: order.total,

        steps: [
          {
            step: "quotation",
            status: stepStatus(order.manual_quo_no),
            data: {
              quotation_from_vendor_name: order.quotation_from_vendor_name,
              quotation_from_vendor_address: order.quotation_from_vendor_address,
              quotation_from_vendor_email: order.quotation_from_vendor_email,
              quotation_from_vendor_phone: order.quotation_from_vendor_phone,
              quotation_no: order.quotation_no,
              manual_quo_no: order.manual_quo_no,
              ref_no: order.ref_no,
              quotation_date: order.quotation_date?.toISOString().split("T")[0] || null,
              valid_till: order.valid_till?.toISOString().split("T")[0] || null
            }
          },

          {
            step: "purchase_order",
            status: stepStatus(order.Manual_PO_ref),
            data: {
              PO_no: order.PO_no,
              Manual_PO_ref: order.Manual_PO_ref
            }
          },

          {
            step: "goods_receipt",
            status: stepStatus(order.Manual_GR_no),
            data: {
              GR_no: order.GR_no,
              Manual_GR_no: order.Manual_GR_no
            }
          },

          {
            step: "bill",
            status: stepStatus(order.Manual_Bill_no),
            data: {
              Bill_no: order.Bill_no,
              Manual_Bill_no: order.Manual_Bill_no,
              due_date: order.due_date
                ? order.due_date.toISOString().split("T")[0]
                : null
            }
          },

          {
            step: "payment",
            status: stepStatus(order.Manual_payment_no),
            data: {
              Payment_no: order.Payment_no,
              Manual_payment_no: order.Manual_payment_no,
              amount_paid: order.amount_paid,
              total_amount: order.total_amount,
              balance: order.balance,
              payment_note: order.payment_note,
              payment_status: order.payment_status,
              total_bill: order.total_bill
            }
          }
        ],

        additional_info: {
          files: order.files || [],
          signature_url: order.signature_url,
          photo_url: order.photo_url,
          attachment_url: order.attachment_url
        }
      };
    });

    return res.json({
      success: true,
      message: "Purchase orders fetched successfully",
      data: formatted
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
// export const getPurchaseOrderById = async (req, res) => {
//   try {
//     const id = Number(req.params.id);

//     const order = await prisma.purchaseorder.findUnique({
//       where: { id },
//       include: { purchaseorderitems: true }
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase order not found"
//       });
//     }

//     const formatted = {
//       company_info: {
//         company_id: order.company_id,
//         company_name: order.company_name,
//         company_address: order.company_address,
//         company_email: order.company_email,
//         company_phone: order.company_phone,
//         logo_url: order.logo_url,
//         bank_name: order.bank_name,
//         account_no: order.account_no,
//         account_holder: order.account_holder,
//         ifsc_code: order.ifsc_code,
//         bank_details: order.bank_details,
//         terms: order.terms,
//         notes: order.notes,
//         id: order.id,
//         created_at: order.created_at,
//         updated_at: order.updated_at
//       },

//       shipping_details: {
//         bill_to_attention_name: order.bill_to_attention_name,
//         bill_to_company_name: order.bill_to_company_name,
//         bill_to_company_address: order.bill_to_company_address,
//         bill_to_company_email: order.bill_to_company_email,
//         bill_to_company_phone: order.bill_to_company_phone,

//         ship_to_attention_name: order.ship_to_attention_name,
//         ship_to_company_name: order.ship_to_company_name,
//         ship_to_company_address: order.ship_to_company_address,
//         ship_to_company_email: order.ship_to_company_email,
//         ship_to_company_phone: order.ship_to_company_phone
//       },

//       items: order.purchaseorderitems,

//       sub_total: order.subtotal,
//       total: order.total,

//       steps: [
//         {
//           step: "quotation",
//           status: order.quotation_status.toLowerCase(),
//           data: {
//             quotation_from_vendor_name: order.quotation_from_vendor_name,
//             quotation_from_vendor_address: order.quotation_from_vendor_address,
//             quotation_from_vendor_email: order.quotation_from_vendor_email,
//             quotation_from_vendor_phone: order.quotation_from_vendor_phone,
//             quotation_no: order.quotation_no,
//             manual_quo_no: order.manual_quo_no,
//             ref_no: order.ref_no,
//             quotation_date: order.quotation_date,
//             valid_till: order.valid_till
//           }
//         },
//         {
//           step: "purchase_order",
//           status: order.purchase_order_status.toLowerCase(),
//           data: {
//             PO_no: order.PO_no,
//             Manual_PO_ref: order.Manual_PO_ref
//           }
//         },
//         {
//           step: "goods_receipt",
//           status: order.goods_receipt_status.toLowerCase(),
//           data: {
//             GR_no: order.GR_no,
//             Manual_GR_no: order.Manual_GR_no
//           }
//         },
//         {
//           step: "bill",
//           status: order.bill_status.toLowerCase(),
//           data: {
//             Bill_no: order.Bill_no,
//             Manual_Bill_no: order.Manual_Bill_no,
//             due_date: order.due_date
//           }
//         },
//         {
//           step: "payment",
//           status: order.payment_status.toLowerCase(),
//           data: {
//             Payment_no: order.Payment_no,
//             Manual_payment_no: order.Manual_payment_no,
//             amount_paid: order.amount_paid,
//             total_amount: order.total_amount,
//             balance: order.balance,
//             payment_note: order.payment_note,
//             payment_status: order.payment_status,
//             total_bill: order.total_bill
//           }
//         }
//       ],

//       additional_info: {
//         signature_url: order.signature_url,
//         photo_url: order.photo_url,
//         attachment_url: order.attachment_url
//       }
//     };

//     return res.json({
//       success: true,
//       message: "Purchase order fetched successfully",
//       data: formatted
//     });

//   } catch (err) {
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };
export const getPurchaseOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.purchaseorder.findUnique({
      where: { id },
      include: { purchaseorderitems: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      });
    }

    const stepStatus = (value) => value && value !== "" ? "completed" : "pending";

    const formatted = {
      company_info: {
        company_id: order.company_id,
        company_name: order.company_name,
        company_address: order.company_address,
        company_email: order.company_email,
        company_phone: order.company_phone,
        logo_url: order.logo_url,
        bank_name: order.bank_name,
        account_no: order.account_no,
        account_holder: order.account_holder,
        ifsc_code: order.ifsc_code,
        bank_details: order.bank_details,
        terms: order.terms,
        notes: order.notes,
        id: order.id,
        created_at: order.created_at,
        updated_at: order.updated_at
      },

      shipping_details: {
        bill_to_attention_name: order.bill_to_attention_name,
        bill_to_company_name: order.bill_to_company_name,
        bill_to_company_address: order.bill_to_company_address,
        bill_to_company_email: order.bill_to_company_email,
        bill_to_company_phone: order.bill_to_company_phone,

        ship_to_attention_name: order.ship_to_attention_name,
        ship_to_company_name: order.ship_to_company_name,
        ship_to_company_address: order.ship_to_company_address,
        ship_to_company_email: order.ship_to_company_email,
        ship_to_company_phone: order.ship_to_company_phone
      },

      items: order.purchaseorderitems,

      sub_total: order.subtotal,
      total: order.total,

      steps: [
        {
          step: "quotation",
          status: stepStatus(order.manual_quo_no),
          data: {
            quotation_from_vendor_name: order.quotation_from_vendor_name,
            quotation_from_vendor_address: order.quotation_from_vendor_address,
            quotation_from_vendor_email: order.quotation_from_vendor_email,
            quotation_from_vendor_phone: order.quotation_from_vendor_phone,
            quotation_no: order.quotation_no,
            manual_quo_no: order.manual_quo_no,
            ref_no: order.ref_no,
            quotation_date: order.quotation_date?.toISOString().split("T")[0] || null,
            valid_till: order.valid_till?.toISOString().split("T")[0] || null
          }
        },

        {
          step: "purchase_order",
          status:stepStatus(order.Manual_PO_ref),
          data: {
            PO_no: order.PO_no,
            Manual_PO_ref: order.Manual_PO_ref
          }
        },

        {
          step: "goods_receipt",
          status: stepStatus(order.Manual_GR_no),
          data: {
            GR_no: order.GR_no,
            Manual_GR_no: order.Manual_GR_no
          }
        },

        {
          step: "bill",
          status: stepStatus(order.Manual_Bill_no),
          data: {
            Bill_no: order.Bill_no,
            Manual_Bill_no: order.Manual_Bill_no,
            due_date: order.due_date
              ? order.due_date.toISOString().split("T")[0]
              : null
          }
        },

        {
          step: "payment",
          status: stepStatus(order.Manual_payment_no),
          data: {
            Payment_no: order.Payment_no,
            Manual_payment_no: order.Manual_payment_no,
            amount_paid: order.amount_paid,
            total_amount: order.total_amount,
            balance: order.balance,
            payment_note: order.payment_note,
            payment_status: order.payment_status,
            total_bill: order.total_bill
          }
        }
      ],

      additional_info: {
        files: order.files || [],
        signature_url: order.signature_url,
        photo_url: order.photo_url,
        attachment_url: order.attachment_url
      }
    };

    return res.json({
      success: true,
      message: "Purchase order fetched successfully",
      data: formatted
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const purchaseOrder = await prisma.purchaseorder.findUnique({
      where: { id: orderId },
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    await prisma.$transaction(async (tx) => {

      // 🔥 1️⃣ FIND VOUCHER BY purchase_order_id
      const voucher = await tx.vouchers.findFirst({
        where: {
          voucher_type: "Purchase",
          purchase_order_id: orderId,
        },
      });

      // 🔥 2️⃣ DELETE VOUCHER ITEMS
      if (voucher) {
        await tx.voucher_items.deleteMany({
          where: { voucher_id: voucher.id },
        });

        // 🔥 3️⃣ DELETE VOUCHER
        await tx.vouchers.delete({
          where: { id: voucher.id },
        });
      }

      // 🔥 4️⃣ DELETE PURCHASE ORDER ITEMS
      await tx.purchaseorderitems.deleteMany({
        where: { purchase_order_id: orderId },
      });

      // 🔥 5️⃣ DELETE PURCHASE ORDER
      await tx.purchaseorder.delete({
        where: { id: orderId },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Purchase order & purchase voucher deleted successfully",
    });

  } catch (error) {
    console.error("Delete PO Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete purchase order",
      error: error.message,
    });
  }
};

