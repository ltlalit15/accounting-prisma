// src/controllers/salesOrderController.js
{
  /**
import prisma from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';
 */
}
// Configure Cloudinary once (use .env in production)

// ✅ Create Sales Order (dedicated POST endpoint)
// export const createSalesOrder = async (req, res) => {
//   try {
//     const data = { ...req.body };
//     delete data.id;

//     const fileFields = [
//       "logo_url",
//       "signature_url",
//       "photo_url",
//       "attach_file_url"
//     ];

//     for (const field of fileFields) {
//       if (data[field] && data[field].startsWith("data:")) {
//         const uploadedUrl = await uploadToCloudinary(data[field]);
//         const dbField = field === "attach_file_url" ? "attachment_url" : field;
//         data[dbField] = uploadedUrl || "";
//       }
//     }

//     delete data.attach_file_url;

//     // Process items data
//     let items = [];
//     if (data.items) {
//       if (typeof data.items === 'string') {
//         try {
//           items = JSON.parse(data.items);
//         } catch (e) {
//           console.error("Error parsing items JSON:", e);
//           items = [];
//         }
//       } else if (Array.isArray(data.items)) {
//         items = data.items;
//       }
//     }

//     const mappedData = {
//       company_id: toNumber(data.company_id),
//       company_name: data.company_name || "",
//       company_address: data.company_address || "",
//       company_email: data.company_email || "",
//       company_phone: data.company_phone || "",
//       logo_url: data.logo_url || "",

//       qoutation_to_customer_name: data.qoutation_to_customer_name || data.customer_name || "",
//       qoutation_to_customer_address: data.qoutation_to_customer_address || data.customer_address || "",
//       qoutation_to_customer_email: data.qoutation_to_customer_email || data.customer_email || "",
//       qoutation_to_customer_phone: data.qoutation_to_customer_phone || data.customer_phone || "",

//       ref_no: data.ref_no || data.quotation_no || "",
//       Manual_ref_ro: data.Manual_ref_ro || data.manual_ref_no || "",
//       quotation_no: data.quotation_no || "",
//       manual_quo_no: data.manual_quo_no || "",
//       quotation_date: data.quotation_date ? new Date(data.quotation_date) : new Date(),
//       valid_till: data.valid_till ? new Date(data.valid_till) : null,

//       subtotal: toNumber(data.subtotal || data.sub_total || 0),
//       tax: toNumber(data.tax || data.tax_total || 0),
//       discount: toNumber(data.discount || data.discount_total || 0),
//       total: toNumber(data.total || data.grand_total || 0),

//       bank_name: data.bank_name || data.bank_details?.bank_name || "",
//       account_no: data.account_no || data.bank_details?.account_no || "",
//       account_holder: data.account_holder || data.bank_details?.account_holder || "",
//       ifsc_code: data.ifsc_code || data.bank_details?.ifsc_code || "",

//       notes: data.notes || "",
//       terms: data.terms || data.terms_conditions || "",

//       signature_url: data.signature_url || "",
//       photo_url: data.photo_url || "",
//       attachment_url: data.attachment_url || "",

//       bill_to_attention_name: data.bill_to_attention_name || "",
//       bill_to_company_name: data.bill_to_company_name || data.bill_to_comp_name || "",
//       bill_to_company_address: data.bill_to_company_address || data.bill_to_comp_address || "",
//       bill_to_company_phone: data.bill_to_company_phone || data.bill_to_comp_phone || "",
//       bill_to_company_email: data.bill_to_company_email || data.bill_to_comp_email || "",

//       bill_to_customer_name: data.bill_to_customer_name || data.bill_to_cust_name || "",
//       bill_to_customer_address: data.bill_to_customer_address || data.bill_to_cust_addr || "",
//       bill_to_customer_email: data.bill_to_customer_email || data.bill_to_cust_email || "",
//       bill_to_customer_phone: data.bill_to_customer_phone || data.bill_to_cust_phone || "",

//       ship_to_attention_name: data.ship_to_attention_name || "",
//       ship_to_company_name: data.ship_to_company_name || data.ship_to_comp_name || "",
//       ship_to_company_address: data.ship_to_company_address || data.ship_to_comp_address || "",
//       ship_to_company_phone: data.ship_to_company_phone || data.ship_to_comp_phone || "",
//       ship_to_company_email: data.ship_to_company_email || data.ship_to_comp_email || "",

//       ship_to_customer_name: data.ship_to_customer_name || data.ship_to_cust_name || "",
//       ship_to_customer_address: data.ship_to_customer_address || data.ship_to_cust_addr || "",
//       ship_to_customer_email: data.ship_to_customer_email || data.ship_to_cust_email || "",
//       ship_to_customer_phone: data.ship_to_customer_phone || data.ship_to_cust_phone || "",

//       payment_received_customer_name: data.payment_received_customer_name || data.received_cust_name || "",
//       payment_received_customer_address: data.payment_received_customer_address || data.received_addr || "",
//       payment_received_customer_email: data.payment_received_customer_email || data.received_email || "",
//       payment_received_customer_phone: data.payment_received_customer_phone || data.received_phone || "",

//       driver_name: data.driver_name || data.driver_details?.driver_name || "",
//       driver_phone: data.driver_phone || data.driver_details?.driver_phone || "",

//       amount_received: toNumber(data.amount_received || 0),
//       total_amount: toNumber(data.total_amount || 0),
//       payment_status: data.payment_status || "Pending",
//       total_invoice: toNumber(data.total_invoice || 0),
//       balance: toNumber(data.balance || 0),
//       payment_note: data.payment_note || data.payment_notes || "",

//       quotation_status: data.quotation_status || "Pending",
//       sales_order_status: data.sales_order_status || data.sales_status || "Pending",
//       delivery_challan_status: data.delivery_challan_status || "Pending",
//       invoice_status: data.invoice_status || "Pending",
//       draft_status: data.draft_status || "Draft",

//       SO_no: data.SO_no || data.so_no || "",
//       Manual_SO_ref: data.Manual_SO_ref || data.manual_so || "",
//       Challan_no: data.Challan_no || data.challan_no || "",
//       Manual_challan_no: data.Manual_challan_no || data.manual_dc_no || "",
//       Manual_DC_no: data.Manual_DC_no || data.manual_dc_no || "",
//       invoice_no: data.invoice_no || "",
//       Manual_invoice_no: data.Manual_invoice_no || data.manual_invoice_no || "",
//       Payment_no: data.Payment_no || data.payment_no || "",
//       Manual_payment_no: data.Manual_payment_no || data.manual_payment_no || data.manual_pym_no || "",
//       customer_ref: data.customer_ref || "",

//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     const createData = {
//       ...mappedData,
//       salesorderitems: items.length > 0 ? {
//         create: items.map(item => ({
//           item_name: item.item_name || item.name || "",
//           qty: toNumber(item.qty || item.quantity || 0),
//           rate: toNumber(item.rate || 0),
//           tax_percent: toNumber(item.tax_percent || item.tax || 0),
//           discount: toNumber(item.discount || 0),
//           amount: toNumber(item.amount) || (toNumber(item.qty || item.quantity) * toNumber(item.rate))
//         }))
//       } : undefined
//     };

//     const newOrder = await prisma.salesorder.create({
//       data: createData,
//       include: {
//         salesorderitems: true
//       }
//     });

//     // Structure the response by steps
//     const structuredResponse = structureSalesOrderBySteps(newOrder);

//     return res.status(201).json({
//       success: true,
//       message: "Sales order created successfully",
//       data: structuredResponse
//     });
//   } catch (error) {
//     console.error("Error creating sales order:", error);

//     if (error.code === 'P1001' || error.message.includes('Server has closed the connection')) {
//       return res.status(503).json({
//         success: false,
//         message: "Database connection error. Please check your database connection.",
//         error: "The database server is not reachable or the connection was closed."
//       });
//     }

//     if (error.code === 'P2021' || error.message.includes("doesn't exist")) {
//       return res.status(500).json({
//         success: false,
//         message: "Database table not found. Please run: npx prisma db push",
//         error: "The salesorder table does not exist in the database."
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

// export const createSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };

//     const orderId = body.id ? Number(body.id) : null;

//     // ============ VALIDATION ============
//     if (!body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory"
//       });
//     }

//     if (!Array.isArray(body.items) || body.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty"
//       });
//     }

//     if (!body.steps) {
//       return res.status(400).json({
//         success: false,
//         message: "steps object is mandatory"
//       });
//     }

//     const requiredSteps = ["quotation", "sales_order", "delivery_challan", "invoice", "payment"];
//     for (const step of requiredSteps) {
//       if (!body.steps[step]) {
//         return res.status(400).json({
//           success: false,
//           message: `${step} step data is mandatory`
//         });
//       }
//     }

//     // ============ FILE UPLOAD HANDLER ============
//     const fileFields = ["logo_url", "signature_url", "photo_url", "attachment_url"];
//     for (const field of fileFields) {
//       if (body.company_info[field] && body.company_info[field].startsWith("data:")) {
//         const uploaded = await uploadToCloudinary(body.company_info[field]);
//         body.company_info[field] = uploaded ?? "";
//       }
//     }

//     // ============ AUTO STATUS COMPLETE ============
//     const stepCompleted = (data, fields) =>
//       fields.every(field => data[field] !== "" && data[field] !== null && data[field] !== undefined);

//     const stepRules = {
//       quotation: ["ref_no", "quotation_no", "quotation_date", "subtotal", "total"],
//       sales_order: ["SO_no", "sales_order_status"],
//       delivery_challan: ["Challan_no", "driver_name"],
//       invoice: ["invoice_no"],
//       payment: ["Payment_no", "amount_received"]
//     };

//     for (const step of requiredSteps) {
//       const isCompleted = stepCompleted(body.steps[step], stepRules[step]);
//       body.steps[step].status = isCompleted ? "completed" : "pending";
//     }

//     // ============ MAP COMPANY INFO ============
//     const companyData = {
//       company_id: Number(body.company_info.company_id),
//       company_name: body.company_info.company_name,
//       company_address: body.company_info.company_address,
//       company_email: body.company_info.company_email,
//       company_phone: body.company_info.company_phone,
//       logo_url: body.company_info.logo_url ?? "",
//       bank_name: body.company_info.bank_name ?? "",
//       account_no: body.company_info.account_no ?? "",
//       account_holder: body.company_info.account_holder ?? "",
//       ifsc_code: body.company_info.ifsc_code ?? ""
//     };

//     // ============ MAP ITEMS ============
//     const itemsData = body.items.map(item => ({
//       item_name: item.item_name,
//       qty: Number(item.qty),
//       rate: Number(item.rate),
//       tax_percent: Number(item.tax_percent),
//       discount: Number(item.discount),
//       amount: Number(item.amount)
//     }));

//     // ============ PREPARE FINAL DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,
//       ...body.steps.quotation,
//       ...body.steps.sales_order,
//       ...body.steps.delivery_challan,
//       ...body.steps.invoice,
//       ...body.steps.payment,

//       customer_ref: body.additional_info?.customer_ref ?? "",
//       signature_url: body.additional_info?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? "",

//       updated_at: new Date()
//     };

//     // ============ CREATE OR UPDATE ============

//     let savedOrder;

