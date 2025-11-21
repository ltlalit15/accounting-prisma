
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
const structurePurchaseOrderBySteps = (order) => {
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
      terms: order.terms,
      id: order.id,
      created_at: order.created_at,
      updated_at: order.updated_at,
    },

    shipping_details: {
      bill_to_name: order.bill_to_company_name,
      bill_to_address: order.bill_to_company_address,
      bill_to_email: order.bill_to_company_email,
      bill_to_phone: order.bill_to_company_phone,
      bill_to_attention_name: order.bill_to_attention_name,

      ship_to_name: order.ship_to_company_name,
      ship_to_address: order.ship_to_company_address,
      ship_to_email: order.ship_to_company_email,
      ship_to_phone: order.ship_to_company_phone,
      ship_to_attention_name: order.ship_to_attention_name,
    },

    items: order.purchaseorderitems || [],

    sub_total: order.subtotal,
    total: order.total,

    steps: [
      {
        step: "quotation",
        status: order.quotation_status,
        data: {
          quotation_no: order.quotation_no,
          manual_quo_no: order.manual_quo_no,
          quotation_date: order.quotation_date,
          valid_till: order.valid_till,
          quotation_from_vendor_name: order.quotation_from_vendor_name,
          quotation_from_vendor_address: order.quotation_from_vendor_address,
          quotation_from_vendor_email: order.quotation_from_vendor_email,
          quotation_from_vendor_phone: order.quotation_from_vendor_phone,
          notes: order.notes,
        },
      },
      {
        step: "purchase_order",
        status: order.purchase_order_status,
        data: {
          PO_no: order.PO_no,
          Manual_PO_ref: order.Manual_PO_ref,
          manual_quo_no: order.manual_quo_no,
        },
      },
      {
        step: "goods_receipt",
        status: order.goods_receipt_status,
        data: {
          GR_no: order.GR_no,
          Manual_GR_no: order.Manual_GR_no,
        },
      },
      {
        step: "bill",
        status: order.bill_status,
        data: {
          Bill_no: order.Bill_no,
          manual_bill_no: order.Manual_Bill_no,
          due_date: order.due_date,
        },
      },
      {
        step: "payment",
        status: order.payment_status,
        data: {
          Payment_no: order.Payment_no,
          Manual_payment_no: order.Manual_payment_no,
          payment_date: order.payment_date,
          amount_paid: order.amount_paid,
          payment_note: order.payment_note,
        },
      },
    ],

    additional_info: {
      signature_url: order.signature_url,
      photo_url: order.photo_url,
      attachment_url: order.attachment_url,
    },
  };
};

