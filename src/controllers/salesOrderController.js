import prisma from "../config/db.js";
import { v2 as cloudinary } from 'cloudinary';
import { AccountingService } from "../services/AccountingService.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// ✅ Create or Update Sales Order
export const createOrUpdateSalesOrder = async (req, res) => {
  try {
    const body = { ...req.body };
    const orderId = req.method === "PUT" ? Number(req.params.id) : null;
    if (!body.company_info) body.company_info = {};
    if (!body.additional_info) body.additional_info = {};

    let existingOrder = null;
    let existingItems = [];

    // ================= EXISTING ORDER (FOR PUT) =================
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

      existingItems = existingOrder.salesorderitems || [];
    }

    // ================= FILE UPLOADS (MULTER + CLOUDINARY) =================
    if (req.files) {
      // MULTIPLE IMAGES: files[]
      if (req.files.files) {
        const filesArr = Array.isArray(req.files.files)
          ? req.files.files
          : [req.files.files];

        body.additional_info.files = [];

        for (const file of filesArr) {
          const url = await uploadToCloudinary(file, "sales_order_files");
          if (url) body.additional_info.files.push(url);
        }
      }

      // SINGLE FILE: logo_url
      if (req.files.logo_url) {
        const logoFile = Array.isArray(req.files.logo_url)
          ? req.files.logo_url[0]
          : req.files.logo_url;

        const url = await uploadToCloudinary(logoFile, "sales_logo");
        if (url) body.company_info.logo_url = url;
      }

      // SINGLE FILE: signature_url
      if (req.files.signature_url) {
        const file = Array.isArray(req.files.signature_url)
          ? req.files.signature_url[0]
          : req.files.signature_url;

        const url = await uploadToCloudinary(file, "sales_signature");
        if (url) body.additional_info.signature_url = url;
      }

      // SINGLE FILE: photo_url
      if (req.files.photo_url) {
        const file = Array.isArray(req.files.photo_url)
          ? req.files.photo_url[0]
          : req.files.photo_url;

        const url = await uploadToCloudinary(file, "sales_photo");
        if (url) body.additional_info.photo_url = url;
      }

      if (req.files.attachment_url) {
        // Ensure we are always working with an array
        const attachmentFiles = Array.isArray(req.files.attachment_url)
          ? req.files.attachment_url
          : [req.files.attachment_url];

        const attachmentUrls = [];
        // Loop through each file, upload it, and collect the URL
        for (const file of attachmentFiles) {
          const url = await uploadToCloudinary(file, "sales_attachment");
          if (url) {
            attachmentUrls.push(url);
          }
        }

        // Convert the array of URLs to a single JSON string to be stored in the DB
        if (attachmentUrls.length > 0) {
          body.additional_info.attachment_url = JSON.stringify(attachmentUrls);
        }
      }
    }

    //Safe helper to preserve existing values
    const safeMerge = (oldObj = {}, newObj = {}) => {
      const merged = { ...oldObj };
      for (const key in newObj) {
        if (
          newObj[key] !== undefined &&
          newObj[key] !== null &&
          newObj[key] !== ""
        ) {
          merged[key] = newObj[key];
        }
      }
      return merged;
    };

    // ================= STEP COMPLETION RULES =================
    const stepRequired = {
      quotation: ["quotation_no", "quotation_date"],
      sales_order: ["SO_no"],
      delivery_challan: ["challan_no"],
      invoice: ["invoice_no", "invoice_date"],
      payment: ["payment_no", "amount_received"],
    };

    const stepCompleted = (obj, required) =>
      required.every(
        (f) => obj?.[f] !== "" && obj?.[f] !== null && obj?.[f] !== undefined
      );

    // ================= MERGE STEPS =================
    const mergeStep = (stepName) =>
      orderId
        ? { ...existingOrder, ...(body.steps?.[stepName] || {}) }
        : body.steps?.[stepName] || {};

    const steps = {
      quotation: mergeStep("quotation"),
      sales_order: mergeStep("sales_order"),
      delivery_challan: mergeStep("delivery_challan"),
      invoice: mergeStep("invoice"),
      payment: mergeStep("payment"),
    };

    Object.keys(steps).forEach((step) => {
      steps[step].status = stepCompleted(steps[step], stepRequired[step])
        ? "completed"
        : "pending";
    });

    // ================= SHIPPING =================
    const shipping = body.shipping_details
      ? {
        bill_to_company_name: body.shipping_details.bill_to_name || "",
        bill_to_company_address: body.shipping_details.bill_to_address || "",
        bill_to_company_email: body.shipping_details.bill_to_email || "",
        bill_to_company_phone: body.shipping_details.bill_to_phone || "",
        bill_to_attention_name:
          body.shipping_details.bill_to_attention_name || "",

        ship_to_company_name: body.shipping_details.ship_to_name || "",
        ship_to_company_address: body.shipping_details.ship_to_address || "",
        ship_to_company_email: body.shipping_details.ship_to_email || "",
        ship_to_company_phone: body.shipping_details.ship_to_phone || "",
        ship_to_attention_name:
          body.shipping_details.ship_to_attention_name || "",
      }
      : orderId
        ? {
          bill_to_company_name: existingOrder.bill_to_company_name,
          bill_to_company_address: existingOrder.bill_to_company_address,
          bill_to_company_email: existingOrder.bill_to_company_email,
          bill_to_company_phone: existingOrder.bill_to_company_phone,
          bill_to_attention_name: existingOrder.bill_to_attention_name,

          ship_to_company_name: existingOrder.ship_to_company_name,
          ship_to_company_address: existingOrder.ship_to_company_address,
          ship_to_company_email: existingOrder.ship_to_company_email,
          ship_to_company_phone: existingOrder.ship_to_company_phone,
          ship_to_attention_name: existingOrder.ship_to_attention_name,
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
        logo_url: body.company_info.logo_url || "",
        bank_name: body.company_info.bank_name || "",
        account_no: body.company_info.account_no || "",
        account_holder: body.company_info.account_holder || "",
        ifsc_code: body.company_info.ifsc_code || "",
        terms: body.company_info.terms || "",
      }
      : orderId
        ? existingOrder
        : {};

    // ================= ITEMS =================
    const itemsData = body.items
      ? body.items.map((i) => ({
        item_name: i.item_name,
        qty: Number(i.qty),
        rate: Number(i.rate),
        tax_percent: Number(i.tax_percent),
        discount: Number(i.discount),
        amount: Number(i.amount),
        warehouse_id: i.warehouse_id ? Number(i.warehouse_id) : null,
        product_id: i.product_id ? Number(i.product_id) : null,
      }))
      : existingItems;

    // ================= DB DATA =================
    const dbData = {
      ...companyData,
      ...shipping,

      quotation_no: steps.quotation.quotation_no || "",
      manual_quo_no: steps.quotation.manual_quo_no || "",
      quotation_date: steps.quotation.quotation_date
        ? new Date(steps.quotation.quotation_date)
        : null,
      valid_till: steps.quotation.valid_till
        ? new Date(steps.quotation.valid_till)
        : null,
      quotation_status: steps.quotation.status,
      qoutation_to_customer_name: steps.quotation.qoutation_to_customer_name,
      qoutation_to_customer_address:
        steps.quotation.qoutation_to_customer_address,
      qoutation_to_customer_email: steps.quotation.qoutation_to_customer_email,
      qoutation_to_customer_phone: steps.quotation.qoutation_to_customer_phone,
      notes: steps.quotation.notes,
      customer_ref: steps.quotation.customer_ref,

      SO_no: steps.sales_order.SO_no,
      Manual_SO_ref: steps.sales_order.manual_ref_no,
      manual_quo_no: steps.sales_order.manual_quo_no,
      sales_order_status: steps.sales_order.status,

      Challan_no: steps.delivery_challan.challan_no,
      Manual_challan_no: steps.delivery_challan.manual_challan_no,
      delivery_challan_status: steps.delivery_challan.status,
      driver_name: steps.delivery_challan.driver_name,
      driver_phone: steps.delivery_challan.driver_phone,

      invoice_no: steps.invoice.invoice_no,
      Manual_invoice_no: steps.invoice.manual_invoice_no,
      invoice_date: steps.invoice.invoice_date
        ? new Date(steps.invoice.invoice_date)
        : null,
      due_date: steps.invoice.due_date
        ? new Date(steps.invoice.due_date)
        : null,
      invoice_status: steps.invoice.status,

      Payment_no: steps.payment.payment_no || "",
      Manual_payment_no: steps.payment.manual_payment_no || "",
      payment_date: steps.payment.payment_date
        ? new Date(steps.payment.payment_date)
        : null,
      payment_status: steps.payment.status,
      amount_received: Number(steps.payment.amount_received) || 0,
      payment_note: steps.payment.payment_note || "",

      signature_url:
        body.additional_info.signature_url ||
        existingOrder?.signature_url ||
        "",
      photo_url:
        body.additional_info.photo_url || existingOrder?.photo_url || "",
      attachment_url:
        body.additional_info.attachment_url ||
        existingOrder?.attachment_url ||
        "",

      subtotal: body.sub_total
        ? Number(body.sub_total)
        : existingOrder?.subtotal || 0,
      total: body.total ? Number(body.total) : existingOrder?.total || 0,
      updated_at: new Date(),
      total_invoice:
        steps.payment.total_invoice !== undefined
          ? Number(steps.payment.total_invoice)
          : existingOrder?.total_invoice || 0,

      balance:
        steps.payment.balance !== undefined
          ? Number(steps.payment.balance)
          : existingOrder?.balance || 0,
    };

    // ================= CREATE OR UPDATE =================
    let savedOrder;

    if (orderId) {
      // ================= PUT (UPDATE) LOGIC =================
      if (body.items && Array.isArray(body.items)) {
        savedOrder = await prisma.$transaction(async (tx) => {
          // --- Step 1: Handle item deletions and restore stock ---
          const incomingItemIds = body.items
            .filter((item) => item.id)
            .map((item) => item.id);

          const itemsToDelete = await tx.salesorderitems.findMany({
            where: {
              sales_order_id: orderId,
              ...(incomingItemIds.length > 0 && {
                id: { notIn: incomingItemIds },
              }),
            },
          });

          for (const itemToDelete of itemsToDelete) {

            // ✅ ONLY INVENTORY ITEMS
            if (!itemToDelete.product_id) continue;

            // ✅ RESTORE PRODUCT MASTER STOCK
            await tx.products.update({
              where: { id: itemToDelete.product_id },
              data: {
                total_stock: { increment: Number(itemToDelete.qty) },
              },
            });

            // ✅ RESTORE WAREHOUSE STOCK (if warehouse exists)
            if (itemToDelete.warehouse_id) {
              await tx.product_warehouses.update({
                where: {
                  product_id_warehouse_id: {
                    product_id: itemToDelete.product_id,
                    warehouse_id: itemToDelete.warehouse_id,
                  },
                },
                data: {
                  stock_qty: { increment: Number(itemToDelete.qty) },
                },
              });
            }
          }



          if (itemsToDelete.length > 0) {
            await tx.salesorderitems.deleteMany({
              where: { id: { in: itemsToDelete.map((item) => item.id) } },
            });
          }

          // --- Step 2: Process item updates and creations ---
          for (const item of body.items) {
            const itemData = {
              item_name: item.item_name,
              qty: Number(item.qty),
              rate: Number(item.rate),
              tax_percent: Number(item.tax_percent),
              discount: Number(item.discount),
              amount: Number(item.amount),
              warehouse_id: item.warehouse_id
                ? Number(item.warehouse_id)
                : null,
              product_id: item.product_id ? Number(item.product_id) : null,
            };

            if (item.product_id) {
              await tx.products.update({
                where: { id: item.product_id },
                data: {
                  item_name: item.item_name,
                  sale_price: Number(item.rate),
                  // ❌ total_stock yahan kabhi mat touch karo
                },
              });
            }


            if (item.warehouse_id && item.product_id) {
              let existingItemQty = 0;
              if (item.id) {
                const existingItem = await tx.salesorderitems.findUnique({
                  where: { id: item.id },
                  select: { qty: true },
                });
                existingItemQty = existingItem ? Number(existingItem.qty) : 0;
              }
              const netQtyChange = Number(item.qty) - existingItemQty;

              if (netQtyChange !== 0) {

                // ✅ PRODUCT MASTER STOCK UPDATE
                await tx.products.update({
                  where: { id: item.product_id },
                  data: {
                    total_stock:
                      netQtyChange > 0
                        ? { decrement: netQtyChange }   // more sold
                        : { increment: Math.abs(netQtyChange) }, // qty reduced
                  },
                });

                // ✅ WAREHOUSE STOCK UPDATE
                await tx.product_warehouses.upsert({
                  where: {
                    product_id_warehouse_id: {
                      product_id: item.product_id,
                      warehouse_id: item.warehouse_id,
                    },
                  },
                  update: {
                    stock_qty:
                      netQtyChange > 0
                        ? { decrement: netQtyChange }
                        : { increment: Math.abs(netQtyChange) },
                  },
                  create: {
                    product_id: item.product_id,
                    warehouse_id: item.warehouse_id,
                    stock_qty: -netQtyChange,
                  },
                });
              }
            }

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

          // --- Step 3: Update the main salesorder record ---
          const mergedData = safeMerge(existingOrder, dbData);
          const { salesorderitems, ...dataForUpdate } = mergedData;

          return await tx.salesorder.update({
            where: { id: orderId },
            data: dataForUpdate,
            include: { salesorderitems: true },
          });
        });
      } else {
        // --- If no items are sent, just update the main order fields ---
        const mergedData = safeMerge(existingOrder, dbData);
        const { salesorderitems, ...dataForUpdate } = mergedData;

        savedOrder = await prisma.salesorder.update({
          where: { id: orderId },
          data: dataForUpdate,
          include: { salesorderitems: true },
        });
      }
    } else {
      // The CREATE logic remains the same
      savedOrder = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.salesorder.create({
          data: {
            ...dbData,
            created_at: new Date(),
          },
        });

        if (body.items && Array.isArray(body.items)) {
          for (const item of body.items) {
            const itemData = {
              item_name: item.item_name,
              qty: Number(item.qty),
              rate: Number(item.rate),
              tax_percent: Number(item.tax_percent),
              discount: Number(item.discount),
              amount: Number(item.amount),
              warehouse_id: item.warehouse_id
                ? Number(item.warehouse_id)
                : null,
              product_id: item.product_id ? Number(item.product_id) : null,
              sales_order_id: newOrder.id,
            };

            await tx.salesorderitems.create({ data: itemData });
            if (item.product_id) {
              await tx.products.update({
                where: { id: item.product_id },
                data: {
                  item_name: item.item_name,
                  sale_price: Number(item.rate),
                  total_stock: { decrement: Number(item.qty) }, // ✅ YAHI MISSING THA
                },
              });
            }



            if (item.warehouse_id && item.product_id) {
              await tx.product_warehouses.upsert({
                where: {
                  product_id_warehouse_id: {
                    product_id: item.product_id,
                    warehouse_id: item.warehouse_id,
                  },
                },
                update: {
                  stock_qty: { decrement: Number(item.qty) },
                },
                create: {
                  product_id: item.product_id,
                  warehouse_id: item.warehouse_id,
                  stock_qty: -Number(item.qty),
                },
              });
            }

          }
        }

        if (
          body.auto_invoice === true &&
          body.items &&
          Array.isArray(body.items)
        ) {
          const existingInvoice = await tx.pos_invoice.findFirst({
            where: {
              source: "SALES_ORDER",
              source_id: newOrder.id,
            },
          });

          if (!existingInvoice) {
            const invoice = await tx.pos_invoice.create({
              data: {
                company_id: newOrder.company_id,
                customer_id: body.customer_id || null,
                total: body.total ? Number(body.total) : newOrder.total,
                created_at: new Date(),
                source: "SALES_ORDER",
                source_id: newOrder.id,
              },
            });

            for (const item of body.items) {
              if (!item.product_id) continue;

              await tx.pos_invoice_products.create({
                data: {
                  invoice_id: invoice.id,
                  product_id: item.product_id,
                  warehouse_id: item.warehouse_id,
                  quantity: Number(item.qty),
                  price: Number(item.rate),
                  total: Number(item.qty) * Number(item.rate),
                },
              });
            }
          }
        }

        return await tx.salesorder.findUnique({
          where: { id: newOrder.id },
          include: { salesorderitems: true },
        });
      });
    }

    // ============ AUTO LEDGER POSTING ============
    if (savedOrder && (savedOrder.invoice_status === 'completed' || savedOrder.invoice_status === 'Completed') && savedOrder.invoice_no) {
      await AccountingService.postSalesInvoice(
        savedOrder,
        savedOrder.salesorderitems || [],
        savedOrder.company_id
      );
    }

    return res.status(200).json({
      success: true,
      message: orderId ? "Sales order updated" : "Sales order created",
      data: {
        sales_order_id: savedOrder.id,
        company_info: {
          company_id: savedOrder.company_id,
          company_name: savedOrder.company_name,
          company_address: savedOrder.company_address,
          company_email: savedOrder.company_email,
          company_phone: savedOrder.company_phone,
          logo_url: savedOrder.logo_url,
          bank_name: savedOrder.bank_name,
          account_no: savedOrder.account_no,
          account_holder: savedOrder.account_holder,
          ifsc_code: savedOrder.ifsc_code,
          terms: savedOrder.terms,
        },

        shipping_details: {
          bill_to_name: savedOrder.bill_to_company_name,
          bill_to_address: savedOrder.bill_to_company_address,
          bill_to_email: savedOrder.bill_to_company_email,
          bill_to_phone: savedOrder.bill_to_company_phone,
          bill_to_attention_name: savedOrder.bill_to_attention_name,

          ship_to_name: savedOrder.ship_to_company_name,
          ship_to_address: savedOrder.ship_to_company_address,
          ship_to_email: savedOrder.ship_to_company_email,
          ship_to_phone: savedOrder.ship_to_company_phone,
          ship_to_attention_name: savedOrder.ship_to_attention_name,
        },

        steps: {
          quotation: {
            status: savedOrder.quotation_status, // ← status added
            quotation_no: savedOrder.quotation_no,
            manual_quo_no: savedOrder.manual_quo_no,
            quotation_date: savedOrder.quotation_date,
            valid_till: savedOrder.valid_till,
            qoutation_to_customer_name: savedOrder.qoutation_to_customer_name,
            qoutation_to_customer_address:
              savedOrder.qoutation_to_customer_address,
            qoutation_to_customer_email: savedOrder.qoutation_to_customer_email,
            qoutation_to_customer_phone: savedOrder.qoutation_to_customer_phone,
            notes: savedOrder.notes,
            customer_ref: savedOrder.customer_ref,
          },

          sales_order: {
            status: savedOrder.sales_order_status, // ← added
            SO_no: savedOrder.SO_no,
            manual_ref_no: savedOrder.Manual_SO_ref,
            manual_quo_no: savedOrder.manual_quo_no,
          },

          delivery_challan: {
            status: savedOrder.delivery_challan_status, // ← added
            challan_no: savedOrder.Challan_no,
            manual_challan_no: savedOrder.Manual_challan_no,
            driver_name: savedOrder.driver_name,
            driver_phone: savedOrder.driver_phone,
          },

          invoice: {
            status: savedOrder.invoice_status, // ← added
            invoice_no: savedOrder.invoice_no,
            manual_invoice_no: savedOrder.Manual_invoice_no,
            invoice_date: savedOrder.invoice_date,
            due_date: savedOrder.due_date,
          },

          payment: {
            status: savedOrder.payment_status, // ← added
            payment_no: savedOrder.Payment_no,
            manual_payment_no: savedOrder.Manual_payment_no,
            payment_date: savedOrder.payment_date,
            amount_received: savedOrder.amount_received,
            balance: savedOrder.balance,
            payment_note: savedOrder.payment_note,
            total_invoice: savedOrder.total_invoice,
          },
        },

        items: savedOrder.salesorderitems,

        additional_info: {
          files: body.additional_info.files || existingOrder?.files || [],
          signature_url: savedOrder.signature_url,
          photo_url: savedOrder.photo_url,
          attachment_url: (() => {
            // If there's no attachment URL, return an empty array.
            if (!savedOrder.attachment_url) {
              return [];
            }

            try {
              // Try to parse it as a JSON array (the new format).
              const parsed = JSON.parse(savedOrder.attachment_url);
              // Ensure the result is an array, even if it was a single JSON string like '"url"'
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If parsing fails, it's the old format (a single URL string).
              // Wrap it in an array to maintain consistency for the frontend.
              return [savedOrder.attachment_url];
            }
          })(),
        },

        sub_total: savedOrder.subtotal,
        total: savedOrder.total,
      },
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

export const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Sales Order ID is required",
      });
    }

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