//     if (orderId) {
//       // UPDATE
//       await prisma.salesorderitems.deleteMany({
//         where: { sales_order_id: orderId }
//       });

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           salesorderitems: {
//             create: itemsData
//           }
//         },
//         include: { salesorderitems: true }
//       });
//     } else {
//       // CREATE
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: {
//             create: itemsData
//           }
//         },
//         include: { salesorderitems: true }
//       });
//     }

//     // ============ FORMAT RESPONSE (same as your structure) ============

//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at
//       },
//       items: savedOrder.salesorderitems,
//       steps: [
//         {
//           step: "quotation",
//           status: body.steps.quotation.status,
//           data: body.steps.quotation
//         },
//         {
//           step: "sales_order",
//           status: body.steps.sales_order.status,
//           data: body.steps.sales_order
//         },
//         {
//           step: "delivery_challan",
//           status: body.steps.delivery_challan.status,
//           data: body.steps.delivery_challan
//         },
//         {
//           step: "invoice",
//           status: body.steps.invoice.status,
//           data: body.steps.invoice
//         },
//         {
//           step: "payment",
//           status: body.steps.payment.status,
//           data: body.steps.payment
//         }
//       ],
//       additional_info: body.additional_info ?? {}
//     };

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Sales order updated" : "Sales order created",
//       data: response
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };

// export const createSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };

//     const orderId = body.id ? Number(body.id) : null;

//     // ============ VALIDATION ============
//     if (!body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory"
//       });
//     }

//     if (!Array.isArray(body.items) || body.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty"
//       });
//     }

//     if (!body.steps) {
//       return res.status(400).json({
//         success: false,
//         message: "steps object is mandatory"
//       });
//     }

//     const requiredSteps = ["quotation", "sales_order", "delivery_challan", "invoice", "payment"];
//     for (const step of requiredSteps) {
//       if (!body.steps[step]) {
//         return res.status(400).json({
//           success: false,
//           message: `${step} step data is mandatory`
//         });
//       }
//     }

//     // ============ FILE UPLOAD HANDLER ============
//     const fileFields = ["logo_url", "signature_url", "photo_url", "attachment_url"];
//     for (const field of fileFields) {
//       if (body.company_info[field] && body.company_info[field].startsWith("data:")) {
//         const uploaded = await uploadToCloudinary(body.company_info[field]);
//         body.company_info[field] = uploaded ?? "";
//       }
//     }

//     // ============ AUTO STATUS COMPLETE ============
//     const stepCompleted = (data, fields) =>
//       fields.every(field => data[field] !== "" && data[field] !== null && data[field] !== undefined);

//     const stepRules = {
//       quotation: ["ref_no", "quotation_no", "quotation_date", "subtotal", "total"],
//       sales_order: ["SO_no", "sales_order_status"],
//       delivery_challan: ["Challan_no", "driver_name"],
//       invoice: ["invoice_no"],
//       payment: ["Payment_no", "amount_received"]
//     };

//     for (const step of requiredSteps) {
//       const isCompleted = stepCompleted(body.steps[step], stepRules[step]);
//       body.steps[step].status = isCompleted ? "completed" : "pending";
//     }

//     // ============ MAP COMPANY INFO ============
//     const companyData = {
//       company_id: Number(body.company_info.company_id),
//       company_name: body.company_info.company_name,
//       company_address: body.company_info.company_address,
//       company_email: body.company_info.company_email,
//       company_phone: body.company_info.company_phone,
//       logo_url: body.company_info.logo_url ?? "",
//       bank_name: body.company_info.bank_name ?? "",
//       account_no: body.company_info.account_no ?? "",
//       account_holder: body.company_info.account_holder ?? "",
//       ifsc_code: body.company_info.ifsc_code ?? ""
//     };

//     // ============ MAP ITEMS ============
//     const itemsData = body.items.map(item => ({
//       item_name: item.item_name,
//       qty: Number(item.qty),
//       rate: Number(item.rate),
//       tax_percent: Number(item.tax_percent),
//       discount: Number(item.discount),
//       amount: Number(item.amount)
//     }));

//     // ============ PREPARE FINAL DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,
//       ...body.steps.quotation,
//       ...body.steps.sales_order,
//       ...body.steps.delivery_challan,
//       ...body.steps.invoice,
//       ...body.steps.payment,

//       customer_ref: body.additional_info?.customer_ref ?? "",
//       signature_url: body.additional_info?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? "",

//       updated_at: new Date()
//     };

//     // ============ FIX DATE FIELDS FOR PRISMA ============
//     const fixDate = (d) => (d ? new Date(d) : null);

//     dbData.quotation_date = fixDate(dbData.quotation_date);
//     dbData.valid_till = fixDate(dbData.valid_till);
//     dbData.due_date = fixDate(dbData.due_date);
//     dbData.invoice_date = fixDate(dbData.invoice_date);
//     dbData.payment_date = fixDate(dbData.payment_date);

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;

//     if (orderId) {
//       // UPDATE
//       await prisma.salesorderitems.deleteMany({
//         where: { sales_order_id: orderId }
//       });

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           salesorderitems: {
//             create: itemsData
//           }
//         },
//         include: { salesorderitems: true }
//       });
//     } else {
//       // CREATE
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: {
//             create: itemsData
//           }
//         },
//         include: { salesorderitems: true }
//       });
//     }

//     // ============ FORMAT RESPONSE ============
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at
//       },
//       items: savedOrder.salesorderitems,
//       steps: [
//         {
//           step: "quotation",
//           status: body.steps.quotation.status,
//           data: body.steps.quotation
//         },
//         {
//           step: "sales_order",
//           status: body.steps.sales_order.status,
//           data: body.steps.sales_order
//         },
//         {
//           step: "delivery_challan",
//           status: body.steps.delivery_challan.status,
//           data: body.steps.delivery_challan
//         },
//         {
//           step: "invoice",
//           status: body.steps.invoice.status,
//           data: body.steps.invoice
//         },
//         {
//           step: "payment",
//           status: body.steps.payment.status,
//           data: body.steps.payment
//         }
//       ],
//       additional_info: body.additional_info ?? {}
//     };

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Sales order updated" : "Sales order created",
//       data: response
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };

// export const createSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };

//     const orderId = body.id ? Number(body.id) : null;

//     // ============ VALIDATION ============
//     if (!body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory"
//       });
//     }

//     if (!Array.isArray(body.items) || body.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty"
//       });
//     }

//     // ❗ STEPS OPTIONAL NOW
//     const steps = body.steps || {};
//     const requiredSteps = ["quotation", "sales_order", "delivery_challan", "invoice", "payment"];

//     // ============ FILE UPLOAD HANDLER ============
//     const fileFields = ["logo_url", "signature_url", "photo_url", "attachment_url"];
//     for (const field of fileFields) {
//       if (body.company_info[field] && body.company_info[field].startsWith("data:")) {
//         const uploaded = await uploadToCloudinary(body.company_info[field]);
//         body.company_info[field] = uploaded ?? "";
//       }
//     }

//     // ============ AUTO STATUS COMPLETE ============
//     const stepCompleted = (data, fields) =>
//       fields.every(field => data[field] !== "" && data[field] !== null && data[field] !== undefined);

//     const stepRules = {
//       quotation: ["ref_no", "quotation_no", "quotation_date", "subtotal", "total"],
//       sales_order: ["SO_no", "sales_order_status"],
//       delivery_challan: ["Challan_no", "driver_name"],
//       invoice: ["invoice_no"],
//       payment: ["Payment_no", "amount_received"]
//     };

//     // ❗ Only check status for steps that user actually sent
//     requiredSteps.forEach(step => {
//       if (steps[step]) {
//         const isCompleted = stepCompleted(steps[step], stepRules[step]);
//         steps[step].status = isCompleted ? "completed" : "pending";
//       }
//     });

//     // ============ MAP COMPANY INFO ============
//     const companyData = {
//       company_id: Number(body.company_info.company_id),
//       company_name: body.company_info.company_name,
//       company_address: body.company_info.company_address,
//       company_email: body.company_info.company_email,
//       company_phone: body.company_info.company_phone,
//       logo_url: body.company_info.logo_url ?? "",
//       bank_name: body.company_info.bank_name ?? "",
//       account_no: body.company_info.account_no ?? "",
//       account_holder: body.company_info.account_holder ?? "",
//       ifsc_code: body.company_info.ifsc_code ?? ""
//     };

//     // ============ MAP ITEMS ============
//     const itemsData = body.items.map(item => ({
//       item_name: item.item_name,
//       qty: Number(item.qty),
//       rate: Number(item.rate),
//       tax_percent: Number(item.tax_percent),
//       discount: Number(item.discount),
//       amount: Number(item.amount)
//     }));

//     // ============ PREPARE FINAL DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,
//       ...(steps.quotation || {}),
//       ...(steps.sales_order || {}),
//       ...(steps.delivery_challan || {}),
//       ...(steps.invoice || {}),
//       ...(steps.payment || {}),

//       customer_ref: body.additional_info?.customer_ref ?? "",
//       signature_url: body.additional_info?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? "",

//       updated_at: new Date()
//     };

//     // ============ FIX DATE FIELDS ============
//     const fixDate = d => (d ? new Date(d) : null);

//     if (dbData.quotation_date) dbData.quotation_date = fixDate(dbData.quotation_date);
//     if (dbData.valid_till) dbData.valid_till = fixDate(dbData.valid_till);
//     if (dbData.due_date) dbData.due_date = fixDate(dbData.due_date);
//     if (dbData.invoice_date) dbData.invoice_date = fixDate(dbData.invoice_date);
//     if (dbData.payment_date) dbData.payment_date = fixDate(dbData.payment_date);

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;

//     if (orderId) {
//       await prisma.salesorderitems.deleteMany({
//         where: { sales_order_id: orderId }
//       });

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           salesorderitems: { create: itemsData }
//         },
//         include: { salesorderitems: true }
//       });
//     } else {
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: { create: itemsData }
//         },
//         include: { salesorderitems: true }
//       });
//     }

//     // ============ FORMAT RESPONSE ============
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at
//       },
//       items: savedOrder.salesorderitems,
//       steps: requiredSteps.map(step => ({
//         step,
//         status: steps[step]?.status ?? "pending",
//         data: steps[step] ?? {}
//       })),
//       additional_info: body.additional_info ?? {}
//     };

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Sales order updated" : "Sales order created",
//       data: response
//     });

//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };

// export const createSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = body.id ? Number(body.id) : null;

//     const steps = body.steps || {};
//     const requiredSteps = ["quotation", "sales_order", "delivery_challan", "invoice", "payment"];

//     // ============ FILE UPLOAD HANDLER ============
//     const fileFields = ["logo_url", "signature_url", "photo_url", "attachment_url"];
//     for (const field of fileFields) {
//       if (body.company_info?.[field] && body.company_info[field].startsWith("data:")) {
//         const uploaded = await uploadToCloudinary(body.company_info[field]);
//         body.company_info[field] = uploaded ?? "";
//       }
//     }

//     // ============ MAP COMPANY INFO ============
//     const companyData = {
//       company_id: Number(body.company_info?.company_id || 0),
//       company_name: body.company_info?.company_name || "",
//       company_address: body.company_info?.company_address || "",
//       company_email: body.company_info?.company_email || "",
//       company_phone: body.company_info?.company_phone || "",
//       logo_url: body.company_info?.logo_url ?? "",
//       bank_name: body.company_info?.bank_name ?? "",
//       account_no: body.company_info?.account_no ?? "",
//       account_holder: body.company_info?.account_holder ?? "",
//       ifsc_code: body.company_info?.ifsc_code ?? ""
//     };

//     // ============ MAP ITEMS ============
//     const itemsData = (Array.isArray(body.items) ? body.items : []).map(item => ({
//       item_name: item.item_name || "",
//       qty: Number(item.qty || 0),
//       rate: Number(item.rate || 0),
//       tax_percent: Number(item.tax_percent || 0),
//       discount: Number(item.discount || 0),
//       amount: Number(item.amount || 0)
//     }));

//     // ============ PREPARE DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,
//       ...(steps.quotation || {}),
//       ...(steps.sales_order || {}),
//       ...(steps.delivery_challan || {}),
//       ...(steps.invoice || {}),
//       ...(steps.payment || {}),
//       customer_ref: body.additional_info?.customer_ref ?? "",
//       signature_url: body.additional_info?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? "",
//       updated_at: new Date()
//     };

//     const fixDate = d => (d ? new Date(d) : null);
//     ["quotation_date", "valid_till", "due_date", "invoice_date", "payment_date"].forEach(field => {
//       if (dbData[field]) dbData[field] = fixDate(dbData[field]);
//     });

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;
//     if (orderId) {
//       await prisma.salesorderitems.deleteMany({ where: { sales_order_id: orderId } });
//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: { ...dbData, salesorderitems: { create: itemsData } },
//         include: { salesorderitems: true }
//       });
//     } else {
//       savedOrder = await prisma.salesorder.create({
//         data: { ...dbData, created_at: new Date(), salesorderitems: { create: itemsData } },
//         include: { salesorderitems: true }
//       });
//     }

//     // ============ FORMAT RESPONSE (with DB fallback) ============
//     const response = {
//       company_info: { ...companyData, id: savedOrder.id, created_at: savedOrder.created_at, updated_at: savedOrder.updated_at },
//       items: savedOrder.salesorderitems,
//       steps: requiredSteps.map(step => ({
//         step,
//         status: steps[step]?.status ?? "pending",
//         data: {
//           ...(steps[step] || {}),
//           ...(step === "quotation" ? {
//             ref_no: savedOrder.ref_no,
//             quotation_no: savedOrder.quotation_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             subtotal: savedOrder.subtotal,
//             total: savedOrder.total,
//             draft_status: savedOrder.draft_status,
//             notes: savedOrder.notes,
//             ship_to: savedOrder.ship_to,
//             bill_to: savedOrder.bill_to
//           } : {}),
//           ...(step === "sales_order" ? {
//             SO_no: savedOrder.SO_no,
//             Manual_SO_ref: savedOrder.Manual_SO_ref,
//             sales_order_status: savedOrder.sales_order_status
//           } : {}),
//           ...(step === "delivery_challan" ? {
//             Challan_no: savedOrder.Challan_no,
//             Manual_challan_no: savedOrder.Manual_challan_no,
//             Manual_DC_no: savedOrder.Manual_DC_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone,
//             delivery_challan_status: savedOrder.delivery_challan_status
//           } : {}),
//           ...(step === "invoice" ? {
//             invoice_no: savedOrder.invoice_no,
//             Manual_invoice_no: savedOrder.Manual_invoice_no,
//             total_invoice: savedOrder.total_invoice,
//             invoice_status: savedOrder.invoice_status
//           } : {}),
//           ...(step === "payment" ? {
//             Payment_no: savedOrder.Payment_no,
//             Manual_payment_no: savedOrder.Manual_payment_no,
//             payment_details: {
//               amount_received: savedOrder.amount_received,
//               total_amount: savedOrder.total_amount,
//               payment_status: savedOrder.payment_status,
//               balance: savedOrder.balance,
//               payment_note: savedOrder.payment_note,
//               received_from: savedOrder.received_from
//             }
//           } : {})
//         }
//       })),
//       additional_info: body.additional_info ?? {}
//     };

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Sales order updated" : "Sales order created",
//       data: response
//     });

//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };
{
  /*------------------------------------------------------------------------------- */
}
{
  /*

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

// Utility: Convert to number safely


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


// Helper function to structure sales order data by steps


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
export const createSalesOrder = async (req, res) => {
  try {
    const body = { ...req.body };
    const orderId = body.id ? Number(body.id) : null;

    const steps = body.steps || {};
    const requiredSteps = ["quotation", "sales_order", "delivery_challan", "invoice", "payment"];

    // ============ FILE UPLOAD HANDLER ============
    const fileFields = ["logo_url", "signature_url", "photo_url", "attachment_url"];
    for (const field of fileFields) {
      if (body.company_info?.[field] && body.company_info[field].startsWith("data:")) {
        const uploaded = await uploadToCloudinary(body.company_info[field]);
        body.company_info[field] = uploaded ?? "";
      }
    }

    // ============ MAP COMPANY INFO ============
    const companyData = {
      company_id: Number(body.company_info?.company_id || 0),
      company_name: body.company_info?.company_name || "",
      company_address: body.company_info?.company_address || "",
      company_email: body.company_info?.company_email || "",
      company_phone: body.company_info?.company_phone || "",
      logo_url: body.company_info?.logo_url ?? "",
      bank_name: body.company_info?.bank_name ?? "",
      account_no: body.company_info?.account_no ?? "",
      account_holder: body.company_info?.account_holder ?? "",
      ifsc_code: body.company_info?.ifsc_code ?? ""
    };

    // ============ MAP ITEMS ============
    const itemsData = (Array.isArray(body.items) ? body.items : []).map(item => ({
      item_name: item.item_name || "",
      qty: Number(item.qty || 0),
      rate: Number(item.rate || 0),
      tax_percent: Number(item.tax_percent || 0),
      discount: Number(item.discount || 0),
      amount: Number(item.amount || 0)
    }));

    // ============ PREPARE DATABASE OBJECT ============
    const dbData = {
      ...companyData,
      ...(steps.quotation || {}),
      ...(steps.sales_order || {}),
      ...(steps.delivery_challan || {}),
      ...(steps.invoice || {}),
      ...(steps.payment || {}),
      customer_ref: body.additional_info?.customer_ref ?? "",
      signature_url: body.additional_info?.signature_url ?? "",
      photo_url: body.additional_info?.photo_url ?? "",
      attachment_url: body.additional_info?.attachment_url ?? "",
      updated_at: new Date()
    };

    const fixDate = d => (d ? new Date(d) : null);
    ["quotation_date", "valid_till", "due_date", "invoice_date", "payment_date"].forEach(field => {
      if (dbData[field]) dbData[field] = fixDate(dbData[field]);
    });

    // ============ CREATE OR UPDATE ============
    let savedOrder;
    if (orderId) {
      await prisma.salesorderitems.deleteMany({ where: { sales_order_id: orderId } });
      savedOrder = await prisma.salesorder.update({
        where: { id: orderId },
        data: { ...dbData, salesorderitems: { create: itemsData } },
        include: { salesorderitems: true }
      });
    } else {
      savedOrder = await prisma.salesorder.create({
        data: { ...dbData, created_at: new Date(), salesorderitems: { create: itemsData } },
        include: { salesorderitems: true }
      });
    }

    // ============ FIXED RESPONSE MERGE (IMPORTANT PART) ============
    const response = {
      company_info: {
        ...companyData,
        id: savedOrder.id,
        created_at: savedOrder.created_at,
        updated_at: savedOrder.updated_at
      },
      items: savedOrder.salesorderitems,

      steps: requiredSteps.map(step => ({
        step,
        status: steps[step]?.status ?? "pending",

        data: {
          ...(steps[step] || {}),

          ...(step === "quotation"
            ? {
                ref_no: steps.quotation?.ref_no ?? savedOrder.ref_no,
                Manual_ref_ro: steps.quotation?.Manual_ref_ro ?? savedOrder.Manual_ref_ro,
                quotation_no: steps.quotation?.quotation_no ?? savedOrder.quotation_no,
                manual_quo_no: steps.quotation?.manual_quo_no ?? savedOrder.manual_quo_no,
                quotation_date: steps.quotation?.quotation_date ?? savedOrder.quotation_date,
                valid_till: steps.quotation?.valid_till ?? savedOrder.valid_till,
                due_date: steps.quotation?.due_date ?? savedOrder.due_date,
                subtotal: steps.quotation?.subtotal ?? savedOrder.subtotal,
                tax: steps.quotation?.tax ?? savedOrder.tax,
                discount: steps.quotation?.discount ?? savedOrder.discount,
                total: steps.quotation?.total ?? savedOrder.total,
                draft_status: steps.quotation?.draft_status ?? savedOrder.draft_status,
                notes: steps.quotation?.notes ?? savedOrder.notes,
                bill_to: steps.quotation?.bill_to ?? savedOrder.bill_to,
                ship_to: steps.quotation?.ship_to ?? savedOrder.ship_to
              }
            : {}),

          ...(step === "sales_order"
            ? {
                SO_no: steps.sales_order?.SO_no ?? savedOrder.SO_no,
                Manual_SO_ref: steps.sales_order?.Manual_SO_ref ?? savedOrder.Manual_SO_ref,
                sales_order_status:
                  steps.sales_order?.sales_order_status ?? savedOrder.sales_order_status,
                bill_to: steps.sales_order?.bill_to ?? savedOrder.bill_to,
                ship_to: steps.sales_order?.ship_to ?? savedOrder.ship_to
              }
            : {}),

          ...(step === "delivery_challan"
            ? {
                Challan_no: steps.delivery_challan?.Challan_no ?? savedOrder.Challan_no,
                Manual_challan_no:
                  steps.delivery_challan?.Manual_challan_no ?? savedOrder.Manual_challan_no,
                Manual_DC_no: steps.delivery_challan?.Manual_DC_no ?? savedOrder.Manual_DC_no,
                driver_name: steps.delivery_challan?.driver_name ?? savedOrder.driver_name,
                driver_phone: steps.delivery_challan?.driver_phone ?? savedOrder.driver_phone,
                delivery_challan_status:
                  steps.delivery_challan?.delivery_challan_status ??
                  savedOrder.delivery_challan_status,
                bill_to: steps.delivery_challan?.bill_to ?? savedOrder.bill_to,
                ship_to: steps.delivery_challan?.ship_to ?? savedOrder.ship_to
              }
            : {}),

          ...(step === "invoice"
            ? {
                invoice_no: steps.invoice?.invoice_no ?? savedOrder.invoice_no,
                Manual_invoice_no:
                  steps.invoice?.Manual_invoice_no ?? savedOrder.Manual_invoice_no,
                total_invoice: steps.invoice?.total_invoice ?? savedOrder.total_invoice,
                invoice_status: steps.invoice?.invoice_status ?? savedOrder.invoice_status,
                bill_to: steps.invoice?.bill_to ?? savedOrder.bill_to,
                ship_to: steps.invoice?.ship_to ?? savedOrder.ship_to
              }
            : {}),

          ...(step === "payment"
            ? {
                Payment_no: steps.payment?.Payment_no ?? savedOrder.Payment_no,
                Manual_payment_no:
                  steps.payment?.Manual_payment_no ?? savedOrder.Manual_payment_no,
                payment_details: {
                  amount_received:
                    steps.payment?.payment_details?.amount_received ??
                    savedOrder.amount_received,
                  total_amount:
                    steps.payment?.payment_details?.total_amount ?? savedOrder.total_amount,
                  payment_status:
                    steps.payment?.payment_details?.payment_status ??
                    savedOrder.payment_status,
                  balance:
                    steps.payment?.payment_details?.balance ?? savedOrder.balance,
                  payment_note:
                    steps.payment?.payment_details?.payment_note ??
                    savedOrder.payment_note,
                  received_from:
                    steps.payment?.payment_details?.received_from ??
                    savedOrder.received_from
                }
              }
            : {})
        }
      })),

      additional_info: body.additional_info ?? {}
    };

    return res.status(200).json({
      success: true,
      message: orderId ? "Sales order updated" : "Sales order created",
      data: response
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
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

 */
}

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
// export const createOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ============ VALIDATION ============
//     // Only require company_info for new orders, not updates
//     if (!orderId && !body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory for new orders",
//       });
//     }

//     // Only require items for new orders, not updates
//     if (!orderId && (!Array.isArray(body.items) || body.items.length === 0)) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty for new orders",
//       });
//     }

//     // For updates, get existing order first
//     let existingOrder = null;
//     let existingItems = [];
//     if (orderId) {
//       existingOrder = await prisma.salesorder.findUnique({
//         where: { id: orderId },
//         include: { salesorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Sales order not found",
//         });
//       }

//       // Store existing items separately
//       existingItems = existingOrder.salesorderitems || [];
//     }

//     // ============ FILE UPLOAD HANDLER ============
//     // Handle company info file uploads only if provided
//     if (body.company_info) {
//       body.company_info = await handleFileUploads(body.company_info, [
//         "logo_url",
//       ]);
//     }

//     // Handle additional info file uploads
//     if (body.additional_info) {
//       body.additional_info = await handleFileUploads(body.additional_info, [
//         "signature_url",
//         "photo_url",
//         "attachment_url",
//       ]);
//     }

//     // ============ AUTO STATUS COMPLETE ============
//     const stepCompleted = (data, fields) =>
//       fields.every(
//         (field) =>
//           data[field] !== "" &&
//           data[field] !== null &&
//           data[field] !== undefined
//       );

//     const stepRules = {
//       quotation: ["quotation_no", "quotation_date"],
//       sales_order: ["SO_no"],
//       delivery_challan: ["challan_no"],
//       invoice: ["invoice_no", "invoice_date"],
//       payment: ["payment_no", "amount_received"],
//     };

//     // Initialize all steps with existing data for updates, or empty objects for new orders
//     const steps = {
//       quotation: orderId
//         ? {
//             // Start with existing data for updates
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             quotation_status: existingOrder.quotation_status,
//             qoutation_to_customer_name:
//               existingOrder.qoutation_to_customer_name || "",
//             qoutation_to_customer_address:
//               existingOrder.qoutation_to_customer_address || "",
//             qoutation_to_customer_email:
//               existingOrder.qoutation_to_customer_email || "",
//             qoutation_to_customer_phone:
//               existingOrder.qoutation_to_customer_phone || "",
//             notes: existingOrder.notes || "",
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       sales_order: orderId
//         ? {
//             // Start with existing data for updates
//             SO_no: existingOrder.SO_no || "",
//             manual_ref_no: existingOrder.Manual_SO_ref || "",
//             sales_order_status: existingOrder.sales_order_status,
//             bill_to_name: existingOrder.bill_to_customer_name || "",
//             bill_to_address: existingOrder.bill_to_customer_address || "",
//             bill_to_email: existingOrder.bill_to_customer_email || "",
//             bill_to_phone: existingOrder.bill_to_customer_phone || "",
//             ship_to_name: existingOrder.ship_to_customer_name || "",
//             ship_to_address: existingOrder.ship_to_customer_address || "",
//             ship_to_email: existingOrder.ship_to_customer_email || "",
//             ship_to_phone: existingOrder.ship_to_customer_phone || "",
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.sales_order || {}),
//           }
//         : body.steps?.sales_order || {},

//       delivery_challan: orderId
//         ? {
//             // Start with existing data for updates
//             challan_no: existingOrder.Challan_no || "",
//             manual_challan_no: existingOrder.Manual_challan_no || "",
//             delivery_challan_status: existingOrder.delivery_challan_status,
//             driver_name: existingOrder.driver_name || "",
//             driver_phone: existingOrder.driver_phone || "",
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.delivery_challan || {}),
//           }
//         : body.steps?.delivery_challan || {},