export const createOrUpdatePurchaseOrder = async (req, res) => {
  try {
    const body = { ...req.body };
    const orderId = req.method === "PUT" ? Number(req.params.id) : null;

    // ================= VALIDATION =================
    if (!orderId && !body.company_info) {
      return res.status(400).json({
        success: false,
        message: "company_info is mandatory for new orders",
      });
    }

    if (!orderId && (!Array.isArray(body.items) || body.items.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "items must be provided and not empty for new orders",
      });
    }

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
    }

    // ================= FILE UPLOAD HANDLER =================
    if (body.company_info) {
      body.company_info = await handleFileUploads(body.company_info, ["logo_url"]);
    }

    if (body.additional_info) {
      body.additional_info = await handleFileUploads(body.additional_info, [
        "signature_url",
        "photo_url",
        "attachment_url",
      ]);
    }

    // ================= STEP RULES (same pattern) =================
    const stepCompleted = (data, fields) =>
      fields.every((field) => data[field] !== "" && data[field] !== null && data[field] !== undefined);

    const stepRules = {
      quotation: ["quotation_no", "quotation_date"],
      purchase_order: ["PO_no"],
      goods_receipt: ["GR_no"],
      bill: ["Bill_no", "due_date"],
      payment: ["Payment_no", "amount_paid"],
    };

    const steps = {
      quotation: orderId
        ? {
            quotation_no: existingOrder.quotation_no || "",
            manual_quo_no: existingOrder.manual_quo_no || "",
            quotation_date: existingOrder.quotation_date,
            valid_till: existingOrder.valid_till,
            quotation_from_vendor_name: existingOrder.quotation_from_vendor_name || "",
            quotation_from_vendor_address: existingOrder.quotation_from_vendor_address || "",
            quotation_from_vendor_email: existingOrder.quotation_from_vendor_email || "",
            quotation_from_vendor_phone: existingOrder.quotation_from_vendor_phone || "",
            notes: existingOrder.notes || "",
            ...(body.steps?.quotation || {}),
          }
        : body.steps?.quotation || {},

      purchase_order: orderId
        ? {
            PO_no: existingOrder.PO_no || "",
            Manual_PO_ref: existingOrder.Manual_PO_ref || "",
            manual_quo_no: existingOrder.manual_quo_no || "",
            purchase_order_status: existingOrder.purchase_order_status,
            ...(body.steps?.purchase_order || {}),
          }
        : body.steps?.purchase_order || {},

      goods_receipt: orderId
        ? {
            GR_no: existingOrder.GR_no || "",
            Manual_GR_no: existingOrder.Manual_GR_no || "",
            goods_receipt_status: existingOrder.goods_receipt_status,
            ...(body.steps?.goods_receipt || {}),
          }
        : body.steps?.goods_receipt || {},

      bill: orderId
        ? {
            Bill_no: existingOrder.Bill_no || "",
            Manual_Bill_no: existingOrder.Manual_Bill_no || "",
            due_date: existingOrder.due_date,
            bill_status: existingOrder.bill_status,
            ...(body.steps?.bill || {}),
          }
        : body.steps?.bill || {},

      payment: orderId
        ? {
            Payment_no: existingOrder.Payment_no || "",
            Manual_payment_no: existingOrder.Manual_payment_no || "",
            payment_date: existingOrder.payment_date,
            amount_paid: existingOrder.amount_paid || 0,
            payment_note: existingOrder.payment_note || "",
            payment_status: existingOrder.payment_status,
            ...(body.steps?.payment || {}),
          }
        : body.steps?.payment || {},
    };

    for (const step of Object.keys(steps)) {
      steps[step].status = stepCompleted(steps[step], stepRules[step]) ? "completed" : "pending";
    }

    // ================= SHIPPING DETAILS =================
    const shipping = body.shipping_details
      ? {
          bill_to_company_name: body.shipping_details.bill_to_name || "",
          bill_to_company_address: body.shipping_details.bill_to_address || "",
          bill_to_company_email: body.shipping_details.bill_to_email || "",
          bill_to_company_phone: body.shipping_details.bill_to_phone || "",
          bill_to_attention_name: body.shipping_details.bill_to_attention_name || "",

          ship_to_company_name: body.shipping_details.ship_to_name || "",
          ship_to_company_address: body.shipping_details.ship_to_address || "",
          ship_to_company_email: body.shipping_details.ship_to_email || "",
          ship_to_company_phone: body.shipping_details.ship_to_phone || "",
          ship_to_attention_name: body.shipping_details.ship_to_attention_name || "",
        }
      : orderId
      ? {
          bill_to_company_name: existingOrder.bill_to_company_name || "",
          bill_to_company_address: existingOrder.bill_to_company_address || "",
          bill_to_company_email: existingOrder.bill_to_company_email || "",
          bill_to_company_phone: existingOrder.bill_to_company_phone || "",
          bill_to_attention_name: existingOrder.bill_to_attention_name || "",

          ship_to_company_name: existingOrder.ship_to_company_name || "",
          ship_to_company_address: existingOrder.ship_to_company_address || "",
          ship_to_company_email: existingOrder.ship_to_company_email || "",
          ship_to_company_phone: existingOrder.ship_to_company_phone || "",
          ship_to_attention_name: existingOrder.ship_to_attention_name || "",
        }
      : {};

    // ================= COMPANY INFO =================
    const companyData = body.company_info
      ? {
          company_id: Number(body.company_info.company_id),
          company_name: body.company_info.company_name,
          company_address: body.company_info.company_address,
          company_email: body.company_info.company_email,
          company_phone: body.company_info.company_phone,
          logo_url: body.company_info.logo_url ?? "",
          bank_name: body.company_info.bank_name ?? "",
          account_no: body.company_info.account_no ?? "",
          account_holder: body.company_info.account_holder ?? "",
          ifsc_code: body.company_info.ifsc_code ?? "",
          terms: body.company_info.terms ?? "",
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
          terms: existingOrder.terms,
        }
      : {};

    // ================= ITEMS =================
    const itemsData = body.items
      ? body.items.map((item) => ({
          item_name: item.item_name,
          qty: Number(item.qty),
          rate: Number(item.rate),
          tax_percent: Number(item.tax_percent ?? 0),
          discount: Number(item.discount ?? 0),
          amount: Number(item.amount ?? 0),
        }))
      : orderId
      ? existingItems
      : [];

    // ================= DB PAYLOAD =================
    const dbData = {
      ...companyData,
      ...shipping,

      quotation_no: steps.quotation.quotation_no || "",
      manual_quo_no: steps.quotation.manual_quo_no || "",
      quotation_date: steps.quotation.quotation_date ? new Date(steps.quotation.quotation_date) : null,
      valid_till: steps.quotation.valid_till ? new Date(steps.quotation.valid_till) : null,
      quotation_status: steps.quotation.status,
      quotation_from_vendor_name: steps.quotation.quotation_from_vendor_name || "",
      quotation_from_vendor_address: steps.quotation.quotation_from_vendor_address || "",
      quotation_from_vendor_email: steps.quotation.quotation_from_vendor_email || "",
      quotation_from_vendor_phone: steps.quotation.quotation_from_vendor_phone || "",
      notes: steps.quotation.notes || "",

      PO_no: steps.purchase_order.PO_no || "",
      Manual_PO_ref: steps.purchase_order.Manual_PO_ref || "",
      manual_quo_no: steps.purchase_order.manual_quo_no || "",
      purchase_order_status: steps.purchase_order.status,

      GR_no: steps.goods_receipt.GR_no || "",
      Manual_GR_no: steps.goods_receipt.Manual_GR_no || "",
      goods_receipt_status: steps.goods_receipt.status,

      Bill_no: steps.bill.Bill_no || "",
      Manual_Bill_no: steps.bill.Manual_Bill_no || "",
      due_date: steps.bill.due_date ? new Date(steps.bill.due_date) : null,
      bill_status: steps.bill.status,

      Payment_no: steps.payment.Payment_no || "",
      Manual_payment_no: steps.payment.Manual_payment_no || "",
      payment_date: steps.payment.payment_date ? new Date(steps.payment.payment_date) : null,
      payment_status: steps.payment.status,
      amount_paid: Number(steps.payment.amount_paid) || 0,
      payment_note: steps.payment.payment_note || "",

      signature_url: body.additional_info?.signature_url ?? existingOrder?.signature_url ?? "",
      photo_url: body.additional_info?.photo_url ?? existingOrder?.photo_url ?? "",
      attachment_url: body.additional_info?.attachment_url ?? existingOrder?.attachment_url ?? "",

      // sub_total and total accepted from frontend (no calc)
      subtotal: body.sub_total ? Number(body.sub_total) : existingOrder?.subtotal || 0,
      total: body.total ? Number(body.total) : existingOrder?.total || 0,

      updated_at: new Date(),
    };

    // ================= CREATE OR UPDATE =================
    let savedOrder;

    if (orderId) {
      if (body.items) {
        await prisma.purchaseorderitems.deleteMany({
          where: { purchase_order_id: orderId },
        });
      }

      savedOrder = await prisma.purchaseorder.update({
        where: { id: orderId },
        data: {
          ...dbData,
          ...(body.items && { purchaseorderitems: { create: itemsData } }),
        },
        include: { purchaseorderitems: true },
      });
    } else {
      savedOrder = await prisma.purchaseorder.create({
        data: {
          ...dbData,
          created_at: new Date(),
          purchaseorderitems: { create: itemsData },
        },
        include: { purchaseorderitems: true },
      });
    }

    // ================= RESPONSE =================
    const response = structurePurchaseOrderBySteps(savedOrder);

    return res.status(200).json({
      success: true,
      message: orderId ? "Purchase order updated" : "Purchase order created",
      data: response,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};