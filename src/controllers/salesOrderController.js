// src/controllers/salesOrderController.js

import prisma from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary once (use .env in production)
cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// 🖼 Cloudinary Upload Helper
const uploadToCloudinary = async (base64Data, folder = "sales_orders") => {
  try {
    const upload = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "auto",
    });
    return upload.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

// Helper function to check if a step is completed
const isStepCompleted = (stepData) => {
  // Check if essential fields for the step are filled
  switch (stepData.step) {
    case 'quotation':
      return stepData.quotation_no && stepData.quotation_date && stepData.qoutation_to_customer_name;
    case 'sales_order':
      return stepData.SO_no || stepData.Manual_SO_ref;
    case 'delivery_challan':
      return stepData.Challan_no || stepData.Manual_challan_no;
    case 'invoice':
      return stepData.invoice_no || stepData.Manual_invoice_no;
    case 'payment':
      return stepData.Payment_no || stepData.Manual_payment_no || stepData.amount_received > 0;
    default:
      return false;
  }
};

// Helper function to structure sales order data by steps
const structureSalesOrderBySteps = (salesOrder) => {
  // Common company information
  const companyInfo = {
    id: salesOrder.id,
    company_id: salesOrder.company_id,
    company_name: salesOrder.company_name,
    company_address: salesOrder.company_address,
    company_email: salesOrder.company_email,
    company_phone: salesOrder.company_phone,
    logo_url: salesOrder.logo_url,
    // Move bank details to company info
    bank_name: salesOrder.bank_name,
    account_no: salesOrder.account_no,
    account_holder: salesOrder.account_holder,
    ifsc_code: salesOrder.ifsc_code,
    created_at: salesOrder.created_at,
    updated_at: salesOrder.updated_at
  };

  // Process items data - ensure it's always an array
  let itemsData = [];
  if (salesOrder.salesorderitems && Array.isArray(salesOrder.salesorderitems)) {
    itemsData = salesOrder.salesorderitems.map(item => ({
      id: item.id,
      item_name: item.item_name || "",
      qty: toNumber(item.qty || 0),
      rate: toNumber(item.rate || 0),
      tax_percent: toNumber(item.tax_percent || 0),
      discount: toNumber(item.discount || 0),
      amount: toNumber(item.amount || 0)
    }));
  }

  // Common BILL TO details
  const billToDetails = {
    attention_name: salesOrder.bill_to_attention_name || "",
    company_name: salesOrder.bill_to_company_name || "",
    company_address: salesOrder.bill_to_company_address || "",
    company_phone: salesOrder.bill_to_company_phone || "",
    company_email: salesOrder.bill_to_company_email || "",
    customer_name: salesOrder.bill_to_customer_name || "",
    customer_address: salesOrder.bill_to_customer_address || "",
    customer_email: salesOrder.bill_to_customer_email || "",
    customer_phone: salesOrder.bill_to_customer_phone || ""
  };

  // Common SHIP TO details
  const shipToDetails = {
    attention_name: salesOrder.ship_to_attention_name || "",
    company_name: salesOrder.ship_to_company_name || "",
    company_address: salesOrder.ship_to_company_address || "",
    company_phone: salesOrder.ship_to_company_phone || "",
    company_email: salesOrder.ship_to_company_email || "",
    customer_name: salesOrder.ship_to_customer_name || "",
    customer_address: salesOrder.ship_to_customer_address || "",
    customer_email: salesOrder.ship_to_customer_email || "",
    customer_phone: salesOrder.ship_to_customer_phone || ""
  };

  // Quotation step
  const quotationStep = {
    step: 'quotation',
    status: isStepCompleted({ 
      step: 'quotation',
      quotation_no: salesOrder.quotation_no,
      quotation_date: salesOrder.quotation_date,
      qoutation_to_customer_name: salesOrder.qoutation_to_customer_name
    }) ? 'completed' : 'pending',
    data: {
      ref_no: salesOrder.ref_no || "",
      Manual_ref_ro: salesOrder.Manual_ref_ro || "",
      quotation_no: salesOrder.quotation_no || "",
      manual_quo_no: salesOrder.manual_quo_no || "",
      quotation_date: salesOrder.quotation_date,
      valid_till: salesOrder.valid_till,
      qoutation_to_customer_name: salesOrder.qoutation_to_customer_name || "",
      qoutation_to_customer_address: salesOrder.qoutation_to_customer_address || "",
      qoutation_to_customer_email: salesOrder.qoutation_to_customer_email || "",
      qoutation_to_customer_phone: salesOrder.qoutation_to_customer_phone || "",
      // BILL TO details
      bill_to: billToDetails,
      notes: salesOrder.notes || "",
      terms: salesOrder.terms || "",
      subtotal: toNumber(salesOrder.subtotal || 0),
      tax: toNumber(salesOrder.tax || 0),
      discount: toNumber(salesOrder.discount || 0),
      total: toNumber(salesOrder.total || 0),
      quotation_status: salesOrder.quotation_status || "Pending",
      draft_status: salesOrder.draft_status || "Draft"
    }
  };

  // Sales Order step
  const salesOrderStep = {
    step: 'sales_order',
    status: isStepCompleted({ 
      step: 'sales_order',
      SO_no: salesOrder.SO_no,
      Manual_SO_ref: salesOrder.Manual_SO_ref
    }) ? 'completed' : 'pending',
    data: {
      SO_no: salesOrder.SO_no || "",
      Manual_SO_ref: salesOrder.Manual_SO_ref || "",
      // BILL TO details (carried forward from quotation)
      bill_to: billToDetails,
      // SHIP TO details
      ship_to: shipToDetails,
      sales_order_status: salesOrder.sales_order_status || "Pending"
    }
  };

  // Delivery Challan step
  const deliveryChallanStep = {
    step: 'delivery_challan',
    status: isStepCompleted({ 
      step: 'delivery_challan',
      Challan_no: salesOrder.Challan_no,
      Manual_challan_no: salesOrder.Manual_challan_no
    }) ? 'completed' : 'pending',
    data: {
      Challan_no: salesOrder.Challan_no || "",
      Manual_challan_no: salesOrder.Manual_challan_no || "",
      Manual_DC_no: salesOrder.Manual_DC_no || "",
      // BILL TO details (carried forward from previous steps)
      bill_to: billToDetails,
      // SHIP TO details (carried forward from previous steps)
      ship_to: shipToDetails,
      driver_name: salesOrder.driver_name || "",
      driver_phone: salesOrder.driver_phone || "",
      delivery_challan_status: salesOrder.delivery_challan_status || "Pending"
    }
  };

  // Invoice step
  const invoiceStep = {
    step: 'invoice',
    status: isStepCompleted({ 
      step: 'invoice',
      invoice_no: salesOrder.invoice_no,
      Manual_invoice_no: salesOrder.Manual_invoice_no
    }) ? 'completed' : 'pending',
    data: {
      invoice_no: salesOrder.invoice_no || "",
      Manual_invoice_no: salesOrder.Manual_invoice_no || "",
      total_invoice: toNumber(salesOrder.total_invoice || 0),
      // BILL TO details (carried forward from previous steps)
      bill_to: billToDetails,
      // SHIP TO details (carried forward from previous steps)
      ship_to: shipToDetails,
      invoice_status: salesOrder.invoice_status || "Pending"
    }
  };

  // Payment step
  const paymentStep = {
    step: 'payment',
    status: isStepCompleted({ 
      step: 'payment',
      Payment_no: salesOrder.Payment_no,
      Manual_payment_no: salesOrder.Manual_payment_no,
      amount_received: salesOrder.amount_received
    }) ? 'completed' : 'pending',
    data: {
      Payment_no: salesOrder.Payment_no || "",
      Manual_payment_no: salesOrder.Manual_payment_no || "",
      // RECEIVED FROM details
      received_from: {
        customer_name: salesOrder.payment_received_customer_name || salesOrder.qoutation_to_customer_name || "",
        customer_address: salesOrder.payment_received_customer_address || salesOrder.qoutation_to_customer_address || "",
        customer_email: salesOrder.payment_received_customer_email || salesOrder.qoutation_to_customer_email || "",
        customer_phone: salesOrder.payment_received_customer_phone || salesOrder.qoutation_to_customer_phone || ""
      },
      // PAYMENT DETAILS
      payment_details: {
        amount_received: toNumber(salesOrder.amount_received || 0),
        total_amount: toNumber(salesOrder.total_amount || 0),
        payment_status: salesOrder.payment_status || "Pending",
        balance: toNumber(salesOrder.balance || 0),
        payment_note: salesOrder.payment_note || ""
      }
    }
  };

  // Additional information
  const additionalInfo = {
    customer_ref: salesOrder.customer_ref || "",
    signature_url: salesOrder.signature_url || "",
    photo_url: salesOrder.photo_url || "",
    attachment_url: salesOrder.attachment_url || ""
  };

  return {
    company_info: companyInfo,
    items: itemsData,
    steps: [
      quotationStep,
      salesOrderStep,
      deliveryChallanStep,
      invoiceStep,
      paymentStep
    ],
    additional_info: additionalInfo
  };
};