//       invoice: orderId
//         ? {
//             // Start with existing data for updates
//             invoice_no: existingOrder.invoice_no || "",
//             manual_invoice_no: existingOrder.Manual_invoice_no || "",
//             invoice_date: existingOrder.invoice_date,
//             due_date: existingOrder.due_date,
//             invoice_status: existingOrder.invoice_status,
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.invoice || {}),
//           }
//         : body.steps?.invoice || {},

//       payment: orderId
//         ? {
//             // Start with existing data for updates
//             payment_no: existingOrder.Payment_no || "",
//             manual_payment_no: existingOrder.Manual_payment_no || "",
//             payment_date: existingOrder.payment_date,
//             payment_status: existingOrder.payment_status,
//             amount_received: existingOrder.amount_received || 0,
//             payment_note: existingOrder.payment_note || "",
//             // Update with provided data
//             ...(body.steps?.payment || {}),
//           }
//         : body.steps?.payment || {},
//     };

//     // Determine status for each step
//     for (const step of Object.keys(steps)) {
//       const isCompleted = stepCompleted(steps[step], stepRules[step]);
//       steps[step].status = isCompleted ? "completed" : "pending";
//     }

//     // ============ MAP COMPANY INFO (only if provided) ============
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
//         }
//       : orderId
//       ? {
//           // For updates, use existing company info if not provided
//           company_id: existingOrder.company_id || 0,
//           company_name: existingOrder.company_name || "",
//           company_address: existingOrder.company_address || "",
//           company_email: existingOrder.company_email || "",
//           company_phone: existingOrder.company_phone || "",
//           logo_url: existingOrder.logo_url || "",
//           bank_name: existingOrder.bank_name || "",
//           account_no: existingOrder.account_no || "",
//           account_holder: existingOrder.account_holder || "",
//           ifsc_code: existingOrder.ifsc_code || "",
//         }
//       : {};

//     // ============ MAP ITEMS (only if provided) ============
//     const itemsData = body.items
//       ? body.items.map((item) => ({

//           item_name: item.item_name,
//           qty: Number(item.qty),
//           rate: Number(item.rate),
//           tax_percent: Number(item.tax_percent),
//           discount: Number(item.discount),
//           amount: Number(item.amount),
//         }))
//       : orderId
//       ? existingItems
//       : [];

//     // ============ PREPARE FINAL DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,

//       // Quotation data
//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date
//         ? new Date(steps.quotation.quotation_date)
//         : null,
//       valid_till: steps.quotation.valid_till
//         ? new Date(steps.quotation.valid_till)
//         : null,
//       quotation_status: steps.quotation.status,
//       qoutation_to_customer_name:
//         steps.quotation.qoutation_to_customer_name || "",
//       qoutation_to_customer_address:
//         steps.quotation.qoutation_to_customer_address || "",
//       qoutation_to_customer_email:
//         steps.quotation.qoutation_to_customer_email || "",
//       qoutation_to_customer_phone:
//         steps.quotation.qoutation_to_customer_phone || "",
//       notes: steps.quotation.notes || "",
//       terms: steps.quotation.terms_conditions || "",

//       // Sales Order data
//       SO_no: steps.sales_order.SO_no || "",
//       Manual_SO_ref: steps.sales_order.manual_ref_no || "",
//       sales_order_status: steps.sales_order.status,
//       bill_to_customer_name: steps.sales_order.bill_to_name || "",
//       bill_to_customer_address: steps.sales_order.bill_to_address || "",
//       bill_to_customer_email: steps.sales_order.bill_to_email || "",
//       bill_to_customer_phone: steps.sales_order.bill_to_phone || "",
//       ship_to_customer_name: steps.sales_order.ship_to_name || "",
//       ship_to_customer_address: steps.sales_order.ship_to_address || "",
//       ship_to_customer_email: steps.sales_order.ship_to_email || "",
//       ship_to_customer_phone: steps.sales_order.ship_to_phone || "",
//       terms: steps.sales_order.terms_conditions || "",

//       // Delivery Challan data
//       Challan_no: steps.delivery_challan.challan_no || "",
//       Manual_challan_no: steps.delivery_challan.manual_challan_no || "",
//       delivery_challan_status: steps.delivery_challan.status,
//       driver_name: steps.delivery_challan.driver_name || "",
//       driver_phone: steps.delivery_challan.driver_phone || "",
//       terms: steps.delivery_challan.terms_conditions || "",

//       // Invoice data
//       invoice_no: steps.invoice.invoice_no || "",
//       Manual_invoice_no: steps.invoice.manual_invoice_no || "",
//       invoice_date: steps.invoice.invoice_date
//         ? new Date(steps.invoice.invoice_date)
//         : null,
//       due_date: steps.invoice.due_date
//         ? new Date(steps.invoice.due_date)
//         : null,
//       invoice_status: steps.invoice.status,
//       terms: steps.invoice.terms_conditions || "",

//       // Payment data
//       Payment_no: steps.payment.payment_no || "",
//       Manual_payment_no: steps.payment.manual_payment_no || "",
//       payment_date: steps.payment.payment_date
//         ? new Date(steps.payment.payment_date)
//         : null,
//       payment_status: steps.payment.status,
//       amount_received: steps.payment.amount_received
//         ? Number(steps.payment.amount_received)
//         : 0,
//       payment_note: steps.payment.note || "",

//       // Common data
//       signature_url:
//         body.additional_info?.signature_url ??
//         (existingOrder?.signature_url || ""),
//       photo_url:
//         body.additional_info?.photo_url ?? (existingOrder?.photo_url || ""),
//       attachment_url:
//         body.additional_info?.attachment_url ??
//         (existingOrder?.attachment_url || ""),

//       updated_at: new Date(),
//     };

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;

//     if (orderId) {
//       // UPDATE
//       // Only delete and recreate items if new items are provided
//       if (body.items) {
//         await prisma.salesorderitems.deleteMany({
//           where: { sales_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           // Only include items if they are provided
//           ...(body.items && {
//             salesorderitems: {
//               create: itemsData,
//             },
//           }),
//         },
//         include: { salesorderitems: true },
//       });
//     } else {
//       // CREATE
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: {
//             create: itemsData,
//           },
//         },
//         include: { salesorderitems: true },
//       });
//     }

//     // ============ FORMAT RESPONSE ============
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at,
//       },
//       items: savedOrder.salesorderitems,
//       steps: [
//         {
//           step: "quotation",
//           status: savedOrder.quotation_status,
//           data: {
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
//             qoutation_to_customer_address:
//               savedOrder.qoutation_to_customer_address,
//             qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
//             qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
//             notes: savedOrder.notes,
//             terms_conditions: savedOrder.terms,
//           },
//         },
//         {
//           step: "sales_order",
//           status: savedOrder.sales_order_status,
//           data: {
//             SO_no: savedOrder.SO_no,
//             manual_ref_no: savedOrder.Manual_SO_ref,
//             bill_to_name: savedOrder.bill_to_customer_name,
//             bill_to_address: savedOrder.bill_to_customer_address,
//             bill_to_email: savedOrder.bill_to_customer_email,
//             bill_to_phone: savedOrder.bill_to_customer_phone,
//             ship_to_name: savedOrder.ship_to_customer_name,
//             ship_to_address: savedOrder.ship_to_customer_address,
//             ship_to_email: savedOrder.ship_to_customer_email,
//             ship_to_phone: savedOrder.ship_to_customer_phone,
//             terms_conditions: savedOrder.terms,
//           },
//         },
//         {
//           step: "delivery_challan",
//           status: savedOrder.delivery_challan_status,
//           data: {
//             challan_no: savedOrder.Challan_no,
//             manual_challan_no: savedOrder.Manual_challan_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone,
//             terms_conditions: savedOrder.terms,
//           },
//         },
//         {
//           step: "invoice",
//           status: savedOrder.invoice_status,
//           data: {
//             invoice_no: savedOrder.invoice_no,
//             manual_invoice_no: savedOrder.Manual_invoice_no,
//             invoice_date: savedOrder.invoice_date,
//             due_date: savedOrder.due_date,
//             terms_conditions: savedOrder.terms,
//           },
//         },
//         {
//           step: "payment",
//           status: savedOrder.payment_status,
//           data: {
//             payment_no: savedOrder.Payment_no,
//             manual_payment_no: savedOrder.Manual_payment_no,
//             payment_date: savedOrder.payment_date,
//             amount_received: savedOrder.amount_received,
//             note: savedOrder.payment_note,
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
//       message: orderId ? "Sales order updated" : "Sales order created",
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

// export const createOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ============ VALIDATION ============
//     // Only require company_info for new orders, not updates
//     if (!orderId && !body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory for new orders",
//       });
//     }

//     // Only require items for new orders, not updates
//     if (!orderId && (!Array.isArray(body.items) || body.items.length === 0)) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty for new orders",
//       });
//     }

//     // For updates, get existing order first
//     let existingOrder = null;
//     let existingItems = [];
//     if (orderId) {
//       existingOrder = await prisma.salesorder.findUnique({
//         where: { id: orderId },
//         include: { salesorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Sales order not found",
//         });
//       }

//       // Store existing items separately
//       existingItems = existingOrder.salesorderitems || [];
//     }

//     // ============ FILE UPLOAD HANDLER ============
//     // Handle company info file uploads only if provided
//     if (body.company_info) {
//       body.company_info = await handleFileUploads(body.company_info, [
//         "logo_url",
//       ]);
//     }

//     // Handle additional info file uploads
//     if (body.additional_info) {
//       body.additional_info = await handleFileUploads(body.additional_info, [
//         "signature_url",
//         "photo_url",
//         "attachment_url",
//       ]);
//     }

//     // ============ AUTO STATUS COMPLETE ============
//     const stepCompleted = (data, fields) =>
//       fields.every(
//         (field) =>
//           data[field] !== "" &&
//           data[field] !== null &&
//           data[field] !== undefined
//       );

//     const stepRules = {
//       quotation: ["quotation_no", "quotation_date"],
//       sales_order: ["SO_no"],
//       delivery_challan: ["challan_no"],
//       invoice: ["invoice_no", "invoice_date"],
//       payment: ["payment_no", "amount_received"],
//     };

//     // Initialize all steps with existing data for updates, or empty objects for new orders
//     const steps = {
//       quotation: orderId
//         ? {
//             // Start with existing data for updates
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             quotation_status: existingOrder.quotation_status,
//             qoutation_to_customer_name:
//               existingOrder.qoutation_to_customer_name || "",
//             qoutation_to_customer_address:
//               existingOrder.qoutation_to_customer_address || "",
//             qoutation_to_customer_email:
//               existingOrder.qoutation_to_customer_email || "",
//             qoutation_to_customer_phone:
//               existingOrder.qoutation_to_customer_phone || "",
//             notes: existingOrder.notes || "",
//             // Update with provided data
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       sales_order: orderId
//         ? {
//             // Start with existing data for updates
//             SO_no: existingOrder.SO_no || "",
//             manual_ref_no: existingOrder.Manual_SO_ref || "",
//             sales_order_status: existingOrder.sales_order_status,
//             bill_to_name: existingOrder.bill_to_customer_name || "",
//             bill_to_address: existingOrder.bill_to_customer_address || "",
//             bill_to_email: existingOrder.bill_to_customer_email || "",
//             bill_to_phone: existingOrder.bill_to_customer_phone || "",
//             ship_to_name: existingOrder.ship_to_customer_name || "",
//             ship_to_address: existingOrder.ship_to_customer_address || "",
//             ship_to_email: existingOrder.ship_to_customer_email || "",
//             ship_to_phone: existingOrder.ship_to_customer_phone || "",
//             // Update with provided data
//             ...(body.steps?.sales_order || {}),
//           }
//         : body.steps?.sales_order || {},

//       delivery_challan: orderId
//         ? {
//             // Start with existing data for updates
//             challan_no: existingOrder.Challan_no || "",
//             manual_challan_no: existingOrder.Manual_challan_no || "",
//             delivery_challan_status: existingOrder.delivery_challan_status,
//             driver_name: existingOrder.driver_name || "",
//             driver_phone: existingOrder.driver_phone || "",
//             // Update with provided data
//             ...(body.steps?.delivery_challan || {}),
//           }
//         : body.steps?.delivery_challan || {},

//       invoice: orderId
//         ? {
//             // Start with existing data for updates
//             invoice_no: existingOrder.invoice_no || "",
//             manual_invoice_no: existingOrder.Manual_invoice_no || "",
//             invoice_date: existingOrder.invoice_date,
//             due_date: existingOrder.due_date,
//             invoice_status: existingOrder.invoice_status,
//             // Update with provided data
//             ...(body.steps?.invoice || {}),
//           }
//         : body.steps?.invoice || {},

//       payment: orderId
//         ? {
//             // Start with existing data for updates
//             payment_no: existingOrder.Payment_no || "",
//             manual_payment_no: existingOrder.Manual_payment_no || "",
//             payment_date: existingOrder.payment_date,
//             payment_status: existingOrder.payment_status,
//             amount_received: existingOrder.amount_received || 0,
//             payment_note: existingOrder.payment_note || "",
//             // Update with provided data
//             ...(body.steps?.payment || {}),
//           }
//         : body.steps?.payment || {},
//     };

//     // Determine status for each step
//     for (const step of Object.keys(steps)) {
//       const isCompleted = stepCompleted(steps[step], stepRules[step]);
//       steps[step].status = isCompleted ? "completed" : "pending";
//     }

//     // ============ MAP COMPANY INFO (only if provided) ============
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
//           terms: body.company_info.terms ?? "", // Added terms field to company info
//         }
//       : orderId
//       ? {
//           // For updates, use existing company info if not provided
//           company_id: existingOrder.company_id || 0,
//           company_name: existingOrder.company_name || "",
//           company_address: existingOrder.company_address || "",
//           company_email: existingOrder.company_email || "",
//           company_phone: existingOrder.company_phone || "",
//           logo_url: existingOrder.logo_url || "",
//           bank_name: existingOrder.bank_name || "",
//           account_no: existingOrder.account_no || "",
//           account_holder: existingOrder.account_holder || "",
//           ifsc_code: existingOrder.ifsc_code || "",
//           terms: existingOrder.terms || "", // Added terms field to company info
//         }
//       : {};

//     // ============ MAP ITEMS (only if provided) ============
//     const itemsData = body.items
//       ? body.items.map((item) => ({

//           item_name: item.item_name,
//           qty: Number(item.qty),
//           rate: Number(item.rate),
//           tax_percent: Number(item.tax_percent),
//           discount: Number(item.discount),
//           amount: Number(item.amount),
//         }))
//       : orderId
//       ? existingItems
//       : [];

//     // ============ PREPARE FINAL DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,

//       // Quotation data
//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date
//         ? new Date(steps.quotation.quotation_date)
//         : null,
//       valid_till: steps.quotation.valid_till
//         ? new Date(steps.quotation.valid_till)
//         : null,
//       quotation_status: steps.quotation.status,
//       qoutation_to_customer_name:
//         steps.quotation.qoutation_to_customer_name || "",
//       qoutation_to_customer_address:
//         steps.quotation.qoutation_to_customer_address || "",
//       qoutation_to_customer_email:
//         steps.quotation.qoutation_to_customer_email || "",
//       qoutation_to_customer_phone:
//         steps.quotation.qoutation_to_customer_phone || "",
//       notes: steps.quotation.notes || "",

//       // Sales Order data
//       SO_no: steps.sales_order.SO_no || "",
//       Manual_SO_ref: steps.sales_order.manual_ref_no || "",
//       sales_order_status: steps.sales_order.status,
//       bill_to_customer_name: steps.sales_order.bill_to_name || "",
//       bill_to_customer_address: steps.sales_order.bill_to_address || "",
//       bill_to_customer_email: steps.sales_order.bill_to_email || "",
//       bill_to_customer_phone: steps.sales_order.bill_to_phone || "",
//       ship_to_customer_name: steps.sales_order.ship_to_name || "",
//       ship_to_customer_address: steps.sales_order.ship_to_address || "",
//       ship_to_customer_email: steps.sales_order.ship_to_email || "",
//       ship_to_customer_phone: steps.sales_order.ship_to_phone || "",

//       // Delivery Challan data
//       Challan_no: steps.delivery_challan.challan_no || "",
//       Manual_challan_no: steps.delivery_challan.manual_challan_no || "",
//       delivery_challan_status: steps.delivery_challan.status,
//       driver_name: steps.delivery_challan.driver_name || "",
//       driver_phone: steps.delivery_challan.driver_phone || "",

//       // Invoice data
//       invoice_no: steps.invoice.invoice_no || "",
//       Manual_invoice_no: steps.invoice.manual_invoice_no || "",
//       invoice_date: steps.invoice.invoice_date
//         ? new Date(steps.invoice.invoice_date)
//         : null,
//       due_date: steps.invoice.due_date
//         ? new Date(steps.invoice.due_date)
//         : null,
//       invoice_status: steps.invoice.status,

//       // Payment data
//       Payment_no: steps.payment.payment_no || "",
//       Manual_payment_no: steps.payment.manual_payment_no || "",
//       payment_date: steps.payment.payment_date
//         ? new Date(steps.payment.payment_date)
//         : null,
//       payment_status: steps.payment.status,
//       amount_received: steps.payment.amount_received
//         ? Number(steps.payment.amount_received)
//         : 0,
//       payment_note: steps.payment.note || "",

//       // Common data
//       signature_url:
//         body.additional_info?.signature_url ??
//         (existingOrder?.signature_url || ""),
//       photo_url:
//         body.additional_info?.photo_url ?? (existingOrder?.photo_url || ""),
//       attachment_url:
//         body.additional_info?.attachment_url ??
//         (existingOrder?.attachment_url || ""),

//       updated_at: new Date(),
//     };

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;

//     if (orderId) {
//       // UPDATE
//       // Only delete and recreate items if new items are provided
//       if (body.items) {
//         await prisma.salesorderitems.deleteMany({
//           where: { sales_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           // Only include items if they are provided
//           ...(body.items && {
//             salesorderitems: {
//               create: itemsData,
//             },
//           }),
//         },
//         include: { salesorderitems: true },
//       });
//     } else {
//       // CREATE
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: {
//             create: itemsData,
//           },
//         },
//         include: { salesorderitems: true },
//       });
//     }

//     // ============ FORMAT RESPONSE ============
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at,
//         terms: savedOrder.terms, // Added terms field to company info in response
//       },
//       items: savedOrder.salesorderitems,
//       steps: [
//         {
//           step: "quotation",
//           status: savedOrder.quotation_status,
//           data: {
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
//             qoutation_to_customer_address:
//               savedOrder.qoutation_to_customer_address,
//             qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
//             qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
//             notes: savedOrder.notes,
//             // Removed terms_conditions from here as it's now in company info
//           },
//         },
//         {
//           step: "sales_order",
//           status: savedOrder.sales_order_status,
//           data: {
//             SO_no: savedOrder.SO_no,
//             manual_ref_no: savedOrder.Manual_SO_ref,
//             bill_to_name: savedOrder.bill_to_customer_name,
//             bill_to_address: savedOrder.bill_to_customer_address,
//             bill_to_email: savedOrder.bill_to_customer_email,
//             bill_to_phone: savedOrder.bill_to_customer_phone,
//             ship_to_name: savedOrder.ship_to_customer_name,
//             ship_to_address: savedOrder.ship_to_customer_address,
//             ship_to_email: savedOrder.ship_to_customer_email,
//             ship_to_phone: savedOrder.ship_to_customer_phone,
//             // Removed terms_conditions from here as it's now in company info
//           },
//         },
//         {
//           step: "delivery_challan",
//           status: savedOrder.delivery_challan_status,
//           data: {
//             challan_no: savedOrder.Challan_no,
//             manual_challan_no: savedOrder.Manual_challan_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone,
//             // Removed terms_conditions from here as it's now in company info
//           },
//         },
//         {
//           step: "invoice",
//           status: savedOrder.invoice_status,
//           data: {
//             invoice_no: savedOrder.invoice_no,
//             manual_invoice_no: savedOrder.Manual_invoice_no,
//             invoice_date: savedOrder.invoice_date,
//             due_date: savedOrder.due_date,
//             // Removed terms_conditions from here as it's now in company info
//           },
//         },
//         {
//           step: "payment",
//           status: savedOrder.payment_status,
//           data: {
//             payment_no: savedOrder.Payment_no,
//             manual_payment_no: savedOrder.Manual_payment_no,
//             payment_date: savedOrder.payment_date,
//             amount_received: savedOrder.amount_received,
//             note: savedOrder.payment_note,
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
//       message: orderId ? "Sales order updated" : "Sales order created",
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

// export const createOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ============ VALIDATION ============
//     // Only require company_info for new orders, not updates
//     if (!orderId && !body.company_info) {
//       return res.status(400).json({
//         success: false,
//         message: "company_info is mandatory for new orders",
//       });
//     }

//     // Only require items for new orders, not updates
//     if (!orderId && (!Array.isArray(body.items) || body.items.length === 0)) {
//       return res.status(400).json({
//         success: false,
//         message: "items must be provided and not empty for new orders",
//       });
//     }

//     // For updates, get existing order first
//     let existingOrder = null;
//     let existingItems = [];
//     if (orderId) {
//       existingOrder = await prisma.salesorder.findUnique({
//         where: { id: orderId },
//         include: { salesorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Sales order not found",
//         });
//       }

//       // Store existing items separately
//       existingItems = existingOrder.salesorderitems || [];
//     }

//     // ============ FILE UPLOAD HANDLER ============
//     // Handle company info file uploads only if provided
//     if (body.company_info) {
//       body.company_info = await handleFileUploads(body.company_info, [
//         "logo_url",
//       ]);
//     }

//     // Handle additional info file uploads
//     if (body.additional_info) {
//       body.additional_info = await handleFileUploads(body.additional_info, [
//         "signature_url",
//         "photo_url",
//         "attachment_url",
//       ]);
//     }

//     // ============ AUTO STATUS COMPLETE ============
//     const stepCompleted = (data, fields) =>
//       fields.every(
//         (field) =>
//           data[field] !== "" &&
//           data[field] !== null &&
//           data[field] !== undefined
//       );

//     const stepRules = {
//       quotation: ["quotation_no", "quotation_date"],
//       sales_order: ["SO_no"],
//       delivery_challan: ["challan_no"],
//       invoice: ["invoice_no", "invoice_date"],
//       payment: ["payment_no", "amount_received"],
//     };

//     // Initialize all steps with existing data for updates, or empty objects for new orders
//     const steps = {
//       quotation: orderId
//         ? {
//             // Start with existing data for updates
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             quotation_status: existingOrder.quotation_status,
//             qoutation_to_customer_name:
//               existingOrder.qoutation_to_customer_name || "",
//             qoutation_to_customer_address:
//               existingOrder.qoutation_to_customer_address || "",
//             qoutation_to_customer_email:
//               existingOrder.qoutation_to_customer_email || "",
//             qoutation_to_customer_phone:
//               existingOrder.qoutation_to_customer_phone || "",
//             notes: existingOrder.notes || "",
//             terms_conditions: existingOrder.terms || "",
//             customer_ref: existingOrder.customer_ref || "", // Added customer_ref field
//             // Update with provided data
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       sales_order: orderId
//         ? {
//             // Start with existing data for updates
//             SO_no: existingOrder.SO_no || "",
//             manual_ref_no: existingOrder.Manual_SO_ref || "",
//             manual_quo_no: existingOrder.manual_quo_no || "", // Added manual_quo_no field
//             sales_order_status: existingOrder.sales_order_status,
//             bill_to_name: existingOrder.bill_to_customer_name || "",
//             bill_to_address: existingOrder.bill_to_customer_address || "",
//             bill_to_email: existingOrder.bill_to_customer_email || "",
//             bill_to_phone: existingOrder.bill_to_customer_phone || "",
//             ship_to_name: existingOrder.ship_to_customer_name || "",
//             ship_to_address: existingOrder.ship_to_customer_address || "",
//             ship_to_email: existingOrder.ship_to_customer_email || "",
//             ship_to_phone: existingOrder.ship_to_customer_phone || "",
//             bill_to_attention_name: existingOrder.bill_to_attention_name || "", // Added bill_to_attention_name field
//             ship_to_attention_name: existingOrder.ship_to_attention_name || "", // Added ship_to_attention_name field
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.sales_order || {}),
//           }
//         : body.steps?.sales_order || {},

//       delivery_challan: orderId
//         ? {
//             // Start with existing data for updates
//             challan_no: existingOrder.Challan_no || "",
//             manual_challan_no: existingOrder.Manual_challan_no || "",
//             delivery_challan_status: existingOrder.delivery_challan_status,
//             driver_name: existingOrder.driver_name || "",
//             driver_phone: existingOrder.driver_phone || "",
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.delivery_challan || {}),
//           }
//         : body.steps?.delivery_challan || {},

//       invoice: orderId
//         ? {
//             // Start with existing data for updates
//             invoice_no: existingOrder.invoice_no || "",
//             manual_invoice_no: existingOrder.Manual_invoice_no || "",
//             invoice_date: existingOrder.invoice_date,
//             due_date: existingOrder.due_date,
//             invoice_status: existingOrder.invoice_status,
//             terms_conditions: existingOrder.terms || "",
//             // Update with provided data
//             ...(body.steps?.invoice || {}),
//           }
//         : body.steps?.invoice || {},

//       payment: orderId
//         ? {
//             // Start with existing data for updates
//             payment_no: existingOrder.Payment_no || "",
//             manual_payment_no: existingOrder.Manual_payment_no || "",
//             payment_date: existingOrder.payment_date,
//             payment_status: existingOrder.payment_status,
//             amount_received: existingOrder.amount_received || 0,
//             payment_note: existingOrder.payment_note || "",
//             // Update with provided data
//             ...(body.steps?.payment || {}),
//           }
//         : body.steps?.payment || {},
//     };

//     // Determine status for each step
//     for (const step of Object.keys(steps)) {
//       const isCompleted = stepCompleted(steps[step], stepRules[step]);
//       steps[step].status = isCompleted ? "completed" : "pending";
//     }

//     // ============ MAP COMPANY INFO (only if provided) ============
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
//           terms: body.company_info.terms ?? "", // Added terms field to company info
//         }
//       : orderId
//       ? {
//           // For updates, use existing company info if not provided
//           company_id: existingOrder.company_id || 0,
//           company_name: existingOrder.company_name || "",
//           company_address: existingOrder.company_address || "",
//           company_email: existingOrder.company_email || "",
//           company_phone: existingOrder.company_phone || "",
//           logo_url: existingOrder.logo_url || "",
//           bank_name: existingOrder.bank_name || "",
//           account_no: existingOrder.account_no || "",
//           account_holder: existingOrder.account_holder || "",
//           ifsc_code: existingOrder.ifsc_code || "",
//           terms: existingOrder.terms || "", // Added terms field to company info
//         }
//       : {};

//     // ============ MAP ITEMS (only if provided) ============
//     const itemsData = body.items
//       ? body.items.map((item) => ({

//           item_name: item.item_name,
//           qty: Number(item.qty),
//           rate: Number(item.rate),
//           tax_percent: Number(item.tax_percent),
//           discount: Number(item.discount),
//           amount: Number(item.amount),
//         }))
//       : orderId
//       ? existingItems
//       : [];

//     // ============ PREPARE FINAL DATABASE OBJECT ============
//     const dbData = {
//       ...companyData,

//       // Quotation data
//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date
//         ? new Date(steps.quotation.quotation_date)
//         : null,
//       valid_till: steps.quotation.valid_till
//         ? new Date(steps.quotation.valid_till)
//         : null,
//       quotation_status: steps.quotation.status,
//       qoutation_to_customer_name:
//         steps.quotation.qoutation_to_customer_name || "",
//       qoutation_to_customer_address:
//         steps.quotation.qoutation_to_customer_address || "",
//       qoutation_to_customer_email:
//         steps.quotation.qoutation_to_customer_email || "",
//       qoutation_to_customer_phone:
//         steps.quotation.qoutation_to_customer_phone || "",
//       notes: steps.quotation.notes || "",
//       terms: steps.quotation.terms_conditions || "", // Moved terms_conditions to company info
//       customer_ref: steps.quotation.customer_ref || "", // Added customer_ref field