// ✅ Save or Update Sales Order
export const saveOrUpdateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from params instead of body
    let data = { ...req.body };

    // 🖼 Handle Base64 Image Uploads
    const fileFields = [
      "logo_url",
      "signature_url",
      "photo_url",
      "attach_file_url"
    ];

    for (const field of fileFields) {
      if (data[field] && data[field].startsWith("data:")) {
        const uploadedUrl = await uploadToCloudinary(data[field]);
        const dbField = field === "attach_file_url" ? "attachment_url" : field;
        data[dbField] = uploadedUrl || "";
      }
    }

    delete data.attach_file_url;

    // Process items data
    let items = [];
    if (data.items) {
      if (typeof data.items === 'string') {
        try {
          items = JSON.parse(data.items);
        } catch (e) {
          console.error("Error parsing items JSON:", e);
          items = [];
        }
      } else if (Array.isArray(data.items)) {
        items = data.items;
      }
    }

    // If updating, get existing order to carry forward data
    let existingOrder = null;
    if (id) {
      existingOrder = await prisma.salesorder.findUnique({ 
        where: { id: parseInt(id) },
        include: { salesorderitems: true }
      });
      
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Sales order not found" });
      }
    }

    // Map Postman fields → Prisma DB fields
    const mappedData = {
      company_id: toNumber(data.company_id),
      company_name: data.company_name || "",
      company_address: data.company_address || "",
      company_email: data.company_email || "",
      company_phone: data.company_phone || "",
      logo_url: data.logo_url || "",

      qoutation_to_customer_name: data.qoutation_to_customer_name || data.customer_name || "",
      qoutation_to_customer_address: data.qoutation_to_customer_address || data.customer_address || "",
      qoutation_to_customer_email: data.qoutation_to_customer_email || data.customer_email || "",
      qoutation_to_customer_phone: data.qoutation_to_customer_phone || data.customer_phone || "",

      ref_no: data.ref_no || data.quotation_no || "",
      Manual_ref_ro: data.Manual_ref_ro || data.manual_ref_no || "",
      quotation_no: data.quotation_no || "",
      manual_quo_no: data.manual_quo_no || "",
      quotation_date: data.quotation_date ? new Date(data.quotation_date) : null,
      valid_till: data.valid_till ? new Date(data.valid_till) : null,

      subtotal: toNumber(data.sub_total || data.subtotal || 0),
      tax: toNumber(data.tax || 0),
      discount: toNumber(data.discount || 0),
      total: toNumber(data.total || 0),

      bank_name: data.bank_name || data.bank_details?.bank_name || "",
      account_no: data.account_no || data.bank_details?.account_no || "",
      account_holder: data.account_holder || data.bank_details?.account_holder || "",
      ifsc_code: data.ifsc_code || data.bank_details?.ifsc_code || "",

      notes: data.notes || "",
      terms: data.terms || data.terms_and_condition || "",

      signature_url: data.signature_url || "",
      photo_url: data.photo_url || "",
      attachment_url: data.attachment_url || "",

      // BILL TO details - carry forward from existing if not provided
      bill_to_attention_name: data.bill_to_attention_name || (existingOrder?.bill_to_attention_name || ""),
      bill_to_company_name: data.bill_to_company_name || (existingOrder?.bill_to_company_name || ""),
      bill_to_company_address: data.bill_to_company_address || (existingOrder?.bill_to_company_address || ""),
      bill_to_company_phone: data.bill_to_company_phone || (existingOrder?.bill_to_company_phone || ""),
      bill_to_company_email: data.bill_to_company_email || (existingOrder?.bill_to_company_email || ""),
      bill_to_customer_name: data.bill_to_customer_name || (existingOrder?.bill_to_customer_name || ""),
      bill_to_customer_address: data.bill_to_customer_address || (existingOrder?.bill_to_customer_address || ""),
      bill_to_customer_email: data.bill_to_customer_email || (existingOrder?.bill_to_customer_email || ""),
      bill_to_customer_phone: data.bill_to_customer_phone || (existingOrder?.bill_to_customer_phone || ""),

      // SHIP TO details - carry forward from existing if not provided
      ship_to_attention_name: data.ship_to_attention_name || (existingOrder?.ship_to_attention_name || ""),
      ship_to_company_name: data.ship_to_company_name || (existingOrder?.ship_to_company_name || ""),
      ship_to_company_address: data.ship_to_company_address || (existingOrder?.ship_to_company_address || ""),
      ship_to_company_phone: data.ship_to_company_phone || (existingOrder?.ship_to_company_phone || ""),
      ship_to_company_email: data.ship_to_company_email || (existingOrder?.ship_to_company_email || ""),
      ship_to_customer_name: data.ship_to_customer_name || (existingOrder?.ship_to_customer_name || ""),
      ship_to_customer_address: data.ship_to_customer_address || (existingOrder?.ship_to_customer_address || ""),
      ship_to_customer_email: data.ship_to_customer_email || (existingOrder?.ship_to_customer_email || ""),
      ship_to_customer_phone: data.ship_to_customer_phone || (existingOrder?.ship_to_customer_phone || ""),

      payment_received_customer_name: data.payment_received_customer_name || data.received_cust_name || "",
      payment_received_customer_address: data.payment_received_customer_address || data.received_addr || "",
      payment_received_customer_email: data.payment_received_customer_email || data.received_email || "",
      payment_received_customer_phone: data.payment_received_customer_phone || data.received_phone || "",

      driver_name: data.driver_name || data.driver_details?.driver_name || "",
      driver_phone: data.driver_phone || data.driver_details?.driver_phone || "",

      amount_received: toNumber(data.amount_received || 0),
      total_amount: toNumber(data.total_amount || 0),
      payment_status: data.payment_status || "Pending",
      total_invoice: toNumber(data.total_invoice || 0),
      balance: toNumber(data.balance || 0),
      payment_note: data.payment_note || data.payment_notes || "",

      quotation_status: data.quotation_status || "Pending",
      sales_order_status: data.sales_order_status || data.sales_status || "Pending",
      delivery_challan_status: data.delivery_challan_status || "Pending",
      invoice_status: data.invoice_status || "Pending",
      draft_status: data.draft_status || "Draft",

      SO_no: data.SO_no || data.so_no || "",
      Manual_SO_ref: data.Manual_SO_ref || data.manual_so || "",
      Challan_no: data.Challan_no || data.challan_no || "",
      Manual_challan_no: data.Manual_challan_no || data.manual_dc_no || "",
      Manual_DC_no: data.Manual_DC_no || data.manual_dc_no || "",
      invoice_no: data.invoice_no || "",
      Manual_invoice_no: data.Manual_invoice_no || data.manual_invoice_no || "",
      Payment_no: data.Payment_no || data.payment_no || "",
      Manual_payment_no: data.Manual_payment_no || data.manual_payment_no || data.manual_pym_no || "",
      customer_ref: data.customer_ref || "",

      created_at: id ? undefined : new Date(),
      updated_at: new Date(),
    };

    if (!id) {
      // Create new sales order
      const createData = {
        ...mappedData,
        salesorderitems: items.length > 0 ? {
          create: items.map(item => ({
            item_name: item.item_name || item.name || "",
            qty: toNumber(item.qty || item.quantity || 0),
            rate: toNumber(item.rate || 0),
            tax_percent: toNumber(item.tax_percent || item.tax || 0),
            discount: toNumber(item.discount || 0),
            amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
          }))
        } : undefined
      };

      const newOrder = await prisma.salesorder.create({
        data: createData,
        include: {
          salesorderitems: true
        }
      });

      // Structure the response by steps
      const structuredResponse = structureSalesOrderBySteps(newOrder);

      return res.status(201).json({
        success: true,
        message: "Sales order created successfully",
        data: structuredResponse
      });
    } else {
      // Update existing sales order
      const updateData = {
        ...mappedData,
        updated_at: new Date()
      };

      // Handle items update
      if (items.length > 0) {
        // Delete existing items
        await prisma.salesorderitems.deleteMany({
          where: { sales_order_id: parseInt(id) }
        });

        // Add new items
        updateData.salesorderitems = {
          create: items.map(item => ({
            item_name: item.item_name || item.name || "",
            qty: toNumber(item.qty || item.quantity || 0),
            rate: toNumber(item.rate || 0),
            tax_percent: toNumber(item.tax_percent || item.tax || 0),
            discount: toNumber(item.discount || 0),
            amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
          }))
        };
      }

      const updatedOrder = await prisma.salesorder.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          salesorderitems: true
        }
      });

      // Structure the response by steps
      const structuredResponse = structureSalesOrderBySteps(updatedOrder);

      return res.status(200).json({
        success: true,
        message: "Sales order updated successfully",
        data: structuredResponse
      });
    }
  } catch (error) {
    console.error("Error in saveOrUpdateSalesOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Create Sales Order (dedicated POST endpoint)
export const createSalesOrder = async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;

    const fileFields = [
      "logo_url",
      "signature_url",
      "photo_url",
      "attach_file_url"
    ];

    for (const field of fileFields) {
      if (data[field] && data[field].startsWith("data:")) {
        const uploadedUrl = await uploadToCloudinary(data[field]);
        const dbField = field === "attach_file_url" ? "attachment_url" : field;
        data[dbField] = uploadedUrl || "";
      }
    }

    delete data.attach_file_url;

    // Process items data
    let items = [];
    if (data.items) {
      if (typeof data.items === 'string') {
        try {
          items = JSON.parse(data.items);
        } catch (e) {
          console.error("Error parsing items JSON:", e);
          items = [];
        }
      } else if (Array.isArray(data.items)) {
        items = data.items;
      }
    }

    const mappedData = {
      company_id: toNumber(data.company_id),
      company_name: data.company_name || "",
      company_address: data.company_address || "",
      company_email: data.company_email || "",
      company_phone: data.company_phone || "",
      logo_url: data.logo_url || "",

      qoutation_to_customer_name: data.qoutation_to_customer_name || data.customer_name || "",
      qoutation_to_customer_address: data.qoutation_to_customer_address || data.customer_address || "",
      qoutation_to_customer_email: data.qoutation_to_customer_email || data.customer_email || "",
      qoutation_to_customer_phone: data.qoutation_to_customer_phone || data.customer_phone || "",

      ref_no: data.ref_no || data.quotation_no || "",
      Manual_ref_ro: data.Manual_ref_ro || data.manual_ref_no || "",
      quotation_no: data.quotation_no || "",
      manual_quo_no: data.manual_quo_no || "",
      quotation_date: data.quotation_date ? new Date(data.quotation_date) : new Date(),
      valid_till: data.valid_till ? new Date(data.valid_till) : null,

      subtotal: toNumber(data.subtotal || data.sub_total || 0),
      tax: toNumber(data.tax || data.tax_total || 0),
      discount: toNumber(data.discount || data.discount_total || 0),
      total: toNumber(data.total || data.grand_total || 0),

      bank_name: data.bank_name || data.bank_details?.bank_name || "",
      account_no: data.account_no || data.bank_details?.account_no || "",
      account_holder: data.account_holder || data.bank_details?.account_holder || "",
      ifsc_code: data.ifsc_code || data.bank_details?.ifsc_code || "",

      notes: data.notes || "",
      terms: data.terms || data.terms_conditions || "",

      signature_url: data.signature_url || "",
      photo_url: data.photo_url || "",
      attachment_url: data.attachment_url || "",

      bill_to_attention_name: data.bill_to_attention_name || "",
      bill_to_company_name: data.bill_to_company_name || data.bill_to_comp_name || "",
      bill_to_company_address: data.bill_to_company_address || data.bill_to_comp_address || "",
      bill_to_company_phone: data.bill_to_company_phone || data.bill_to_comp_phone || "",
      bill_to_company_email: data.bill_to_company_email || data.bill_to_comp_email || "",

      bill_to_customer_name: data.bill_to_customer_name || data.bill_to_cust_name || "",
      bill_to_customer_address: data.bill_to_customer_address || data.bill_to_cust_addr || "",
      bill_to_customer_email: data.bill_to_customer_email || data.bill_to_cust_email || "",
      bill_to_customer_phone: data.bill_to_customer_phone || data.bill_to_cust_phone || "",

      ship_to_attention_name: data.ship_to_attention_name || "",
      ship_to_company_name: data.ship_to_company_name || data.ship_to_comp_name || "",
      ship_to_company_address: data.ship_to_company_address || data.ship_to_comp_address || "",
      ship_to_company_phone: data.ship_to_company_phone || data.ship_to_comp_phone || "",
      ship_to_company_email: data.ship_to_company_email || data.ship_to_comp_email || "",

      ship_to_customer_name: data.ship_to_customer_name || data.ship_to_cust_name || "",
      ship_to_customer_address: data.ship_to_customer_address || data.ship_to_cust_addr || "",
      ship_to_customer_email: data.ship_to_customer_email || data.ship_to_cust_email || "",
      ship_to_customer_phone: data.ship_to_customer_phone || data.ship_to_cust_phone || "",

      payment_received_customer_name: data.payment_received_customer_name || data.received_cust_name || "",
      payment_received_customer_address: data.payment_received_customer_address || data.received_addr || "",
      payment_received_customer_email: data.payment_received_customer_email || data.received_email || "",
      payment_received_customer_phone: data.payment_received_customer_phone || data.received_phone || "",

      driver_name: data.driver_name || data.driver_details?.driver_name || "",
      driver_phone: data.driver_phone || data.driver_details?.driver_phone || "",

      amount_received: toNumber(data.amount_received || 0),
      total_amount: toNumber(data.total_amount || 0),
      payment_status: data.payment_status || "Pending",
      total_invoice: toNumber(data.total_invoice || 0),
      balance: toNumber(data.balance || 0),
      payment_note: data.payment_note || data.payment_notes || "",

      quotation_status: data.quotation_status || "Pending",
      sales_order_status: data.sales_order_status || data.sales_status || "Pending",
      delivery_challan_status: data.delivery_challan_status || "Pending",
      invoice_status: data.invoice_status || "Pending",
      draft_status: data.draft_status || "Draft",

      SO_no: data.SO_no || data.so_no || "",
      Manual_SO_ref: data.Manual_SO_ref || data.manual_so || "",
      Challan_no: data.Challan_no || data.challan_no || "",
      Manual_challan_no: data.Manual_challan_no || data.manual_dc_no || "",
      Manual_DC_no: data.Manual_DC_no || data.manual_dc_no || "",
      invoice_no: data.invoice_no || "",
      Manual_invoice_no: data.Manual_invoice_no || data.manual_invoice_no || "",
      Payment_no: data.Payment_no || data.payment_no || "",
      Manual_payment_no: data.Manual_payment_no || data.manual_payment_no || data.manual_pym_no || "",
      customer_ref: data.customer_ref || "",

      created_at: new Date(),
      updated_at: new Date(),
    };

    const createData = {
      ...mappedData,
      salesorderitems: items.length > 0 ? {
        create: items.map(item => ({
          item_name: item.item_name || item.name || "",
          qty: toNumber(item.qty || item.quantity || 0),
          rate: toNumber(item.rate || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
        }))
      } : undefined
    };

    const newOrder = await prisma.salesorder.create({
      data: createData,
      include: {
        salesorderitems: true
      }
    });

    // Structure the response by steps
    const structuredResponse = structureSalesOrderBySteps(newOrder);

    return res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: structuredResponse
    });
  } catch (error) {
    console.error("Error creating sales order:", error);
    
    if (error.code === 'P1001' || error.message.includes('Server has closed the connection')) {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please check your database connection.",
        error: "The database server is not reachable or the connection was closed."
      });
    }
    
    if (error.code === 'P2021' || error.message.includes("doesn't exist")) {
      return res.status(500).json({
        success: false,
        message: "Database table not found. Please run: npx prisma db push",
        error: "The salesorder table does not exist in the database."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const getAllSalesOrders = async (req, res) => {
  try {
    const salesOrders = await prisma.salesorder.findMany({
      include: {
        salesorderitems: true
      },
      orderBy: { created_at: "desc" }
    });

    // Structure each sales order by steps
    const structuredOrders = salesOrders.map(order => structureSalesOrderBySteps(order));

    return res.status(200).json({
      success: true,
      message: 'Sales orders fetched successfully',
      data: structuredOrders
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching sales orders',
      error: error.message
    });
  }
};

export const getSalesOrdersByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const salesOrders = await prisma.salesorder.findMany({
      where: { company_id: parseInt(companyId) },
      include: {
        salesorderitems: true,
      },
      orderBy: { created_at: "desc" },
    });

    // Structure each sales order by steps
    const structuredOrders = salesOrders.map(order => structureSalesOrderBySteps(order));

    return res.status(200).json({
      success: true,
      message: `Sales orders for company ID ${companyId} fetched successfully`,
      data: structuredOrders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching sales orders",
      error: error.message,
    });
  }
};

// New endpoint to get sales order by step
export const getSalesOrderByStep = async (req, res) => {
  try {
    const { id, step } = req.params;
    const salesOrderId = parseInt(id, 10);

    if (!salesOrderId || isNaN(salesOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Sales Order ID required",
      });
    }

    if (!step) {
      return res.status(400).json({
        success: false,
        message: "Step is required",
      });
    }

    // Fetch the sales order
    const salesOrder = await prisma.salesorder.findUnique({
      where: { id: salesOrderId },
      include: {
        salesorderitems: true
      }
    });

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    // Structure the sales order by steps
    const structuredOrder = structureSalesOrderBySteps(salesOrder);

    // Find the requested step
    const requestedStep = structuredOrder.steps.find(s => s.step === step);

    if (!requestedStep) {
      return res.status(404).json({
        success: false,
        message: "Step not found",
      });
    }

    // Return only the requested step with common information
    return res.status(200).json({
      success: true,
      message: `Sales order ${step} step fetched successfully`,
      data: {
        company_info: structuredOrder.company_info,
        items: structuredOrder.items,
        step: requestedStep,
        additional_info: structuredOrder.additional_info
      }
    });
  } catch (error) {
    console.error("Error fetching sales order by step:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales order by step",
      error: error.message,
    });
  }
};