//       // Sales Order data
//       SO_no: steps.sales_order.SO_no || "",
//       Manual_SO_ref: steps.sales_order.manual_ref_no || "",
//       manual_quo_no: steps.sales_order.manual_quo_no || "", // Added manual_quo_no field
//       sales_order_status: steps.sales_order.status,
//       bill_to_customer_name: steps.sales_order.bill_to_name || "",
//       bill_to_customer_address: steps.sales_order.bill_to_address || "",
//       bill_to_customer_email: steps.sales_order.bill_to_customer_email || "",
//       bill_to_customer_phone: steps.sales_order.bill_to_customer_phone || "",
//       ship_to_customer_name: steps.sales_order.ship_to_name || "",
//       ship_to_customer_address: steps.sales_order.ship_to_customer_address || "",
//       ship_to_customer_email: steps.sales_order.ship_to_customer_email || "",
//       ship_to_customer_phone: steps.sales_order.ship_to_customer_phone || "",
//       bill_to_attention_name: steps.sales_order.bill_to_attention_name || "", // Added bill_to_attention_name field
//       ship_to_attention_name: steps.sales_order.ship_to_attention_name || "", // Added ship_to_attention_name field
//       terms: steps.sales_order.terms_conditions || "", // Moved terms_conditions to company info

//       // Delivery Challan data
//       Challan_no: steps.delivery_challan.challan_no || "",
//       Manual_challan_no: steps.delivery_challan.manual_challan_no || "",
//       delivery_challan_status: steps.delivery_challan.status,
//       driver_name: steps.delivery_challan.driver_name || "",
//       driver_phone: steps.delivery_challan.driver_phone || "",
//       terms: steps.delivery_challan.terms_conditions || "", // Moved terms_conditions to company info

//       // Invoice data
//       invoice_no: steps.invoice.invoice_no || "",
//       Manual_invoice_no: steps.invoice.manual_invoice_no || "",
//       invoice_date: steps.invoice.invoice_date
//         ? new Date(steps.invoice.invoice_date)
//         : null,
//       due_date: steps.invoice.due_date
//         ? new Date(steps.invoice.due_date)
//         : null,
//       invoice_status: steps.invoice.status,
//       terms: steps.invoice.terms_conditions || "", // Moved terms_conditions to company info

//       // Payment data
//       Payment_no: steps.payment.payment_no || "",
//       Manual_payment_no: steps.payment.manual_payment_no || "",
//       payment_date: steps.payment.payment_date
//         ? new Date(steps.payment.payment_date)
//         : null,
//       payment_status: steps.payment.status,
//       amount_received: steps.payment.amount_received
//         ? Number(steps.payment.amount_received)
//         : 0,
//       payment_note: steps.payment.note || "",

//       // Common data
//       signature_url:
//         body.additional_info?.signature_url ??
//         (existingOrder?.signature_url || ""),
//       photo_url:
//         body.additional_info?.photo_url ?? (existingOrder?.photo_url || ""),
//       attachment_url:
//         body.additional_info?.attachment_url ??
//         (existingOrder?.attachment_url || ""),

//       updated_at: new Date(),
//     };

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;

//     if (orderId) {
//       // UPDATE
//       // Only delete and recreate items if new items are provided
//       if (body.items) {
//         await prisma.salesorderitems.deleteMany({
//           where: { sales_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           // Only include items if they are provided
//           ...(body.items && {
//             salesorderitems: {
//               create: itemsData,
//             },
//           }),
//         },
//         include: { salesorderitems: true },
//       });
//     } else {
//       // CREATE
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: {
//             create: itemsData,
//           },
//         },
//         include: { salesorderitems: true },
//       });
//     }

//     // ============ FORMAT RESPONSE ============
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at,
//         terms: savedOrder.terms, // Added terms field to company info in response
//       },
//       items: savedOrder.salesorderitems,
//       steps: [
//         {
//           step: "quotation",
//           status: savedOrder.quotation_status,
//           data: {
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
//             qoutation_to_customer_address:
//               savedOrder.qoutation_to_customer_address,
//             qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
//             qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
//             notes: savedOrder.notes,
//             customer_ref: savedOrder.customer_ref // Added customer_ref field
//           },
//         },
//         {
//           step: "sales_order",
//           status: savedOrder.sales_order_status,
//           data: {
//             SO_no: savedOrder.SO_no,
//             manual_ref_no: savedOrder.Manual_SO_ref,
//             manual_quo_no: savedOrder.manual_quo_no, // Added manual_quo_no field
//             bill_to_name: savedOrder.bill_to_customer_name,
//             bill_to_address: savedOrder.bill_to_customer_address,
//             bill_to_email: savedOrder.bill_to_customer_email,
//             bill_to_phone: savedOrder.bill_to_customer_phone,
//             ship_to_name: savedOrder.ship_to_customer_name,
//             ship_to_address: savedOrder.ship_to_customer_address,
//             ship_to_email: savedOrder.ship_to_customer_email,
//             ship_to_phone: savedOrder.ship_to_customer_phone,
//             bill_to_attention_name: savedOrder.bill_to_attention_name, // Added bill_to_attention_name field
//             ship_to_attention_name: savedOrder.ship_to_attention_name // Added ship_to_attention_name field
//           },
//         },
//         {
//           step: "delivery_challan",
//           status: savedOrder.delivery_challan_status,
//           data: {
//             challan_no: savedOrder.Challan_no,
//             manual_challan_no: savedOrder.Manual_challan_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone
//           },
//         },
//         {
//           step: "invoice",
//           status: savedOrder.invoice_status,
//           data: {
//             invoice_no: savedOrder.invoice_no,
//             manual_invoice_no: savedOrder.Manual_invoice_no,
//             invoice_date: savedOrder.invoice_date,
//             due_date: savedOrder.due_date
//           },
//         },
//         {
//           step: "payment",
//           status: savedOrder.payment_status,
//           data: {
//             payment_no: savedOrder.Payment_no,
//             manual_payment_no: savedOrder.Manual_payment_no,
//             payment_date: savedOrder.payment_date,
//             amount_received: savedOrder.amount_received,
//             note: savedOrder.payment_note
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
//       message: orderId ? "Sales order updated" : "Sales order created",
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

// export const createOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ============ VALIDATION ============
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
//       existingOrder = await prisma.salesorder.findUnique({
//         where: { id: orderId },
//         include: { salesorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Sales order not found",
//         });
//       }

//       existingItems = existingOrder.salesorderitems || [];
//     }

//     // ============ FILE UPLOAD HANDLER ============
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

//     // ============ STEP COMPLETION RULES ============
//     const stepCompleted = (data, fields) =>
//       fields.every((field) => data[field] !== "" && data[field] !== null && data[field] !== undefined);

//     const stepRules = {
//       quotation: ["quotation_no", "quotation_date"],
//       sales_order: ["SO_no"],
//       delivery_challan: ["challan_no"],
//       invoice: ["invoice_no", "invoice_date"],
//       payment: ["payment_no", "amount_received"],
//     };

//     // ============ MERGE STEPS ============
//     const steps = {
//       quotation: orderId
//         ? {
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             qoutation_to_customer_name: existingOrder.qoutation_to_customer_name || "",
//             qoutation_to_customer_address: existingOrder.qoutation_to_customer_address || "",
//             qoutation_to_customer_email: existingOrder.qoutation_to_customer_email || "",
//             qoutation_to_customer_phone: existingOrder.qoutation_to_customer_phone || "",
//             notes: existingOrder.notes || "",
//             customer_ref: existingOrder.customer_ref || "",
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       sales_order: orderId
//         ? {
//             SO_no: existingOrder.SO_no || "",
//             manual_ref_no: existingOrder.Manual_SO_ref || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             sales_order_status: existingOrder.sales_order_status,

//             bill_to_name: existingOrder.bill_to_company_name || "",
//             bill_to_address: existingOrder.bill_to_company_address || "",
//             bill_to_email: existingOrder.bill_to_company_email || "",
//             bill_to_phone: existingOrder.bill_to_company_phone || "",
//             bill_to_attention_name: existingOrder.bill_to_attention_name || "",

//             ship_to_name: existingOrder.ship_to_company_name || "",
//             ship_to_address: existingOrder.ship_to_company_address || "",
//             ship_to_email: existingOrder.ship_to_company_email || "",
//             ship_to_phone: existingOrder.ship_to_company_phone || "",
//             ship_to_attention_name: existingOrder.ship_to_attention_name || "",

//             ...(body.steps?.sales_order || {}),
//           }
//         : body.steps?.sales_order || {},

//       delivery_challan: orderId
//         ? {
//             challan_no: existingOrder.Challan_no || "",
//             manual_challan_no: existingOrder.Manual_challan_no || "",
//             driver_name: existingOrder.driver_name || "",
//             driver_phone: existingOrder.driver_phone || "",
//             ...(body.steps?.delivery_challan || {}),
//           }
//         : body.steps?.delivery_challan || {},

//       invoice: orderId
//         ? {
//             invoice_no: existingOrder.invoice_no || "",
//             manual_invoice_no: existingOrder.Manual_invoice_no || "",
//             invoice_date: existingOrder.invoice_date,
//             due_date: existingOrder.due_date,
//             ...(body.steps?.invoice || {}),
//           }
//         : body.steps?.invoice || {},

//       payment: orderId
//         ? {
//             payment_no: existingOrder.Payment_no || "",
//             manual_payment_no: existingOrder.Manual_payment_no || "",
//             payment_date: existingOrder.payment_date,
//             amount_received: existingOrder.amount_received || 0,
//             payment_note: existingOrder.payment_note || "",
//             ...(body.steps?.payment || {}),
//           }
//         : body.steps?.payment || {},
//     };

//     for (const step of Object.keys(steps)) {
//       steps[step].status = stepCompleted(steps[step], stepRules[step]) ? "completed" : "pending";
//     }

//     // ============ COMPANY INFO ============
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

//     // ============ ITEMS (UPDATED WITH warehouse_id) ============
//     const itemsData = body.items
//       ? body.items.map((item) => ({
//           item_name: item.item_name,
//           qty: Number(item.qty),
//           rate: Number(item.rate),
//           tax_percent: Number(item.tax_percent),
//           discount: Number(item.discount),
//           amount: Number(item.amount),
//           warehouse_id: item.warehouse_id ? Number(item.warehouse_id) : null,  // ✅ ADDED
//         }))
//       : orderId
//       ? existingItems
//       : [];

//     // ============ DB PAYLOAD ============
//     const dbData = {
//       ...companyData,

//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date ? new Date(steps.quotation.quotation_date) : null,
//       valid_till: steps.quotation.valid_till ? new Date(steps.quotation.valid_till) : null,
//       quotation_status: steps.quotation.status,
//       qoutation_to_customer_name: steps.quotation.qoutation_to_customer_name || "",
//       qoutation_to_customer_address: steps.quotation.qoutation_to_customer_address || "",
//       qoutation_to_customer_email: steps.quotation.qoutation_to_customer_email || "",
//       qoutation_to_customer_phone: steps.quotation.qoutation_to_customer_phone || "",
//       notes: steps.quotation.notes || "",
//       customer_ref: steps.quotation.customer_ref || "",

//       SO_no: steps.sales_order.SO_no || "",
//       Manual_SO_ref: steps.sales_order.manual_ref_no || "",
//       manual_quo_no: steps.sales_order.manual_quo_no || "",
//       sales_order_status: steps.sales_order.status,

//       bill_to_company_name: steps.sales_order.bill_to_name || "",
//       bill_to_company_address: steps.sales_order.bill_to_address || "",
//       bill_to_company_email: steps.sales_order.bill_to_email || "",
//       bill_to_company_phone: steps.sales_order.bill_to_phone || "",
//       bill_to_attention_name: steps.sales_order.bill_to_attention_name || "",

//       ship_to_company_name: steps.sales_order.ship_to_name || "",
//       ship_to_company_address: steps.sales_order.ship_to_address || "",
//       ship_to_company_email: steps.sales_order.ship_to_email || "",
//       ship_to_company_phone: steps.sales_order.ship_to_phone || "",
//       ship_to_attention_name: steps.sales_order.ship_to_attention_name || "",

//       Challan_no: steps.delivery_challan.challan_no || "",
//       Manual_challan_no: steps.delivery_challan.manual_challan_no || "",
//       delivery_challan_status: steps.delivery_challan.status,
//       driver_name: steps.delivery_challan.driver_name || "",
//       driver_phone: steps.delivery_challan.driver_phone || "",

//       invoice_no: steps.invoice.invoice_no || "",
//       Manual_invoice_no: steps.invoice.manual_invoice_no || "",
//       invoice_date: steps.invoice.invoice_date ? new Date(steps.invoice.invoice_date) : null,
//       due_date: steps.invoice.due_date ? new Date(steps.invoice.due_date) : null,
//       invoice_status: steps.invoice.status,

//       Payment_no: steps.payment.payment_no || "",
//       Manual_payment_no: steps.payment.manual_payment_no || "",
//       payment_date: steps.payment.payment_date ? new Date(steps.payment.payment_date) : null,
//       payment_status: steps.payment.status,
//       amount_received: Number(steps.payment.amount_received) || 0,
//       payment_note: steps.payment.payment_note || "",

//       signature_url: body.additional_info?.signature_url ?? existingOrder?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? existingOrder?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? existingOrder?.attachment_url ?? "",

//       updated_at: new Date(),
//     };

//     // ============ CREATE OR UPDATE ============
//     let savedOrder;

//     if (orderId) {
//       if (body.items) {
//         await prisma.salesorderitems.deleteMany({
//           where: { sales_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           ...(body.items && { salesorderitems: { create: itemsData } }),
//         },
//         include: { salesorderitems: true },
//       });
//     } else {
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: { create: itemsData },
//         },
//         include: { salesorderitems: true },
//       });
//     }

//     // ============ RESPONSE ============
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at,
//         terms: savedOrder.terms,
//       },
//       items: savedOrder.salesorderitems,
//       steps: [
//         {
//           step: "quotation",
//           status: savedOrder.quotation_status,
//           data: {
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
//             qoutation_to_customer_address: savedOrder.qoutation_to_customer_address,
//             qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
//             qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
//             notes: savedOrder.notes,
//             customer_ref: savedOrder.customer_ref,
//           },
//         },
//         {
//           step: "sales_order",
//           status: savedOrder.sales_order_status,
//           data: {
//             SO_no: savedOrder.SO_no,
//             manual_ref_no: savedOrder.Manual_SO_ref,
//             manual_quo_no: savedOrder.manual_quo_no,

//           },
//         },
//         {
//           step: "delivery_challan",
//           status: savedOrder.delivery_challan_status,
//           data: {
//             challan_no: savedOrder.Challan_no,
//             manual_challan_no: savedOrder.Manual_challan_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone,
//           },
//         },
//         {
//           step: "invoice",
//           status: savedOrder.invoice_status,
//           data: {
//             invoice_no: savedOrder.invoice_no,
//             manual_invoice_no: savedOrder.Manual_invoice_no,
//             invoice_date: savedOrder.invoice_date,
//             due_date: savedOrder.due_date,
//           },
//         },
//         {
//           step: "payment",
//           status: savedOrder.payment_status,
//           data: {
//             payment_no: savedOrder.Payment_no,
//             manual_payment_no: savedOrder.Manual_payment_no,
//             payment_date: savedOrder.payment_date,
//             amount_received: savedOrder.amount_received,
//             note: savedOrder.payment_note,
//           },
//         },
//       ],
//       shipping_details: {
//  bill_to_name: savedOrder.bill_to_company_name,
//             bill_to_address: savedOrder.bill_to_company_address,
//             bill_to_email: savedOrder.bill_to_company_email,
//             bill_to_phone: savedOrder.bill_to_company_phone,
//             ship_to_name: savedOrder.ship_to_company_name,
//             ship_to_address: savedOrder.ship_to_company_address,
//             ship_to_email: savedOrder.ship_to_company_email,
//             ship_to_phone: savedOrder.ship_to_company_phone,
//             bill_to_attention_name: savedOrder.bill_to_attention_name,
//             ship_to_attention_name: savedOrder.ship_to_attention_name,
//       },
//       additional_info: {
//         signature_url: savedOrder.signature_url,
//         photo_url: savedOrder.photo_url,
//         attachment_url: savedOrder.attachment_url,
//       },
//     };

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Sales order updated" : "Sales order created",
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
// export const createOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;

//     // ================= VALIDATION =================
//     // if (!orderId && !body.company_info) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "company_info is mandatory for new orders",
//     //   });
//     // }

//     // if (!orderId && (!Array.isArray(body.items) || body.items.length === 0)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "items must be provided and not empty for new orders",
//     //   });
//     // }

//     let existingOrder = null;
//     let existingItems = [];

//     if (orderId) {
//       existingOrder = await prisma.salesorder.findUnique({
//         where: { id: orderId },
//         include: { salesorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Sales order not found",
//         });
//       }

//       existingItems = existingOrder.salesorderitems || [];
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

//     // ================= STEP COMPLETION RULES =================
//     const stepCompleted = (data, fields) =>
//       fields.every((field) => data[field] !== "" && data[field] !== null && data[field] !== undefined);

//     const stepRules = {
//       quotation: ["quotation_no", "quotation_date"],
//       sales_order: ["SO_no"],
//       delivery_challan: ["challan_no"],
//       invoice: ["invoice_no", "invoice_date"],
//       payment: ["payment_no", "amount_received"],
//     };

//     // ================= MERGE STEPS =================
//     const steps = {
//       quotation: orderId
//         ? {
//             quotation_no: existingOrder.quotation_no || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             quotation_date: existingOrder.quotation_date,
//             valid_till: existingOrder.valid_till,
//             qoutation_to_customer_name: existingOrder.qoutation_to_customer_name || "",
//             qoutation_to_customer_address: existingOrder.qoutation_to_customer_address || "",
//             qoutation_to_customer_email: existingOrder.qoutation_to_customer_email || "",
//             qoutation_to_customer_phone: existingOrder.qoutation_to_customer_phone || "",
//             notes: existingOrder.notes || "",
//             customer_ref: existingOrder.customer_ref || "",
//             ...(body.steps?.quotation || {}),
//           }
//         : body.steps?.quotation || {},

//       // SALES ORDER (NO SHIPPING HERE ANYMORE)
//       sales_order: orderId
//         ? {
//             SO_no: existingOrder.SO_no || "",
//             manual_ref_no: existingOrder.Manual_SO_ref || "",
//             manual_quo_no: existingOrder.manual_quo_no || "",
//             sales_order_status: existingOrder.sales_order_status,
//             ...(body.steps?.sales_order || {}),
//           }
//         : body.steps?.sales_order || {},

//       delivery_challan: orderId
//         ? {
//             challan_no: existingOrder.Challan_no || "",
//             manual_challan_no: existingOrder.Manual_challan_no || "",
//             driver_name: existingOrder.driver_name || "",
//             driver_phone: existingOrder.driver_phone || "",
//             ...(body.steps?.delivery_challan || {}),
//           }
//         : body.steps?.delivery_challan || {},

//       invoice: orderId
//         ? {
//             invoice_no: existingOrder.invoice_no || "",
//             manual_invoice_no: existingOrder.Manual_invoice_no || "",
//             invoice_date: existingOrder.invoice_date,
//             due_date: existingOrder.due_date,
//             ...(body.steps?.invoice || {}),
//           }
//         : body.steps?.invoice || {},

//       payment: orderId
//         ? {
//             payment_no: existingOrder.Payment_no || "",
//             manual_payment_no: existingOrder.Manual_payment_no || "",
//             payment_date: existingOrder.payment_date,
//             amount_received: existingOrder.amount_received || 0,
//             payment_note: existingOrder.payment_note || "",
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
//           tax_percent: Number(item.tax_percent),
//           discount: Number(item.discount),
//           amount: Number(item.amount),
//           warehouse_id: item.warehouse_id ? Number(item.warehouse_id) : null,
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
//       qoutation_to_customer_name: steps.quotation.qoutation_to_customer_name || "",
//       qoutation_to_customer_address: steps.quotation.qoutation_to_customer_address || "",
//       qoutation_to_customer_email: steps.quotation.qoutation_to_customer_email || "",
//       qoutation_to_customer_phone: steps.quotation.qoutation_to_customer_phone || "",
//       notes: steps.quotation.notes || "",
//       customer_ref: steps.quotation.customer_ref || "",

//       SO_no: steps.sales_order.SO_no || "",
//       Manual_SO_ref: steps.sales_order.manual_ref_no || "",
//       manual_quo_no: steps.sales_order.manual_quo_no || "",
//       sales_order_status: steps.sales_order.status,

//       Challan_no: steps.delivery_challan.challan_no || "",
//       Manual_challan_no: steps.delivery_challan.manual_challan_no || "",
//       delivery_challan_status: steps.delivery_challan.status,
//       driver_name: steps.delivery_challan.driver_name || "",
//       driver_phone: steps.delivery_challan.driver_phone || "",

//       invoice_no: steps.invoice.invoice_no || "",
//       Manual_invoice_no: steps.invoice.manual_invoice_no || "",
//       invoice_date: steps.invoice.invoice_date ? new Date(steps.invoice.invoice_date) : null,
//       due_date: steps.invoice.due_date ? new Date(steps.invoice.due_date) : null,
//       invoice_status: steps.invoice.status,

//       Payment_no: steps.payment.payment_no || "",
//       Manual_payment_no: steps.payment.manual_payment_no || "",
//       payment_date: steps.payment.payment_date ? new Date(steps.payment.payment_date) : null,
//       payment_status: steps.payment.status,
//       amount_received: Number(steps.payment.amount_received) || 0,
//       payment_note: steps.payment.payment_note || "",

//       signature_url: body.additional_info?.signature_url ?? existingOrder?.signature_url ?? "",
//       photo_url: body.additional_info?.photo_url ?? existingOrder?.photo_url ?? "",
//       attachment_url: body.additional_info?.attachment_url ?? existingOrder?.attachment_url ?? "",
// subtotal: body.sub_total ? Number(body.sub_total) : existingOrder?.subtotal || 0,
//       total: body.total ? Number(body.total) : existingOrder?.total || 0,
//       updated_at: new Date(),
//     };

//     // ================= CREATE OR UPDATE =================
//     let savedOrder;

//     if (orderId) {
//       if (body.items) {
//         await prisma.salesorderitems.deleteMany({
//           where: { sales_order_id: orderId },
//         });
//       }

//       savedOrder = await prisma.salesorder.update({
//         where: { id: orderId },
//         data: {
//           ...dbData,
//           ...(body.items && { salesorderitems: { create: itemsData } }),
//         },
//         include: { salesorderitems: true },
//       });
//     } else {
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: { create: itemsData },
//         },
//         include: { salesorderitems: true },
//       });
//     }

//     // ================= RESPONSE =================
//     const response = {
//       company_info: {
//         ...companyData,
//         id: savedOrder.id,
//         created_at: savedOrder.created_at,
//         updated_at: savedOrder.updated_at,
//         terms: savedOrder.terms,
//       },

//       shipping_details: {
//         bill_to_name: savedOrder.bill_to_company_name,
//         bill_to_address: savedOrder.bill_to_company_address,
//         bill_to_email: savedOrder.bill_to_company_email,
//         bill_to_phone: savedOrder.bill_to_company_phone,
//         bill_to_attention_name: savedOrder.bill_to_attention_name,

//         ship_to_name: savedOrder.ship_to_company_name,
//         ship_to_address: savedOrder.ship_to_company_address,
//         ship_to_email: savedOrder.ship_to_company_email,
//         ship_to_phone: savedOrder.ship_to_company_phone,
//         ship_to_attention_name: savedOrder.ship_to_attention_name,
//       },

//       items: savedOrder.salesorderitems,
//       sub_total: savedOrder.subtotal,
//       total: savedOrder.total,

//       steps: [
//         {
//           step: "quotation",
//           status: savedOrder.quotation_status,
//           data: {
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
//             qoutation_to_customer_address: savedOrder.qoutation_to_customer_address,
//             qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
//             qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
//             notes: savedOrder.notes,
//             customer_ref: savedOrder.customer_ref,
//           },
//         },

//         {
//           step: "sales_order",
//           status: savedOrder.sales_order_status,
//           data: {
//             SO_no: savedOrder.SO_no,
//             manual_ref_no: savedOrder.Manual_SO_ref,
//             manual_quo_no: savedOrder.manual_quo_no,
//           },
//         },

//         {
//           step: "delivery_challan",
//           status: savedOrder.delivery_challan_status,
//           data: {
//             challan_no: savedOrder.Challan_no,
//             manual_challan_no: savedOrder.Manual_challan_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone,
//           },
//         },

//         {
//           step: "invoice",
//           status: savedOrder.invoice_status,
//           data: {
//             invoice_no: savedOrder.invoice_no,
//             manual_invoice_no: savedOrder.Manual_invoice_no,
//             invoice_date: savedOrder.invoice_date,
//             due_date: savedOrder.due_date,
//           },
//         },

//         {
//           step: "payment",
//           status: savedOrder.payment_status,
//           data: {
//             payment_no: savedOrder.Payment_no,
//             manual_payment_no: savedOrder.Manual_payment_no,
//             payment_date: savedOrder.payment_date,
//             amount_received: savedOrder.amount_received,
//             note: savedOrder.payment_note,
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
//       message: orderId ? "Sales order updated" : "Sales order created",
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

// export const createOrUpdateSalesOrder = async (req, res) => {
//   try {
//     const body = { ...req.body };
//     const orderId = req.method === "PUT" ? Number(req.params.id) : null;
//     if (!body.company_info) body.company_info = {};
//     if (!body.additional_info) body.additional_info = {};

//     let existingOrder = null;
//     let existingItems = [];

//     // ================= EXISTING ORDER (FOR PUT) =================
//     if (orderId) {
//       existingOrder = await prisma.salesorder.findUnique({
//         where: { id: orderId },
//         include: { salesorderitems: true },
//       });

//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Sales order not found",
//         });
//       }

//       existingItems = existingOrder.salesorderitems || [];
//     }

//     // ================= FILE UPLOADS (MULTER + CLOUDINARY) =================
//     // if (req.files) {
//     //   // MULTIPLE IMAGES ARRAY -> files[]
//     //   if (req.files.files) {
//     //     body.additional_info.files = req.files.files.map((f) => f.path);
//     //   }

//     //   // SINGLE FILES
//     //   if (req.files.logo_url) {
//     //     body.company_info.logo_url = req.files.logo_url[0].path;
//     //   }
//     //   if (req.files.signature_url) {
//     //     body.additional_info.signature_url = req.files.signature_url[0].path;
//     //   }
//     //   if (req.files.photo_url) {
//     //     body.additional_info.photo_url = req.files.photo_url[0].path;
//     //   }
//     //   if (req.files.attachment_url) {
//     //     body.additional_info.attachment_url = req.files.attachment_url[0].path;
//     //   }
//     // }

//     if (req.files) {
//       // MULTIPLE IMAGES: files[]
//       if (req.files.files) {
//         const filesArr = Array.isArray(req.files.files)
//           ? req.files.files
//           : [req.files.files];

//         body.additional_info.files = [];

//         for (const file of filesArr) {
//           const url = await uploadToCloudinary(file, "sales_order_files");
//           if (url) body.additional_info.files.push(url);
//         }
//       }

//       // SINGLE FILE: logo_url

//       // if (req.files.logo_url) {
//       //   const url = await uploadToCloudinary(req.files.logo_url, "sales_logo");
//       //   if (url) body.company_info.logo_url = url;
//       // }

//       if (req.files.logo_url) {
//         const logoFile = Array.isArray(req.files.logo_url)
//           ? req.files.logo_url[0]
//           : req.files.logo_url;

//         const url = await uploadToCloudinary(logoFile, "sales_logo");
//         if (url) body.company_info.logo_url = url;
//       }

//       // SINGLE FILE: signature_url
//       // if (req.files.signature_url) {
//       //   const url = await uploadToCloudinary(req.files.signature_url, "sales_signature");
//       //   if (url) body.additional_info.signature_url = url;
//       // }
//       if (req.files.signature_url) {
//         const file = Array.isArray(req.files.signature_url)
//           ? req.files.signature_url[0]
//           : req.files.signature_url;

//         const url = await uploadToCloudinary(file, "sales_signature");
//         if (url) body.additional_info.signature_url = url;
//       }

//       // SINGLE FILE: photo_url
//       // if (req.files.photo_url) {
//       //   const url = await uploadToCloudinary(req.files.photo_url, "sales_photo");
//       //   if (url) body.additional_info.photo_url = url;
//       // }
//       if (req.files.photo_url) {
//         const file = Array.isArray(req.files.photo_url)
//           ? req.files.photo_url[0]
//           : req.files.photo_url;

//         const url = await uploadToCloudinary(file, "sales_photo");
//         if (url) body.additional_info.photo_url = url;
//       }

//       // SINGLE FILE: attachment_url
//       // if (req.files.attachment_url) {
//       //   const url = await uploadToCloudinary(req.files.attachment_url, "sales_attachment");
//       //   if (url) body.additional_info.attachment_url = url;
//       // }
//       //        if (req.files.attachment_url) {
//       //   const file = Array.isArray(req.files.attachment_url)
//       //     ? req.files.attachment_url[0]
//       //     : req.files.attachment_url;

//       //   const url = await uploadToCloudinary(file, "sales_attachment");
//       //   if (url) body.additional_info.attachment_url = url;
//       // }

//       if (req.files.attachment_url) {
//         // Ensure we are always working with an array
//         const attachmentFiles = Array.isArray(req.files.attachment_url)
//           ? req.files.attachment_url
//           : [req.files.attachment_url];

//         const attachmentUrls = [];
//         // Loop through each file, upload it, and collect the URL
//         for (const file of attachmentFiles) {
//           const url = await uploadToCloudinary(file, "sales_attachment");
//           if (url) {
//             attachmentUrls.push(url);
//           }
//         }

//         // Convert the array of URLs to a single JSON string to be stored in the DB
//         if (attachmentUrls.length > 0) {
//           body.additional_info.attachment_url = JSON.stringify(attachmentUrls);
//         }
//       }
//     }

//     //Safe helper to preserve existing values
//     const safeMerge = (oldObj = {}, newObj = {}) => {
//       const merged = { ...oldObj };
//       for (const key in newObj) {
//         if (
//           newObj[key] !== undefined &&
//           newObj[key] !== null &&
//           newObj[key] !== ""
//         ) {
//           merged[key] = newObj[key];
//         }
//       }
//       return merged;
//     };

//     // ================= STEP COMPLETION RULES =================
//     const stepRequired = {
//       quotation: ["quotation_no", "quotation_date"],
//       sales_order: ["SO_no"],
//       delivery_challan: ["challan_no"],
//       invoice: ["invoice_no", "invoice_date"],
//       payment: ["payment_no", "amount_received"],
//     };

//     const stepCompleted = (obj, required) =>
//       required.every(
//         (f) => obj?.[f] !== "" && obj?.[f] !== null && obj?.[f] !== undefined
//       );

//     // ================= MERGE STEPS =================
//     const mergeStep = (stepName) =>
//       orderId
//         ? { ...existingOrder, ...(body.steps?.[stepName] || {}) }
//         : body.steps?.[stepName] || {};

//     const steps = {
//       quotation: mergeStep("quotation"),
//       sales_order: mergeStep("sales_order"),
//       delivery_challan: mergeStep("delivery_challan"),
//       invoice: mergeStep("invoice"),
//       payment: mergeStep("payment"),
//     };

//     Object.keys(steps).forEach((step) => {
//       steps[step].status = stepCompleted(steps[step], stepRequired[step])
//         ? "completed"
//         : "pending";
//     });

//     // ================= SHIPPING =================
//     const shipping = body.shipping_details
//       ? {
//           bill_to_company_name: body.shipping_details.bill_to_name || "",
//           bill_to_company_address: body.shipping_details.bill_to_address || "",
//           bill_to_company_email: body.shipping_details.bill_to_email || "",
//           bill_to_company_phone: body.shipping_details.bill_to_phone || "",
//           bill_to_attention_name:
//             body.shipping_details.bill_to_attention_name || "",

//           ship_to_company_name: body.shipping_details.ship_to_name || "",
//           ship_to_company_address: body.shipping_details.ship_to_address || "",
//           ship_to_company_email: body.shipping_details.ship_to_email || "",
//           ship_to_company_phone: body.shipping_details.ship_to_phone || "",
//           ship_to_attention_name:
//             body.shipping_details.ship_to_attention_name || "",
//         }
//       : orderId
//       ? {
//           bill_to_company_name: existingOrder.bill_to_company_name,
//           bill_to_company_address: existingOrder.bill_to_company_address,
//           bill_to_company_email: existingOrder.bill_to_company_email,
//           bill_to_company_phone: existingOrder.bill_to_company_phone,
//           bill_to_attention_name: existingOrder.bill_to_attention_name,

//           ship_to_company_name: existingOrder.ship_to_company_name,
//           ship_to_company_address: existingOrder.ship_to_company_address,
//           ship_to_company_email: existingOrder.ship_to_company_email,
//           ship_to_company_phone: existingOrder.ship_to_company_phone,
//           ship_to_attention_name: existingOrder.ship_to_attention_name,
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
//           logo_url: body.company_info.logo_url || "",
//           bank_name: body.company_info.bank_name || "",
//           account_no: body.company_info.account_no || "",
//           account_holder: body.company_info.account_holder || "",
//           ifsc_code: body.company_info.ifsc_code || "",
//           terms: body.company_info.terms || "",
//         }
//       : orderId
//       ? existingOrder
//       : {};

//     // ================= ITEMS =================
//     const itemsData = body.items
//       ? body.items.map((i) => ({
//           item_name: i.item_name,
//           qty: Number(i.qty),
//           rate: Number(i.rate),
//           tax_percent: Number(i.tax_percent),
//           discount: Number(i.discount),
//           amount: Number(i.amount),
//           warehouse_id: i.warehouse_id ? Number(i.warehouse_id) : null,
//         }))
//       : existingItems;

//     // ================= DB DATA =================
//     const dbData = {
//       ...companyData,
//       ...shipping,

//       quotation_no: steps.quotation.quotation_no || "",
//       manual_quo_no: steps.quotation.manual_quo_no || "",
//       quotation_date: steps.quotation.quotation_date
//         ? new Date(steps.quotation.quotation_date)
//         : null,
//       valid_till: steps.quotation.valid_till
//         ? new Date(steps.quotation.valid_till)
//         : null,
//       quotation_status: steps.quotation.status,
//       qoutation_to_customer_name: steps.quotation.qoutation_to_customer_name,
//       qoutation_to_customer_address:
//         steps.quotation.qoutation_to_customer_address,
//       qoutation_to_customer_email: steps.quotation.qoutation_to_customer_email,
//       qoutation_to_customer_phone: steps.quotation.qoutation_to_customer_phone,
//       notes: steps.quotation.notes,
//       customer_ref: steps.quotation.customer_ref,

//       SO_no: steps.sales_order.SO_no,
//       Manual_SO_ref: steps.sales_order.manual_ref_no,
//       manual_quo_no: steps.sales_order.manual_quo_no,
//       sales_order_status: steps.sales_order.status,

//       Challan_no: steps.delivery_challan.challan_no,
//       Manual_challan_no: steps.delivery_challan.manual_challan_no,
//       delivery_challan_status: steps.delivery_challan.status,
//       driver_name: steps.delivery_challan.driver_name,
//       driver_phone: steps.delivery_challan.driver_phone,

//       invoice_no: steps.invoice.invoice_no,
//       Manual_invoice_no: steps.invoice.manual_invoice_no,
//       invoice_date: steps.invoice.invoice_date
//         ? new Date(steps.invoice.invoice_date)
//         : null,
//       due_date: steps.invoice.due_date
//         ? new Date(steps.invoice.due_date)
//         : null,
//       invoice_status: steps.invoice.status,

//       Payment_no: steps.payment.payment_no || "",
//       Manual_payment_no: steps.payment.manual_payment_no || "",
//       payment_date: steps.payment.payment_date
//         ? new Date(steps.payment.payment_date)
//         : null,
//       payment_status: steps.payment.status,
//       amount_received: Number(steps.payment.amount_received) || 0,
//       payment_note: steps.payment.payment_note || "",

//       signature_url:
//         body.additional_info.signature_url ||
//         existingOrder?.signature_url ||
//         "",
//       photo_url:
//         body.additional_info.photo_url || existingOrder?.photo_url || "",
//       attachment_url:
//         body.additional_info.attachment_url ||
//         existingOrder?.attachment_url ||
//         "",

//       subtotal: body.sub_total
//         ? Number(body.sub_total)
//         : existingOrder?.subtotal || 0,
//       total: body.total ? Number(body.total) : existingOrder?.total || 0,
//       updated_at: new Date(),
//       total_invoice:
//         steps.payment.total_invoice !== undefined
//           ? Number(steps.payment.total_invoice)
//           : existingOrder?.total_invoice || 0,

//       balance:
//         steps.payment.balance !== undefined
//           ? Number(steps.payment.balance)
//           : existingOrder?.balance || 0,
//     };

//     // ================= CREATE OR UPDATE =================
//     let savedOrder;

//     // if (orderId) {
//     //   if (body.items) {
//     //     await prisma.salesorderitems.deleteMany({
//     //       where: { sales_order_id: orderId },
//     //     });
//     //   }

//     // savedOrder = await prisma.salesorder.update({
//     //   where: { id: orderId },
//     //   data: {
//     //     ...dbData,
//     //     ...(body.items && { salesorderitems: { create: itemsData } }),
//     //   },
//     //   include: { salesorderitems: true },
//     // });
//     //       savedOrder = await prisma.salesorder.update({
//     //   where: { id: orderId },
//     //   data: {
//     //     ...safeMerge(existingOrder, dbData),
//     //     ...(body.items && { salesorderitems: { create: itemsData } }),
//     //   },
//     //   include: { salesorderitems: true },
//     // });
//     //     }
//     //     else {
//     //       savedOrder = await prisma.salesorder.create({
//     //         data: {
//     //           ...dbData,
//     //           created_at: new Date(),
//     //           salesorderitems: { create: itemsData },
//     //         },
//     //         include: { salesorderitems: true },
//     //       });
//     //     }

//     if (orderId) {
//       // Check if the request includes items to be updated
//       if (body.items && Array.isArray(body.items)) {
//         // Use a transaction to ensure all item operations and the main update succeed or fail together.
//         savedOrder = await prisma.$transaction(async (tx) => {
//           // --- Step 1: Sync the salesorderitems ---

//           // a) Identify items to be deleted (present in DB but not in the request)
//           const incomingItemIds = body.items
//             .filter((item) => item.id) // Filter out items that don't have an ID (they are new)
//             .map((item) => item.id);

//           // Delete any items associated with the order that are NOT in the incoming list.
//           await tx.salesorderitems.deleteMany({
//             where: {
//               sales_order_id: orderId,
//               ...(incomingItemIds.length > 0 && {
//                 id: { notIn: incomingItemIds },
//               }),
//             },
//           });

//           // b) Update or create each item from the request
//           for (const item of body.items) {
//             const itemData = {
//               item_name: item.item_name,
//               qty: Number(item.qty),
//               rate: Number(item.rate),
//               tax_percent: Number(item.tax_percent),
//               discount: Number(item.discount),
//               amount: Number(item.amount),
//               warehouse_id: item.warehouse_id
//                 ? Number(item.warehouse_id)
//                 : null,
//             };

//             if (item.id) {
//               // Update existing item
//               await tx.salesorderitems.update({
//                 where: { id: item.id },
//                 data: itemData,
//               });
//             } else {
//               // Create new item
//               await tx.salesorderitems.create({
//                 data: {
//                   ...itemData,
//                   sales_order_id: orderId,
//                 },
//               });
//             }
//           }

//           // --- Step 2: Update the main salesorder record ---
//           // Use safeMerge for scalar fields, then filter out the relation.
//           const mergedData = safeMerge(existingOrder, dbData);
//           const { salesorderitems, ...dataForUpdate } = mergedData;

//           const updatedOrder = await tx.salesorder.update({
//             where: { id: orderId },
//             data: dataForUpdate,
//             include: { salesorderitems: true },
//           });

//           return updatedOrder;
//         });
//       } else {
//         // --- If no items are sent, just update the main order fields ---
//         // This is your original partial update logic, now cleaned up.
//         const mergedData = safeMerge(existingOrder, dbData);
//         const { salesorderitems, ...dataForUpdate } = mergedData;

//         savedOrder = await prisma.salesorder.update({
//           where: { id: orderId },
//           data: dataForUpdate,
//           include: { salesorderitems: true },
//         });
//       }
//     } else {
//       // The CREATE logic remains the same
//       savedOrder = await prisma.salesorder.create({
//         data: {
//           ...dbData,
//           created_at: new Date(),
//           salesorderitems: { create: itemsData },
//         },
//         include: { salesorderitems: true },
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: orderId ? "Sales order updated" : "Sales order created",
//       data: {
//         sales_order_id: savedOrder.id,
//         company_info: {
//           company_id: savedOrder.company_id,
//           company_name: savedOrder.company_name,
//           company_address: savedOrder.company_address,
//           company_email: savedOrder.company_email,
//           company_phone: savedOrder.company_phone,
//           logo_url: savedOrder.logo_url,
//           bank_name: savedOrder.bank_name,
//           account_no: savedOrder.account_no,
//           account_holder: savedOrder.account_holder,
//           ifsc_code: savedOrder.ifsc_code,
//           terms: savedOrder.terms,
//         },

//         shipping_details: {
//           bill_to_name: savedOrder.bill_to_company_name,
//           bill_to_address: savedOrder.bill_to_company_address,
//           bill_to_email: savedOrder.bill_to_company_email,
//           bill_to_phone: savedOrder.bill_to_company_phone,
//           bill_to_attention_name: savedOrder.bill_to_attention_name,

//           ship_to_name: savedOrder.ship_to_company_name,
//           ship_to_address: savedOrder.ship_to_company_address,
//           ship_to_email: savedOrder.ship_to_company_email,
//           ship_to_phone: savedOrder.ship_to_company_phone,
//           ship_to_attention_name: savedOrder.ship_to_attention_name,
//         },

//         steps: {
//           quotation: {
//             status: savedOrder.quotation_status, // ← status added
//             quotation_no: savedOrder.quotation_no,
//             manual_quo_no: savedOrder.manual_quo_no,
//             quotation_date: savedOrder.quotation_date,
//             valid_till: savedOrder.valid_till,
//             qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
//             qoutation_to_customer_address:
//               savedOrder.qoutation_to_customer_address,
//             qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
//             qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
//             notes: savedOrder.notes,
//             customer_ref: savedOrder.customer_ref,
//           },

//           sales_order: {
//             status: savedOrder.sales_order_status, // ← added
//             SO_no: savedOrder.SO_no,
//             manual_ref_no: savedOrder.Manual_SO_ref,
//             manual_quo_no: savedOrder.manual_quo_no,
//           },

//           delivery_challan: {
//             status: savedOrder.delivery_challan_status, // ← added
//             challan_no: savedOrder.Challan_no,
//             manual_challan_no: savedOrder.Manual_challan_no,
//             driver_name: savedOrder.driver_name,
//             driver_phone: savedOrder.driver_phone,
//           },

//           invoice: {
//             status: savedOrder.invoice_status, // ← added
//             invoice_no: savedOrder.invoice_no,
//             manual_invoice_no: savedOrder.Manual_invoice_no,
//             invoice_date: savedOrder.invoice_date,
//             due_date: savedOrder.due_date,
//           },

//           payment: {
//             status: savedOrder.payment_status, // ← added
//             payment_no: savedOrder.Payment_no,
//             manual_payment_no: savedOrder.Manual_payment_no,
//             payment_date: savedOrder.payment_date,
//             amount_received: savedOrder.amount_received,
//             balance: savedOrder.balance,
//             payment_note: savedOrder.payment_note,
//             total_invoice: savedOrder.total_invoice,
//           },
//         },

//         items: savedOrder.salesorderitems,

//         additional_info: {
//           files: body.additional_info.files || existingOrder?.files || [],
//           signature_url: savedOrder.signature_url,
//           photo_url: savedOrder.photo_url,
//           attachment_url: (() => {
//             // If there's no attachment URL, return an empty array.
//             if (!savedOrder.attachment_url) {
//               return [];
//             }

//             try {
//               // Try to parse it as a JSON array (the new format).
//               const parsed = JSON.parse(savedOrder.attachment_url);
//               // Ensure the result is an array, even if it was a single JSON string like '"url"'
//               return Array.isArray(parsed) ? parsed : [parsed];
//             } catch (e) {
//               // If parsing fails, it's the old format (a single URL string).
//               // Wrap it in an array to maintain consistency for the frontend.
//               return [savedOrder.attachment_url];
//             }
//           })(),
//         },

//         sub_total: savedOrder.subtotal,
//         total: savedOrder.total,
//       },
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

const updateProductTotalStock = async (tx, productId) => {
  const aggregatedStock = await tx.product_warehouses.aggregate({
    where: { product_id: productId },
    _sum: { stock_qty: true },
  });

  const totalStock = aggregatedStock._sum.stock_qty || 0;

  await tx.products.update({
    where: { id: productId },
    data: { total_stock: totalStock },
  });
};



export const createOrUpdateSalesOrder = async (req, res) => {
  try {
    const body = { ...req.body };
    const orderId = req.method === "PUT" ? Number(req.params.id) : null;

    let existingOrder = null;

    if (orderId) {
      existingOrder = await prisma.salesorder.findUnique({
        where: { id: orderId },
        include: { salesorderitems: true },
      });

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Sales order not found",
        });
      }
    }

    let savedOrder;

    /* ======================================================
       UPDATE SALES ORDER
    ====================================================== */
    if (orderId) {
      savedOrder = await prisma.$transaction(async (tx) => {

        /* ---------- DELETE REMOVED ITEMS (RESTORE STOCK) ---------- */
        const incomingIds = body.items.filter(i => i.id).map(i => i.id);

        const itemsToDelete = await tx.salesorderitems.findMany({
          where: {
            sales_order_id: orderId,
            ...(incomingIds.length && { id: { notIn: incomingIds } }),
          },
        });

        for (const item of itemsToDelete) {
          if (item.product_id && item.warehouse_id) {
            await tx.product_warehouses.update({
              where: {
                product_id_warehouse_id: {
                  product_id: item.product_id,
                  warehouse_id: item.warehouse_id,
                },
              },
              data: {
                stock_qty: { increment: Number(item.qty) },
              },
            });

            await updateProductTotalStock(tx, item.product_id);
          }
        }

        await tx.salesorderitems.deleteMany({
          where: { id: { in: itemsToDelete.map(i => i.id) } },
        });

        /* ---------- UPDATE / CREATE ITEMS ---------- */
        for (const item of body.items) {
          let oldQty = 0;

          if (item.id) {
            const oldItem = await tx.salesorderitems.findUnique({
              where: { id: item.id },
              select: { qty: true },
            });
            oldQty = oldItem ? Number(oldItem.qty) : 0;
          }

          const newQty = Number(item.qty);
          const diff = newQty - oldQty;

          if (item.product_id && item.warehouse_id && diff !== 0) {
            const warehouseStock = await tx.product_warehouses.findUnique({
              where: {
                product_id_warehouse_id: {
                  product_id: item.product_id,
                  warehouse_id: item.warehouse_id,
                },
              },
            });

            const availableStock = warehouseStock?.stock_qty ?? 0;

            if (diff > 0 && availableStock < diff) {
              throw new Error(
                `Insufficient stock. Available: ${availableStock}, Required: ${diff}`
              );
            }

            if (diff > 0) {
              // qty increased → reduce stock
              await tx.product_warehouses.update({
                where: {
                  product_id_warehouse_id: {
                    product_id: item.product_id,
                    warehouse_id: item.warehouse_id,
                  },
                },
                data: { stock_qty: { decrement: diff } },
              });
            } else {
              // qty decreased → return stock
              await tx.product_warehouses.update({
                where: {
                  product_id_warehouse_id: {
                    product_id: item.product_id,
                    warehouse_id: item.warehouse_id,
                  },
                },
                data: { stock_qty: { increment: Math.abs(diff) } },
              });
            }

            await updateProductTotalStock(tx, item.product_id);
          }

          const itemData = {
            item_name: item.item_name,
            qty: newQty,
            rate: Number(item.rate),
            tax_percent: Number(item.tax_percent),
            discount: Number(item.discount),
            amount: Number(item.amount),
            warehouse_id: Number(item.warehouse_id),
            product_id: Number(item.product_id),
          };

          if (item.id) {
            await tx.salesorderitems.update({
              where: { id: item.id },
              data: itemData,
            });
          } else {
            await tx.salesorderitems.create({
              data: {
                ...itemData,
                sales_order_id: orderId,
              },
            });
          }
        }

        return await tx.salesorder.update({
          where: { id: orderId },
          data: {
            SO_no: body.steps?.sales_order?.SO_no,
            total: Number(body.total),
            subtotal: Number(body.sub_total),
            updated_at: new Date(),
          },
          include: { salesorderitems: true },
        });
      });
    }

    /* ======================================================
       CREATE SALES ORDER
    ====================================================== */
    else {
      savedOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.salesorder.create({
          data: {
            SO_no: body.steps?.sales_order?.SO_no,
            subtotal: Number(body.sub_total),
            total: Number(body.total),
            created_at: new Date(),
          },
        });

        for (const item of body.items) {
          const warehouseStock = await tx.product_warehouses.findUnique({
            where: {
              product_id_warehouse_id: {
                product_id: item.product_id,
                warehouse_id: item.warehouse_id,
              },
            },
          });

          const availableStock = warehouseStock?.stock_qty ?? 0;

          if (availableStock < item.qty) {
            throw new Error(
              `Insufficient stock. Available: ${availableStock}, Required: ${item.qty}`
            );
          }

          await tx.salesorderitems.create({
            data: {
              item_name: item.item_name,
              qty: Number(item.qty),
              rate: Number(item.rate),
              tax_percent: Number(item.tax_percent),
              discount: Number(item.discount),
              amount: Number(item.amount),
              warehouse_id: Number(item.warehouse_id),
              product_id: Number(item.product_id),
              sales_order_id: order.id,
            },
          });

          await tx.product_warehouses.update({
            where: {
              product_id_warehouse_id: {
                product_id: item.product_id,
                warehouse_id: item.warehouse_id,
              },
            },
            data: {
              stock_qty: { decrement: Number(item.qty) },
            },
          });

          await updateProductTotalStock(tx, item.product_id);
        }

        return await tx.salesorder.findUnique({
          where: { id: order.id },
          include: { salesorderitems: true },
        });
      });
    }

    return res.json({
      success: true,
      message: orderId ? "Sales order updated" : "Sales order created",
      data: savedOrder,
    });

  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};