// New endpoint to update a specific step
export const updateSalesOrderStep = async (req, res) => {
  try {
    const { id, step } = req.params;
    const salesOrderId = parseInt(id, 10);
    const data = { ...req.body };

    if (!salesOrderId || isNaN(salesOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Sales Order ID required",
      });
    }

    if (!step) {
      return res.status(400).json({
        success: false,
        message: "Step is required",
      });
    }

    // Fetch the existing sales order
    const existingOrder = await prisma.salesorder.findUnique({
      where: { id: salesOrderId },
      include: { salesorderitems: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Sales order not found" });
    }

    // Handle file uploads
    const fileFields = [
      "logo_url",
      "signature_url",
      "photo_url",
      "attach_file_url"
    ];

    for (const field of fileFields) {
      if (data[field] && data[field].startsWith("data:")) {
        const uploadedUrl = await uploadToCloudinary(data[field]);
        const dbField = field === "attach_file_url" ? "attachment_url" : field;
        data[dbField] = uploadedUrl || "";
      }
    }

    // Process items data if provided
    let items = [];
    if (data.items) {
      if (typeof data.items === 'string') {
        try {
          items = JSON.parse(data.items);
        } catch (e) {
          console.error("Error parsing items JSON:", e);
          items = [];
        }
      } else if (Array.isArray(data.items)) {
        items = data.items;
      }
    }

    // Prepare update data based on the step
    let updateData = { updated_at: new Date() };

    switch (step) {
      case 'quotation':
        updateData = {
          ...updateData,
          ref_no: data.ref_no || existingOrder.ref_no,
          Manual_ref_ro: data.Manual_ref_ro || existingOrder.Manual_ref_ro,
          quotation_no: data.quotation_no || existingOrder.quotation_no,
          manual_quo_no: data.manual_quo_no || existingOrder.manual_quo_no,
          quotation_date: data.quotation_date ? new Date(data.quotation_date) : existingOrder.quotation_date,
          valid_till: data.valid_till ? new Date(data.valid_till) : existingOrder.valid_till,
          qoutation_to_customer_name: data.qoutation_to_customer_name || existingOrder.qoutation_to_customer_name,
          qoutation_to_customer_address: data.qoutation_to_customer_address || existingOrder.qoutation_to_customer_address,
          qoutation_to_customer_email: data.qoutation_to_customer_email || existingOrder.qoutation_to_customer_email,
          qoutation_to_customer_phone: data.qoutation_to_customer_phone || existingOrder.qoutation_to_customer_phone,
          // BILL TO details
          bill_to_attention_name: data.bill_to_attention_name || existingOrder.bill_to_attention_name,
          bill_to_company_name: data.bill_to_company_name || existingOrder.bill_to_company_name,
          bill_to_company_address: data.bill_to_company_address || existingOrder.bill_to_company_address,
          bill_to_company_phone: data.bill_to_company_phone || existingOrder.bill_to_company_phone,
          bill_to_company_email: data.bill_to_company_email || existingOrder.bill_to_company_email,
          bill_to_customer_name: data.bill_to_customer_name || existingOrder.bill_to_customer_name,
          bill_to_customer_address: data.bill_to_customer_address || existingOrder.bill_to_customer_address,
          bill_to_customer_email: data.bill_to_customer_email || existingOrder.bill_to_customer_email,
          bill_to_customer_phone: data.bill_to_customer_phone || existingOrder.bill_to_customer_phone,
          notes: data.notes || existingOrder.notes,
          terms: data.terms || existingOrder.terms,
          subtotal: toNumber(data.sub_total) || existingOrder.subtotal,
          tax: toNumber(data.tax) || existingOrder.tax,
          discount: toNumber(data.discount) || existingOrder.discount,
          total: toNumber(data.total) || existingOrder.total,
          quotation_status: data.quotation_status || existingOrder.quotation_status,
          draft_status: data.draft_status || existingOrder.draft_status
        };
        break;

      case 'sales_order':
        updateData = {
          ...updateData,
          SO_no: data.SO_no || existingOrder.SO_no,
          Manual_SO_ref: data.Manual_SO_ref || existingOrder.Manual_SO_ref,
          // SHIP TO details
          ship_to_attention_name: data.ship_to_attention_name || existingOrder.ship_to_attention_name,
          ship_to_company_name: data.ship_to_company_name || existingOrder.ship_to_company_name,
          ship_to_company_address: data.ship_to_company_address || existingOrder.ship_to_company_address,
          ship_to_company_phone: data.ship_to_company_phone || existingOrder.ship_to_company_phone,
          ship_to_company_email: data.ship_to_company_email || existingOrder.ship_to_company_email,
          ship_to_customer_name: data.ship_to_customer_name || existingOrder.ship_to_customer_name,
          ship_to_customer_address: data.ship_to_customer_address || existingOrder.ship_to_customer_address,
          ship_to_customer_email: data.ship_to_customer_email || existingOrder.ship_to_customer_email,
          ship_to_customer_phone: data.ship_to_customer_phone || existingOrder.ship_to_customer_phone,
          sales_order_status: data.sales_order_status || existingOrder.sales_order_status
        };
        break;

      case 'delivery_challan':
        updateData = {
          ...updateData,
          Challan_no: data.Challan_no || existingOrder.Challan_no,
          Manual_challan_no: data.Manual_challan_no || existingOrder.Manual_challan_no,
          Manual_DC_no: data.Manual_DC_no || existingOrder.Manual_DC_no,
          driver_name: data.driver_name || existingOrder.driver_name,
          driver_phone: data.driver_phone || existingOrder.driver_phone,
          delivery_challan_status: data.delivery_challan_status || existingOrder.delivery_challan_status
        };
        break;

      case 'invoice':
        updateData = {
          ...updateData,
          invoice_no: data.invoice_no || existingOrder.invoice_no,
          Manual_invoice_no: data.Manual_invoice_no || existingOrder.Manual_invoice_no,
          total_invoice: toNumber(data.total_invoice) || existingOrder.total_invoice,
          invoice_status: data.invoice_status || existingOrder.invoice_status
        };
        break;

      case 'payment':
        updateData = {
          ...updateData,
          Payment_no: data.Payment_no || existingOrder.Payment_no,
          Manual_payment_no: data.Manual_payment_no || existingOrder.Manual_payment_no,
          payment_received_customer_name: data.payment_received_customer_name || existingOrder.payment_received_customer_name,
          payment_received_customer_address: data.payment_received_customer_address || existingOrder.payment_received_customer_address,
          payment_received_customer_email: data.payment_received_customer_email || existingOrder.payment_received_customer_email,
          payment_received_customer_phone: data.payment_received_customer_phone || existingOrder.payment_received_customer_phone,
          amount_received: toNumber(data.amount_received) || existingOrder.amount_received,
          total_amount: toNumber(data.total_amount) || existingOrder.total_amount,
          payment_status: data.payment_status || existingOrder.payment_status,
          balance: toNumber(data.balance) || existingOrder.balance,
          payment_note: data.payment_note || existingOrder.payment_note
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid step",
        });
    }

    // Handle items update if provided
    if (items.length > 0) {
      // Delete existing items
      await prisma.salesorderitems.deleteMany({
        where: { sales_order_id: salesOrderId }
      });

      // Add new items
      updateData.salesorderitems = {
        create: items.map(item => ({
          item_name: item.item_name || item.name || "",
          qty: toNumber(item.qty || item.quantity || 0),
          rate: toNumber(item.rate || 0),
          tax_percent: toNumber(item.tax_percent || item.tax || 0),
          discount: toNumber(item.discount || 0),
          amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
        }))
      };
    }

    // Update the sales order
    const updatedOrder = await prisma.salesorder.update({
      where: { id: salesOrderId },
      data: updateData,
      include: {
        salesorderitems: true
      }
    });

    // Structure the response by steps
    const structuredResponse = structureSalesOrderBySteps(updatedOrder);

    return res.status(200).json({
      success: true,
      message: `Sales order ${step} step updated successfully`,
      data: structuredResponse
    });
  } catch (error) {
    console.error("Error updating sales order step:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update sales order step",
      error: error.message,
    });
  }
};