const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};
const isStepCompleted1 = (stepData) => {
  // Check if essential fields for the step are filled
  switch (stepData.step) {
    case "quotation":
      return (
        stepData.quotation_no &&
        stepData.quotation_date &&
        stepData.qoutation_to_customer_name
      );
    case "sales_order":
      return stepData.SO_no || stepData.Manual_SO_ref;
    case "delivery_challan":
      return stepData.Challan_no || stepData.Manual_challan_no;
    case "invoice":
      return stepData.invoice_no || stepData.Manual_invoice_no;
    case "payment":
      return (
        stepData.Payment_no ||
        stepData.Manual_payment_no ||
        stepData.amount_received > 0
      );
    default:
      return false;
  }
};

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
    updated_at: salesOrder.updated_at,
  };

  // Process items data - ensure it's always an array
  let itemsData = [];
  if (salesOrder.salesorderitems && Array.isArray(salesOrder.salesorderitems)) {
    itemsData = salesOrder.salesorderitems.map((item) => ({
      id: item.id,
      item_name: item.item_name || "",
      qty: toNumber(item.qty || 0),
      rate: toNumber(item.rate || 0),
      tax_percent: toNumber(item.tax_percent || 0),
      discount: toNumber(item.discount || 0),
      amount: toNumber(item.amount || 0),
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
    customer_phone: salesOrder.bill_to_customer_phone || "",
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
    customer_phone: salesOrder.ship_to_customer_phone || "",
  };

  // Quotation step
  const quotationStep = {
    step: "quotation",
    status: isStepCompleted1({
      step: "quotation",
      quotation_no: salesOrder.quotation_no,
      quotation_date: salesOrder.quotation_date,
      qoutation_to_customer_name: salesOrder.qoutation_to_customer_name,
    })
      ? "completed"
      : "pending",
    data: {
      ref_no: salesOrder.ref_no || "",
      Manual_ref_ro: salesOrder.Manual_ref_ro || "",
      quotation_no: salesOrder.quotation_no || "",
      manual_quo_no: salesOrder.manual_quo_no || "",
      quotation_date: salesOrder.quotation_date,
      valid_till: salesOrder.valid_till,
      qoutation_to_customer_name: salesOrder.qoutation_to_customer_name || "",
      qoutation_to_customer_address:
        salesOrder.qoutation_to_customer_address || "",
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
      draft_status: salesOrder.draft_status || "Draft",
    },
  };

  // Sales Order step
  const salesOrderStep = {
    step: "sales_order",
    status: isStepCompleted1({
      step: "sales_order",
      SO_no: salesOrder.SO_no,
      Manual_SO_ref: salesOrder.Manual_SO_ref,
    })
      ? "completed"
      : "pending",
    data: {
      SO_no: salesOrder.SO_no || "",
      Manual_SO_ref: salesOrder.Manual_SO_ref || "",
      // BILL TO details (carried forward from quotation)
      bill_to: billToDetails,
      // SHIP TO details
      ship_to: shipToDetails,
      sales_order_status: salesOrder.sales_order_status || "Pending",
    },
  };

  // Delivery Challan step
  const deliveryChallanStep = {
    step: "delivery_challan",
    status: isStepCompleted1({
      step: "delivery_challan",
      Challan_no: salesOrder.Challan_no,
      Manual_challan_no: salesOrder.Manual_challan_no,
    })
      ? "completed"
      : "pending",
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
      delivery_challan_status: salesOrder.delivery_challan_status || "Pending",
    },
  };

  // Invoice step
  const invoiceStep = {
    step: "invoice",
    status: isStepCompleted1({
      step: "invoice",
      invoice_no: salesOrder.invoice_no,
      Manual_invoice_no: salesOrder.Manual_invoice_no,
    })
      ? "completed"
      : "pending",
    data: {
      invoice_no: salesOrder.invoice_no || "",
      Manual_invoice_no: salesOrder.Manual_invoice_no || "",
      total_invoice: toNumber(salesOrder.total_invoice || 0),
      // BILL TO details (carried forward from previous steps)
      bill_to: billToDetails,
      // SHIP TO details (carried forward from previous steps)
      ship_to: shipToDetails,
      invoice_status: salesOrder.invoice_status || "Pending",
    },
  };

  // Payment step
  const paymentStep = {
    step: "payment",
    status: isStepCompleted1({
      step: "payment",
      Payment_no: salesOrder.Payment_no,
      Manual_payment_no: salesOrder.Manual_payment_no,
      amount_received: salesOrder.amount_received,
    })
      ? "completed"
      : "pending",
    data: {
      Payment_no: salesOrder.Payment_no || "",
      Manual_payment_no: salesOrder.Manual_payment_no || "",
      // RECEIVED FROM details
      received_from: {
        customer_name:
          salesOrder.payment_received_customer_name ||
          salesOrder.qoutation_to_customer_name ||
          "",
        customer_address:
          salesOrder.payment_received_customer_address ||
          salesOrder.qoutation_to_customer_address ||
          "",
        customer_email:
          salesOrder.payment_received_customer_email ||
          salesOrder.qoutation_to_customer_email ||
          "",
        customer_phone:
          salesOrder.payment_received_customer_phone ||
          salesOrder.qoutation_to_customer_phone ||
          "",
      },
      // PAYMENT DETAILS
      payment_details: {
        amount_received: toNumber(salesOrder.amount_received || 0),
        total_amount: toNumber(salesOrder.total_amount || 0),
        payment_status: salesOrder.payment_status || "Pending",
        balance: toNumber(salesOrder.balance || 0),
        payment_note: salesOrder.payment_note || "",
      },
    },
  };

  // Additional information
  const additionalInfo = {
    customer_ref: salesOrder.customer_ref || "",
    signature_url: salesOrder.signature_url || "",
    photo_url: salesOrder.photo_url || "",
    attachment_url: salesOrder.attachment_url || "",
  };

  return {
    company_info: companyInfo,
    items: itemsData,
    steps: [
      quotationStep,
      salesOrderStep,
      deliveryChallanStep,
      invoiceStep,
      paymentStep,
    ],
    additional_info: additionalInfo,
  };
};

// export const getSalesOrdersByCompanyId = async (req, res) => {
//   try {
//     const { companyId } = req.params;

//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID is required",
//       });
//     }

//     const salesOrders = await prisma.salesorder.findMany({
//       where: { company_id: parseInt(companyId) },
//       include: {
//         salesorderitems: true,
//       },
//       orderBy: { created_at: "desc" },
//     });

//     // Structure each sales order by steps
//     const structuredOrders = salesOrders.map(order => structureSalesOrderBySteps(order));

//     return res.status(200).json({
//       success: true,
//       message: `Sales orders for company ID ${companyId} fetched successfully`,
//       data: structuredOrders,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching sales orders",
//       error: error.message,
//     });
//   }
// };
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
      where: { company_id: Number(companyId) },
      include: {
        salesorderitems: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    const formattedOrders = salesOrders.map((order) => {
      const stepStatus = (value) =>
        value && value !== "" ? "completed" : "pending";

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

        steps: {
          quotation: {
            status: stepStatus(order.quotation_no),
            quotation_no: order.quotation_no,
            manual_quo_no: order.manual_quo_no,
            quotation_date: order.quotation_date,
            valid_till: order.valid_till,
            qoutation_to_customer_name: order.qoutation_to_customer_name,
            qoutation_to_customer_address: order.qoutation_to_customer_address,
            qoutation_to_customer_email: order.qoutation_to_customer_email,
            qoutation_to_customer_phone: order.qoutation_to_customer_phone,
            notes: order.notes,
            customer_ref: order.customer_ref,
          },

          sales_order: {
            status: stepStatus(order.Manual_SO_ref),
            SO_no: order.SO_no,
            manual_ref_no: order.Manual_SO_ref,
          },

          delivery_challan: {
            status: stepStatus(order.Manual_challan_no),
            challan_no: order.Challan_no,
            manual_challan_no: order.Manual_challan_no,
            driver_name: order.driver_name,
            driver_phone: order.driver_phone,
          },

          invoice: {
            status: stepStatus(order.Manual_invoice_no),
            invoice_no: order.invoice_no,
            manual_invoice_no: order.Manual_invoice_no,
            invoice_date: order.invoice_date,
            due_date: order.due_date,
          },

          payment: {
            status: stepStatus(order.Manual_payment_no),
            Payment_no: order.Payment_no,
            manual_payment_no: order.Manual_payment_no,
            payment_date: order.payment_date,
            amount_received: order.amount_received,
            balance: order.balance,
            total_invoice: order.total_invoice,
            payment_note: order.payment_note,
          },
        },

        items: order.salesorderitems,

        additional_info: {
          files: order.files || [],
          signature_url: order.signature_url,
          photo_url: order.photo_url,
          attachment_url: order.attachment_url,
        },

        sub_total: order.subtotal,
        total: order.total,
      };
    });

    return res.status(200).json({
      success: true,
      message: `Sales orders for company ID ${companyId} fetched successfully`,
      data: formattedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching sales orders",
      error: error.message,
    });
  }
};

// export const getSalesOrderById = async (req, res) => {

//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Sales Order ID is required",
//       });
//     }

//     const salesOrder = await prisma.salesorder.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         salesorderitems: true,
//       },
//     });

//     if (!salesOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Sales Order not found",
//       });
//     }

//     // Structure the sales order by steps
//     const structuredOrder = structureSalesOrderBySteps(salesOrder);

//     return res.status(200).json({
//       success: true,
//       message: `Sales Order with ID ${id} fetched successfully`,
//       data: structuredOrder,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching the sales order",
//       error: error.message,
//     });
//   }
// };

// export const getSalesOrderById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Sales Order ID is required",
//       });
//     }

//     const order = await prisma.salesorder.findUnique({
//       where: { id: Number(id) },
//       include: { salesorderitems: true },
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Sales Order not found",
//       });
//     }

//     const formattedOrder = {
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
//         terms: order.terms,
//         id: order.id,
//         created_at: order.created_at,
//         updated_at: order.updated_at
//       },

//       shipping_details: {
//         bill_to_name: order.bill_to_company_name,
//         bill_to_address: order.bill_to_company_address,
//         bill_to_email: order.bill_to_company_email,
//         bill_to_phone: order.bill_to_company_phone,
//         bill_to_attention_name: order.bill_to_attention_name,

//         ship_to_name: order.ship_to_company_name,
//         ship_to_address: order.ship_to_company_address,
//         ship_to_email: order.ship_to_company_email,
//         ship_to_phone: order.ship_to_company_phone,
//         ship_to_attention_name: order.ship_to_attention_name
//       },

//       steps: {
//         quotation: {
//           status: order.quotation_status,
//           quotation_no: order.quotation_no,
//           manual_quo_no: order.manual_quo_no,
//           quotation_date: order.quotation_date,
//           valid_till: order.valid_till,
//           qoutation_to_customer_name: order.qoutation_to_customer_name,
//           qoutation_to_customer_address: order.qoutation_to_customer_address,
//           qoutation_to_customer_email: order.qoutation_to_customer_email,
//           qoutation_to_customer_phone: order.qoutation_to_customer_phone,
//           notes: order.notes,
//           customer_ref: order.customer_ref
//         },

//         sales_order: {
//           status: order.sales_order_status,
//           SO_no: order.SO_no,
//           manual_ref_no: order.Manual_SO_ref,
//           manual_quo_no: order.manual_quo_no
//         },

//         delivery_challan: {
//           status: order.delivery_challan_status,
//           challan_no: order.Challan_no,
//           manual_challan_no: order.Manual_challan_no,
//           driver_name: order.driver_name,
//           driver_phone: order.driver_phone
//         },

//         invoice: {
//           status: order.invoice_status,
//           invoice_no: order.invoice_no,
//           manual_invoice_no: order.Manual_invoice_no,
//           invoice_date: order.invoice_date,
//           due_date: order.due_date
//         },

//         payment: {
//           status: order.payment_status,
//           payment_no: order.Payment_no,
//           manual_payment_no: order.Manual_payment_no,
//           payment_date: order.payment_date,
//           amount_received: order.amount_received,
//            balance:order.balance,
//             total_invoice: order.total_invoice,
//           payment_note: order.payment_note
//         }
//       },

//       items: order.salesorderitems,

//       additional_info: {
//         files: order.files || [],
//         signature_url: order.signature_url,
//         photo_url: order.photo_url,
//         attachment_url: order.attachment_url
//       },

//       sub_total: order.subtotal,
//       total: order.total
//     };

//     return res.status(200).json({
//       success: true,
//       message: `Sales Order with ID ${id} fetched successfully`,
//       data: formattedOrder
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching the sales order",
//       error: error.message,
//     });
//   }
// };

export const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Sales Order ID is required",
      });
    }

    // Fetch only 1 sales order
    const order = await prisma.salesorder.findUnique({
      where: { id: Number(id) },
      include: {
        salesorderitems: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales Order not found",
      });
    }

    // same logic used in getSalesOrdersByCompanyId
    const stepStatus = (value) =>
      value && value !== "" ? "completed" : "pending";

    const formattedOrder = {
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

      steps: {
        quotation: {
          status: stepStatus(order.quotation_no),
          quotation_no: order.quotation_no,
          manual_quo_no: order.manual_quo_no,
          quotation_date: order.quotation_date,
          valid_till: order.valid_till,
          qoutation_to_customer_name: order.qoutation_to_customer_name,
          qoutation_to_customer_address: order.qoutation_to_customer_address,
          qoutation_to_customer_email: order.qoutation_to_customer_email,
          qoutation_to_customer_phone: order.qoutation_to_customer_phone,
          notes: order.notes,
          customer_ref: order.customer_ref,
        },

        sales_order: {
          status: stepStatus(order.Manual_SO_ref),
          SO_no: order.SO_no,
          manual_ref_no: order.Manual_SO_ref,
        },

        delivery_challan: {
          status: stepStatus(order.Manual_challan_no),
          challan_no: order.Challan_no,
          manual_challan_no: order.Manual_challan_no,
          driver_name: order.driver_name,
          driver_phone: order.driver_phone,
        },

        invoice: {
          status: stepStatus(order.Manual_invoice_no),
          invoice_no: order.invoice_no,
          manual_invoice_no: order.Manual_invoice_no,
          invoice_date: order.invoice_date,
          due_date: order.due_date,
        },

        payment: {
          status: stepStatus(order.Manual_payment_no),
          Payment_no: order.Payment_no,
          manual_payment_no: order.Manual_payment_no,
          payment_date: order.payment_date,
          amount_received: order.amount_received,
          balance: order.balance,
          total_invoice: order.total_invoice,
          payment_note: order.payment_note,
        },
      },

      items: order.salesorderitems,

      additional_info: {
        files: order.files || [],
        signature_url: order.signature_url,
        photo_url: order.photo_url,
        attachment_url: order.attachment_url,
      },

      sub_total: order.subtotal,
      total: order.total,
    };

    return res.status(200).json({
      success: true,
      message: `Sales Order with ID ${id} fetched successfully`,
      data: formattedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the sales order",
      error: error.message,
    });
  }
};

export const deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const salesOrder = await prisma.salesorder.findUnique({
      where: { id: Number(id) },
    });

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    // Delete child items first
    await prisma.salesorderitems.deleteMany({
      where: { sales_order_id: Number(id) },
    });

    // Delete parent order
    await prisma.salesorder.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete sales order",
      error: error.message,
    });
  }
};
