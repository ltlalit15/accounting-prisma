import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import prisma from "../config/db.js";

export const createVendor = async (req, res) => {
  try {
    const {
      company_id,
      name_english,
      name_arabic,
      company_name,
      google_location,
      account_type,
      balance_type,
      account_name,
      account_balance,
      creation_date,
      bank_account_number,
      bank_ifsc,
      bank_name_branch,
      country,
      state,
      pincode,
      address,
      state_code,
      shipping_address,
      phone,
      email,
      credit_period_days,
      enable_gst,
      gstIn,
      type,
    } = req.body;

    if (!company_id || !name_english || !type) {
      return res.status(400).json({
        success: false,
        message: "company_id and name_english are required",
      });
    }

    // 📤 Upload files to Cloudinary
    let idCardImageUrl = null;
    let anyFileUrl = null;

    if (req.files?.id_card_image?.[0]) {
      idCardImageUrl = await uploadToCloudinary(
        req.files.id_card_image[0].buffer,
        "vendorsCustomer/id_cards"
      );
    }

    if (req.files?.any_file?.[0]) {
      anyFileUrl = await uploadToCloudinary(
        req.files.any_file[0].buffer,
        "vendorsCustomer/files"
      );
    }

    // ✅ Save Vendor
    const vendor = await prisma.vendorscustomer.create({
      data: {
        company_id: parseInt(company_id),
        name_english,
        name_arabic,
        company_name,
        google_location,
        id_card_image: idCardImageUrl,
        any_file: anyFileUrl,
        account_type,
        balance_type,
        account_name,
        account_balance: account_balance ? parseFloat(account_balance) : 0.0,
        creation_date: creation_date ? new Date(creation_date) : undefined,
        bank_account_number,
        bank_ifsc,
        bank_name_branch,
        country,
        state,
        pincode,
        address,
        state_code,
        shipping_address,
        phone,
        email,
        type,
        credit_period_days: credit_period_days
          ? parseInt(credit_period_days)
          : 0,
        enable_gst: enable_gst === true || enable_gst === "true",
        gstIn,
      },
    });

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("❌ Error creating vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendorscustomer.findMany({
      orderBy: { created_at: "desc" },
      include: { company: { select: { id: true, name: true, email: true } } },
    });
    res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const { type } = req.query;
    const vendors = await prisma.vendorscustomer.findMany({
      where: {
        company_id: parseInt(company_id),
        type,
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      success: true,
      message: `${type}s fetched successfully`,
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendor/customers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendorscustomer.findUnique({
      where: { id: parseInt(id) },
      include: { company: { select: { id: true, name: true } } },
    });

    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });

    res.status(200).json({
      success: true,
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const updateVendor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     const vendor = await prisma.vendorscustomer.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!vendor) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Vendor not found" });
//     }

//     let idCardImageUrl = vendor.id_card_image;
//     let anyFileUrl = vendor.any_file;

//     // ✅ If new ID card image uploaded → delete old from Cloudinary
//     if (req.files?.id_card_image?.[0]) {
//       if (vendor.id_card_image) {
//         const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
//         await deleteFromCloudinary(publicId);
//       }

//       const uploaded = await uploadToCloudinary(
//         req.files.id_card_image[0].buffer,
//         "vendorsCustomer/id_cards"
//       );
//       idCardImageUrl = uploaded;
//     }

//     // ✅ If new file uploaded → delete old from Cloudinary
//     if (req.files?.any_file?.[0]) {
//       if (vendor.any_file) {
//         const publicId = vendor.any_file.split("/").pop().split(".")[0];
//         await deleteFromCloudinary(publicId);
//       }

//       const uploaded = await uploadToCloudinary(
//         req.files.any_file[0].buffer,
//         "vendorsCustomer/files"
//       );
//       anyFileUrl = uploaded;
//     }

//     // ✅ Convert numeric fields safely
//     const numericData = {
//       company_id: data.company_id ? parseInt(data.company_id) : null,
//       account_balance: data.account_balance
//         ? parseFloat(data.account_balance)
//         : null,
//       credit_period_days: data.credit_period_days
//         ? parseInt(data.credit_period_days)
//         : null,
//       enable_gst: data.enable_gst === "1" || data.enable_gst === true, // handle boolean-like fields
//     };

//     // ✅ Merge and update vendor
//     const updatedVendor = await prisma.vendorscustomer.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...data,
//         ...numericData,
//         id_card_image: idCardImageUrl,
//         any_file: anyFileUrl,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Vendor updated successfully",
//       data: updatedVendor,
//     });
//   } catch (error) {
//     console.error("Error updating vendor:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateVendor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     const vendor = await prisma.vendorscustomer.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!vendor) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Vendor not found" });
//     }

//     let idCardImageUrl = vendor.id_card_image;
//     let anyFileUrl = vendor.any_file;

//     // =====================================================
//     //  SAFE DATE PARSER TO PREVENT PRISMA DATE ERRORS
//     // =====================================================
//     const safeDate = (val) => {
//       if (!val) return null;            // null allowed
//       const d = new Date(val);
//       return isNaN(d.getTime()) ? null : d;
//     };

//     // Convert the date fields before using them
//     data.creation_date = safeDate(data.creation_date);

//     // =====================================================
//     //  FILE UPLOAD HANDLING
//     // =====================================================

//     if (req.files?.id_card_image?.[0]) {
//       if (vendor.id_card_image) {
//         const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
//         await deleteFromCloudinary(publicId);
//       }

//       const uploaded = await uploadToCloudinary(
//         req.files.id_card_image[0].buffer,
//         "vendorsCustomer/id_cards"
//       );
//       idCardImageUrl = uploaded;
//     }

//     if (req.files?.any_file?.[0]) {
//       if (vendor.any_file) {
//         const publicId = vendor.any_file.split("/").pop().split(".")[0];
//         await deleteFromCloudinary(publicId);
//       }

//       const uploaded = await uploadToCloudinary(
//         req.files.any_file[0].buffer,
//         "vendorsCustomer/files"
//       );
//       anyFileUrl = uploaded;
//     }

//     // =====================================================
//     // NUMERIC FIELD SANITIZATION
//     // =====================================================
//     const numericData = {
//       company_id: data.company_id ? parseInt(data.company_id) : null,
//       account_balance: data.account_balance
//         ? parseFloat(data.account_balance)
//         : null,
//       credit_period_days: data.credit_period_days
//         ? parseInt(data.credit_period_days)
//         : null,
//       enable_gst: data.enable_gst === "1" || data.enable_gst === true,
//     };

//     // =====================================================
//     // MERGE & UPDATE
//     // =====================================================
//     const updatedVendor = await prisma.vendorscustomer.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...data,
//         ...numericData,
//         id_card_image: idCardImageUrl,
//         any_file: anyFileUrl,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Vendor updated successfully",
//       data: updatedVendor,
//     });
//   } catch (error) {
//     console.error("Error updating vendor:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;

    const vendor = await prisma.vendorscustomer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    let idCardImageUrl = vendor.id_card_image;
    let anyFileUrl = vendor.any_file;

    // ==========================================
    // SAFE DATE PARSER
    // ==========================================
    const safeDate = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    data.creation_date = safeDate(data.creation_date);

    // ==========================================
    // FIX FRONTEND WRONG FIELD NAMES
    // ==========================================

    // ❌ frontend sent account_balance_type
    // ✔ prisma needs balance_type
    if (data.account_balance_type) {
      data.balance_type = data.account_balance_type;
      delete data.account_balance_type;
    }

    // ==========================================
    // IMAGE HANDLING
    // ==========================================

    if (req.files?.id_card_image?.[0]) {
      if (vendor.id_card_image) {
        const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      idCardImageUrl = await uploadToCloudinary(
        req.files.id_card_image[0].buffer,
        "vendorsCustomer/id_cards"
      );
    }

    if (req.files?.any_file?.[0]) {
      if (vendor.any_file) {
        const publicId = vendor.any_file.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      anyFileUrl = await uploadToCloudinary(
        req.files.any_file[0].buffer,
        "vendorsCustomer/files"
      );
    }

    // ==========================================
    // NUMERIC & BOOLEAN SANITIZATION
    // ==========================================
    const numericData = {
      company_id: data.company_id ? Number(data.company_id) : vendor.company_id,
      account_balance: data.account_balance
        ? Number(data.account_balance)
        : vendor.account_balance,
      credit_period_days: data.credit_period_days
        ? Number(data.credit_period_days)
        : vendor.credit_period_days,

      enable_gst:
        data.enable_gst === "1" ||
        data.enable_gst === 1 ||
        data.enable_gst === true,

      // ENUM field must be "customer" or "vender"
      type:
        data.type === "customer" || data.type === "vender"
          ? data.type
          : vendor.type,
    };

    // ==========================================
    // FINAL UPDATE OBJECT
    // ==========================================
    const updatePayload = {
      ...data,
      ...numericData,
      id_card_image: idCardImageUrl,
      any_file: anyFileUrl,
    };

    const updatedVendor = await prisma.vendorscustomer.update({
      where: { id: parseInt(id) },
      data: updatePayload,
    });

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendorscustomer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    // ✅ Delete images/files from Cloudinary if they exist
    if (vendor.id_card_image) {
      const publicId = vendor.id_card_image.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    if (vendor.any_file) {
      const publicId = vendor.any_file.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    // ✅ Delete vendor record from DB
    await prisma.vendorscustomer.delete({ where: { id: parseInt(id) } });

    res.status(200).json({
      success: true,
      message: "vendorsCustomer and associated files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendorsCustomer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getVendorLedger = async (req, res) => {

//   try {
//     const { vendor_id, company_id } = req.params;
//     const { from_date, to_date } = req.query;

//     if (!vendor_id || !company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "vendor_id and company_id are required",
//       });
//     }

//     // 1️⃣ Get Vendor
//     const vendor = await prisma.vendorsCustomer.findUnique({
//       where: { id: Number(vendor_id) },
//       include: {
//         company: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             company_logo_url: true,
//           },
//         },
//       },
//     });

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     // 2️⃣ Build query filter
//     const where = {
//       company_id: Number(company_id),
//       OR: [
//         { from_id: Number(vendor_id) },
//         { account_type: "vendor" },
//         { from_type: "vendor" },
//       ],
//     };

//     if (from_date && to_date) {
//       where.date = {
//         gte: String(from_date),
//         lte: String(to_date),
//       };
//     }

//     // 3️⃣ Fetch transactions
//     const transactions = await prisma.transactions.findMany({
//       where,
//       orderBy: { id: "asc" },
//     });

//     let totalDebit = 0;
//     let totalCredit = 0;
//     const formattedTxns = [];

//     // 4️⃣ Opening Balance (place in correct side)
//     let currentBalance = 0;
//     let currentBalanceType = "Cr"; // default

//     if (vendor.account_balance && vendor.account_balance !== 0) {
//       const isDebit =
//         vendor.balance_type?.toLowerCase() === "dr" ||
//         vendor.balance_type?.toLowerCase() === "debit";
//       const isCredit =
//         vendor.balance_type?.toLowerCase() === "cr" ||
//         vendor.balance_type?.toLowerCase() === "credit";

//       const openingDebit = isDebit ? Number(vendor.account_balance) : 0;
//       const openingCredit = isCredit ? Number(vendor.account_balance) : 0;

//       currentBalance = Math.abs(openingCredit - openingDebit);
//       currentBalanceType = openingCredit > openingDebit ? "Cr" : "Dr";

//       formattedTxns.push({
//         date: vendor.creation_date
//           ? vendor.creation_date.toISOString().split("T")[0]
//           : "-",
//         particulars: "Opening Balance",
//         vch_no: "--",
//         vch_type: "Opening",
//         debit: openingDebit.toFixed(2),
//         credit: openingCredit.toFixed(2),
//         balance_type: currentBalanceType,
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });

//       totalDebit += openingDebit;
//       totalCredit += openingCredit;
//     }

//     // 5️⃣ Loop through transactions
//     transactions.forEach((t) => {
//       // Normalize balance_type
//       const type = (t.balance_type || "").toLowerCase();

//       const isDebit =
//         ["dr", "debit", "payment", "make payment"].includes(type);
//       const isCredit = ["cr", "credit", "purchase", "sales return"].includes(
//         type
//       );

//       const debit = isDebit ? Number(t.amount) : 0;
//       const credit = isCredit ? Number(t.amount) : 0;

//       totalDebit += debit;
//       totalCredit += credit;

//       // 🧮 Running balance update
//       if (currentBalanceType === "Cr") {
//         if (credit > 0) currentBalance += credit;
//         else if (debit > 0) currentBalance -= debit;
//       } else {
//         if (debit > 0) currentBalance += debit;
//         else if (credit > 0) currentBalance -= credit;
//       }

//       if (currentBalance < 0) {
//         currentBalance = Math.abs(currentBalance);
//         currentBalanceType = currentBalanceType === "Cr" ? "Dr" : "Cr";
//       }

//       formattedTxns.push({
//         date: t.date || "-",
//         particulars: t.note || "-",
//         vch_no: t.voucher_no || "-",
//         vch_type: t.voucher_type || "-",
//         debit: debit.toFixed(2),
//         credit: credit.toFixed(2),
//         balance_type: type,
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });
//     });

//     // 6️⃣ Outstanding balance
//     const outstandingBalance = totalCredit - totalDebit;
//     const finalType = outstandingBalance >= 0 ? "Cr" : "Dr";

//     // 7️⃣ Send response
//     res.json({
//       success: true,
//       vendor: {
//         id: vendor.id,
//         name: vendor.name_english,
//         company_name: vendor.company_name || "",
//         phone: vendor.phone,
//         email: vendor.email,
//         company_logo_url: vendor.company?.company_logo_url || null,
//       },
//       summary: {
//         total_payments: Number(totalDebit.toFixed(2)),
//         total_purchases: Number(totalCredit.toFixed(2)),
//         outstanding_balance: Math.abs(Number(outstandingBalance.toFixed(2))),
//         balance_type: finalType,
//       },
//       transactions: formattedTxns,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching vendor ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching vendor ledger",
//       error: error.message,
//     });
//   }
// };

// export const getVendorLedger = async (req, res) => {
//   try {
//     const { vendor_id, company_id } = req.params;
//     const { from_date, to_date } = req.query;

//     if (!vendor_id || !company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "vendor_id and company_id are required",
//       });
//     }

//     // 1️⃣ Get Vendor
//     const vendor = await prisma.vendorsCustomer.findUnique({
//       where: { id: Number(vendor_id) },
//       include: {
//         company: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             company_logo_url: true,
//           },
//         },
//       },
//     });

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     // 2️⃣ Build filter
//     const where = {
//       company_id: Number(company_id),
//       OR: [
//         { from_id: Number(vendor_id) },
//         { account_type: "vendor" },
//         { from_type: "vendor" },
//       ],
//     };

//     if (from_date && to_date) {
//       where.date = {
//         gte: String(from_date),
//         lte: String(to_date),
//       };
//     }

//     // 3️⃣ Fetch transactions
//     const transactions = await prisma.transactions.findMany({
//       where,
//       orderBy: { id: "asc" },
//     });

//     let totalDebit = 0;
//     let totalCredit = 0;
//     const formattedTxns = [];

//     // 4️⃣ Opening Balance
//     let currentBalance = 0;
//     let currentBalanceType = "Cr";

//     if (vendor.account_balance && vendor.account_balance !== 0) {
//       const isDebit =
//         vendor.balance_type?.toLowerCase() === "dr" ||
//         vendor.balance_type?.toLowerCase() === "debit";
//       const isCredit =
//         vendor.balance_type?.toLowerCase() === "cr" ||
//         vendor.balance_type?.toLowerCase() === "credit";

//       const openingDebit = isDebit ? Number(vendor.account_balance) : 0;
//       const openingCredit = isCredit ? Number(vendor.account_balance) : 0;

//       currentBalance = Math.abs(openingCredit - openingDebit);
//       currentBalanceType = openingCredit > openingDebit ? "Cr" : "Dr";

//       formattedTxns.push({
//         date: vendor.creation_date
//           ? vendor.creation_date.toISOString().split("T")[0]
//           : "-",
//         particulars: "Opening Balance",
//         vch_no: "--",
//         vch_type: "Opening",
//         debit: openingDebit.toFixed(2),
//         credit: openingCredit.toFixed(2),
//         balance_type: currentBalanceType,
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });

//       totalDebit += openingDebit;
//       totalCredit += openingCredit;
//     }

//     // 5️⃣ Loop over transactions
//     transactions.forEach((t) => {
//       const type = (t.balance_type || "").toLowerCase();
//       const voucherType = (t.voucher_type || "").toLowerCase();

//       // Better classification
//       const isDebit =
//         ["dr", "debit", "payment", "make payment"].includes(type) ||
//         ["payment", "purchase return"].includes(voucherType);

//       const isCredit =
//         ["cr", "credit", "purchase"].includes(type) ||
//         ["purchase"].includes(voucherType);

//       const debit = isDebit ? Number(t.amount) : 0;
//       const credit = isCredit ? Number(t.amount) : 0;

//       totalDebit += debit;
//       totalCredit += credit;

//       // 🧮 Running balance logic
//       if (currentBalanceType === "Cr") {
//         if (credit > 0) currentBalance += credit;
//         else if (debit > 0) currentBalance -= debit;
//       } else {
//         if (debit > 0) currentBalance += debit;
//         else if (credit > 0) currentBalance -= credit;
//       }

//       if (currentBalance < 0) {
//         currentBalance = Math.abs(currentBalance);
//         currentBalanceType = currentBalanceType === "Cr" ? "Dr" : "Cr";
//       }

//       formattedTxns.push({
//         date: t.date || "-",
//         particulars: t.note || "-",
//         vch_no: t.voucher_no || "-",
//         vch_type: t.voucher_type || "-",
//         debit: debit.toFixed(2),
//         credit: credit.toFixed(2),
//         balance_type: currentBalanceType, // ✅ fixed
//         balance: `₹${currentBalance.toLocaleString("en-IN", {
//           minimumFractionDigits: 2,
//         })} ${currentBalanceType}`,
//       });
//     });

//     // 6️⃣ Outstanding Balance
//     const outstandingBalance = totalCredit - totalDebit;
//     const finalType = outstandingBalance >= 0 ? "Cr" : "Dr";

//     // 7️⃣ Send response
//     res.json({
//       success: true,
//       vendor: {
//         id: vendor.id,
//         name: vendor.name_english,
//         company_name: vendor.company_name || "",
//         phone: vendor.phone,
//         email: vendor.email,
//         company_logo_url: vendor.company?.company_logo_url || null,
//       },
//       summary: {
//         total_payments: Number(totalDebit.toFixed(2)),
//         total_purchases: Number(totalCredit.toFixed(2)),
//         outstanding_balance: Math.abs(Number(outstandingBalance.toFixed(2))),
//         balance_type: finalType,
//       },
//       transactions: formattedTxns,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching vendor ledger:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching vendor ledger",
//       error: error.message,
//     });
//   }
// };

// export const getTransactionSummary = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     if (!company_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID is required",
//       });
//     }

//     const companyId = parseInt(company_id);

//     // 🧩 Query counts from each relevant table
//     const [
//       openingBalanceCount,
//       purchaseCount,
//       paymentCount,
//       purchaseReturnCount,
//       expenseCount,
//       receiptCount,
//       salesReturnCount,
//       manufacturingCount,
//       stockJournalCount,
//       stockAdjustmentCount,
//       bankingCount,
//       journalCount,
//     ] = await Promise.all([
//       // Opening Balance (from accounts)
//       prisma.accounts.count({
//         where: { company_id: companyId },
//       }),

//       // Purchase (from purchaseorder)
//       prisma.purchaseorder.count({
//         where: { company_id: companyId },
//       }),

//       // Payment (from expensevouchers)
//       prisma.expensevouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Purchase Return
//       prisma.purchase_return.count({
//         where: { company_id: companyId },
//       }),

//       // Expense (also from expensevouchers)
//       prisma.expensevouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Receipt (from income_vouchers)
//       prisma.income_vouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Sales Return
//       prisma.sales_return.count({
//         where: { company_id: companyId },
//       }),

//       // Manufacturing (no direct model found, return 0 for now)
//       Promise.resolve(0),

//       // Stock Journal (transfers)
//       prisma.transfers.count({
//         where: { company_id: companyId },
//       }),

//       // Stock Adjustment
//       prisma.adjustments.count({
//         where: { company_id: companyId },
//       }),

//       // Banking (contra_vouchers)
//       prisma.contra_vouchers.count({
//         where: { company_id: companyId },
//       }),

//       // Journal (vouchers)
//       prisma.vouchers.count({
//         where: { company_id: companyId },
//       }),
//     ]);

//     // 🧾 Combine results
//     const summary = {
//       "Opening Balance": openingBalanceCount,
//       "Purchase": purchaseCount,
//       "Payment": paymentCount,
//       "Purchase Return": purchaseReturnCount,
//       "Expense": expenseCount,
//       "Receipt": receiptCount,
//       "Sales Return": salesReturnCount,
//       "Manufacturing": manufacturingCount,
//       "Stock Journal": stockJournalCount,
//       "Stock Adjustment": stockAdjustmentCount,
//       "Banking": bankingCount,
//       "Journal": journalCount,
//     };

//     const totalTransactions = Object.values(summary).reduce((a, b) => a + b, 0);

//     return res.status(200).json({
//       success: true,
//       message: "✅ Transaction summary fetched successfully",
//       data: {
//         ...summary,
//         "Total Transactions": totalTransactions,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching transaction summary:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const getVendorLedger = async (req, res) => {
  try {
    // Match the route param names
    const { vendor_id, company_id } = req.params;

    const vendorIdNum = Number(vendor_id);
    const companyIdNum = Number(company_id);

    if (isNaN(vendorIdNum) || isNaN(companyIdNum)) {
      return res.status(400).json({ message: "Invalid vendor or company ID" });
    }

    // --- Fetch Vendor Info ---
    const vendor = await prisma.vendorscustomer.findUnique({
      where: { id: vendorIdNum },
      include: {
        company: {
          select: {
            name: true,
            email: true,
            phone: true,
            // company_logo_url: true,
          },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // --- Fetch All Transactions ---
    const [purchases, purchaseReturns, payments] = await Promise.all([
      prisma.purchaseorder.findMany({
        where: {
          company_id: companyIdNum,
          bill_to_vendor_name: vendor.name_english,
        },
        include: { purchaseorderitems: true },
      }),

      prisma.purchase_return.findMany({
        where: {
          company_id: companyIdNum,
          vendor_id: vendorIdNum,
        },
        include: { purchase_return_items: true },
      }),

      prisma.expensevouchers.findMany({
        where: {
          company_id: companyIdNum,
          expensevoucher_items: { some: { vendor_id: vendorIdNum } },
        },
        include: { expensevoucher_items: true },
      }),
    ]);

    // --- Prepare Transactions ---
    const transactions = [];
    let openingBalance = 0;

    if (vendor.account_balance && vendor.account_balance !== 0) {
      const type = vendor.balance_type || "Dr";
      openingBalance = type === "Dr" ? vendor.account_balance : -vendor.account_balance;

      transactions.push({
        date: vendor.creation_date || vendor.created_at || new Date(),
        particulars: "Opening Balance",
        vch_type: "Opening",
        vch_no: "--",
        debit: type === "Dr" ? vendor.account_balance : 0,
        credit: type === "Cr" ? vendor.account_balance : 0,
        balance: openingBalance,
        items: [],
      });
    }

    let runningBalance = openingBalance;

    // 🧾 Purchases (Debit)
    purchases.forEach((p) => {
      const total = p.total.toNumber();
      runningBalance += total;
      transactions.push({
        date: p.created_at,
        particulars: `Purchase Invoice ${p.PO_no || ""}`,
        vch_type: "Purchase",
        vch_no: p.PO_no,
        debit: total,
        credit: 0,
        balance: runningBalance,
        items: p.purchaseorderitems.map((i) => ({
          item_name: i.item_name,
          quantity: i.qty.toNumber(),
          rate: i.rate.toNumber(),
          value: i.amount.toNumber(),
        })),
      });
    });

    // 🔁 Purchase Returns (Credit)
    purchaseReturns.forEach((r) => {
      const total = r.grand_total.toNumber();
      runningBalance -= total;
      transactions.push({
        date: r.return_date,
        particulars: `Purchase Return ${r.return_no}`,
        vch_type: "Purchase Return",
        vch_no: r.return_no,
        debit: 0,
        credit: total,
        balance: runningBalance,
        items: r.purchase_return_items.map((i) => ({
          item_name: i.item_name,
          quantity: i.quantity.toNumber(),
          rate: i.rate.toNumber(),
          value: i.amount.toNumber(),
        })),
      });
    });

    // 💵 Payments (Credit)
    payments.forEach((p) => {
      const total = p.total_amount?.toNumber() || 0;
      runningBalance -= total;
      transactions.push({
        date: p.voucher_date,
        particulars: `Payment ${p.auto_receipt_no}`,
        vch_type: "Payment",
        vch_no: p.auto_receipt_no,
        debit: 0,
        credit: total,
        balance: runningBalance,
        items: [],
      });
    });

    // --- Sort by Date ---
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- Transaction Summary ---
    const transactionSummary = {
      opening_balance: vendor.account_balance ? 1 : 0,
      purchase: purchases.length,
      payment: payments.length,
      purchase_return: purchaseReturns.length,
      receipt: 0,
      sales_return: 0,
      manufacturing: 0,
      stock_journal: 0,
      stock_adjustment: 0,
      banking: 0,
      journal: 0,
    };

    const totalTransactions = Object.values(transactionSummary).reduce((a, b) => a + b, 0);

    // --- Ledger Summary ---
    const totalPurchase = purchases.reduce((a, b) => a + b.total.toNumber(), 0);
    const totalPayment = payments.reduce((a, b) => a + (b.total_amount?.toNumber() || 0), 0);
    const totalReturn = purchaseReturns.reduce((a, b) => a + b.grand_total.toNumber(), 0);

    const closingBalance = openingBalance + totalPurchase - (totalPayment + totalReturn);

    const ledgerSummary = {
      opening_balance: Math.abs(vendor.account_balance || 0),
      opening_balance_type: vendor.balance_type || "Dr",
      total_purchases: totalPurchase,
      total_returns: totalReturn,
      total_payments: totalPayment,
      balance: Math.abs(closingBalance),
      balance_type: closingBalance > 0 ? "Cr" : "Dr",
    };

    // --- Response ---
    return res.status(200).json({
      vendor,
      transactions,
      ledger_summary: ledgerSummary,
      transaction_summary: {
        ...transactionSummary,
        total_transactions: totalTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor ledger:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


// export const getCustomerLedger = async (req, res) => {
//   try {
//     // Match the route param names
//     const { customer_id, company_id } = req.params;

//     const customerIdNum = Number(customer_id);
//     const companyIdNum = Number(company_id);

//     if (isNaN(customerIdNum) || isNaN(companyIdNum)) {
//       return res.status(400).json({ message: "Invalid customer or company ID" });
//     }

//     // --- Fetch Customer Info ---
//     const customer = await prisma.vendorscustomer.findUnique({
//       where: { id: customerIdNum },
//       include: {
//         company: {
//           select: {
//             name: true,
//             email: true,
//             phone: true,
//           },
//         },
//       },
//     });

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // --- Fetch All Transactions ---
//     const [sales, salesReturns, receipts] = await Promise.all([
//       prisma.salesorder.findMany({
//         where: {
//           company_id: companyIdNum,
//           bill_to_customer_name: customer.name_english,
//         },
//         include: { salesorderitems: true },
//       }),

//       prisma.sales_return.findMany({
//         where: {
//           company_id: companyIdNum,
//           customer_id: customerIdNum,
//         },
//         include: { sales_return_items: true },
//       }),

//       prisma.receipts.findMany({
//         where: {
//           company_id: companyIdNum,
//           receipt_items: { some: { customer_id: customerIdNum } },
//         },
//         include: { receipt_items: true },
//       }),
//     ]);

//     // --- Prepare Transactions ---
//     const transactions = [];
//     let openingBalance = 0;

//     if (customer.account_balance && customer.account_balance !== 0) {
//       const type = customer.balance_type || "Cr";
//       openingBalance = type === "Dr" ? customer.account_balance : -customer.account_balance;

//       transactions.push({
//         date: customer.creation_date || customer.created_at || new Date(),
//         particulars: "Opening Balance",
//         vch_type: "Opening",
//         vch_no: "--",
//         debit: type === "Dr" ? customer.account_balance : 0,
//         credit: type === "Cr" ? customer.account_balance : 0,
//         balance: openingBalance,
//         items: [],
//       });
//     }

//     let runningBalance = openingBalance;

//     // 🧾 Sales (Credit)
//     sales.forEach((s) => {
//       const total = s.total.toNumber();
//       runningBalance -= total;
//       transactions.push({
//         date: s.created_at,
//         particulars: `Sales Invoice ${s.SO_no || ""}`,
//         vch_type: "Sales",
//         vch_no: s.SO_no,
//         debit: 0,
//         credit: total,
//         balance: runningBalance,
//         items: s.salesorderitems.map((i) => ({
//           item_name: i.item_name,
//           quantity: i.qty.toNumber(),
//           rate: i.rate.toNumber(),
//           value: i.amount.toNumber(),
//         })),
//       });
//     });

//     // 🔁 Sales Returns (Debit)
//     salesReturns.forEach((r) => {
//       const total = r.grand_total.toNumber();
//       runningBalance += total;
//       transactions.push({
//         date: r.return_date,
//         particulars: `Sales Return ${r.return_no}`,
//         vch_type: "Sales Return",
//         vch_no: r.return_no,
//         debit: total,
//         credit: 0,
//         balance: runningBalance,
//         items: r.sales_return_items.map((i) => ({
//           item_name: i.item_name,
//           quantity: i.quantity.toNumber(),
//           rate: i.rate.toNumber(),
//           value: i.amount.toNumber(),
//         })),
//       });
//     });

//     // 💵 Receipts (Debit)
//     receipts.forEach((r) => {
//       const total = r.total_amount?.toNumber() || 0;
//       runningBalance += total;
//       transactions.push({
//         date: r.receipt_date,
//         particulars: `Receipt ${r.auto_receipt_no}`,
//         vch_type: "Receipt",
//         vch_no: r.auto_receipt_no,
//         debit: total,
//         credit: 0,
//         balance: runningBalance,
//         items: [],
//       });
//     });

//     // --- Sort by Date ---
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // --- Transaction Summary ---
//     const transactionSummary = {
//       opening_balance: customer.account_balance ? 1 : 0,
//       sales: sales.length,
//       receipt: receipts.length,
//       sales_return: salesReturns.length,
//       purchase_return: 0,
//       banking: 0,
//       journal: 0,
//     };

//     const totalTransactions = Object.values(transactionSummary).reduce((a, b) => a + b, 0);

//     // --- Ledger Summary ---
//     const totalSales = sales.reduce((a, b) => a + b.total.toNumber(), 0);
//     const totalReceipt = receipts.reduce((a, b) => a + (b.total_amount?.toNumber() || 0), 0);
//     const totalReturn = salesReturns.reduce((a, b) => a + b.grand_total.toNumber(), 0);

//     const closingBalance = openingBalance - totalSales + (totalReturn + totalReceipt);

//     const ledgerSummary = {
//       opening_balance: Math.abs(customer.account_balance || 0),
//       opening_balance_type: customer.balance_type || "Cr",
//       total_sales: totalSales,
//       total_returns: totalReturn,
//       total_receipts: totalReceipt,
//       balance: Math.abs(closingBalance),
//       balance_type: closingBalance > 0 ? "Dr" : "Cr",
//     };

//     // --- Response ---
//     return res.status(200).json({
//       customer,
//       transactions,
//       ledger_summary: ledgerSummary,
//       transaction_summary: {
//         ...transactionSummary,
//         total_transactions: totalTransactions,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching customer ledger:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };


// export const getCustomerLedger = async (req, res) => {
//   try {
//     // Match the route param names
//     const { customer_id, company_id } = req.params;

//     const customerIdNum = Number(customer_id);
//     const companyIdNum = Number(company_id);

//     if (isNaN(customerIdNum) || isNaN(companyIdNum)) {
//       return res.status(400).json({ message: "Invalid customer or company ID" });
//     }

//     // --- Fetch Customer Info ---
//     const customer = await prisma.vendorscustomer.findUnique({
//       where: { id: customerIdNum },
//       include: {
//         company: {
//           select: {
//             name: true,
//             email: true,
//             phone: true,
//           },
//         },
//       },
//     });

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // --- Fetch All Transactions ---
//     const [sales, salesReturns] = await Promise.all([
//       prisma.salesorder.findMany({
//         where: {
//           company_id: companyIdNum,
//           bill_to_customer_name: customer.name_english,
//         },
//         include: { salesorderitems: true },
//       }),

//       prisma.sales_return.findMany({
//         where: {
//           company_id: companyIdNum,
//           customer_id: customerIdNum,
//         },
//         include: { sales_return_items: true },
//       }),
//     ]);

//     // --- Prepare Transactions ---
//     const transactions = [];
//     let openingBalance = 0;

//     if (customer.account_balance && customer.account_balance !== 0) {
//       const type = customer.balance_type || "Cr";
//       openingBalance = type === "Dr" ? customer.account_balance : -customer.account_balance;

//       transactions.push({
//         date: customer.creation_date || customer.created_at || new Date(),
//         particulars: "Opening Balance",
//         vch_type: "Opening",
//         vch_no: "--",
//         debit: type === "Dr" ? customer.account_balance : 0,
//         credit: type === "Cr" ? customer.account_balance : 0,
//         balance: openingBalance,
//         items: [],
//       });
//     }

//     let runningBalance = openingBalance;

//     // 🧾 Sales (Credit)
//     sales.forEach((s) => {
//       const total = s.total.toNumber();
//       runningBalance -= total;
//       transactions.push({
//         date: s.created_at,
//         particulars: `Sales Invoice ${s.SO_no || ""}`,
//         vch_type: "Sales",
//         vch_no: s.SO_no,
//         debit: 0,
//         credit: total,
//         balance: runningBalance,
//         items: s.salesorderitems.map((i) => ({
//           item_name: i.item_name,
//           quantity: i.qty.toNumber(),
//           rate: i.rate.toNumber(),
//           value: i.amount.toNumber(),
//         })),
//       });
//     });

//     // 🔁 Sales Returns (Debit)
//     salesReturns.forEach((r) => {
//       const total = r.grand_total.toNumber();
//       runningBalance += total;
//       transactions.push({
//         date: r.return_date,
//         particulars: `Sales Return ${r.return_no}`,
//         vch_type: "Sales Return",
//         vch_no: r.return_no,
//         debit: total,
//         credit: 0,
//         balance: runningBalance,
//         items: r.sales_return_items.map((i) => ({
//           item_name: i.item_name,
//           quantity: i.quantity.toNumber(),
//           rate: i.rate.toNumber(),
//           value: i.amount.toNumber(),
//         })),
//       });
//     });

//     // --- Sort by Date ---
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // --- Transaction Summary ---
//     const transactionSummary = {
//       opening_balance: customer.account_balance ? 1 : 0,
//       sales: sales.length,
//       sales_return: salesReturns.length,
//       purchase_return: 0,
//       banking: 0,
//       journal: 0,
//     };

//     const totalTransactions = Object.values(transactionSummary).reduce((a, b) => a + b, 0);

//     // --- Ledger Summary ---
//     const totalSales = sales.reduce((a, b) => a + b.total.toNumber(), 0);
//     const totalReturn = salesReturns.reduce((a, b) => a + b.grand_total.toNumber(), 0);

//     const closingBalance = openingBalance - totalSales + totalReturn;

//     const ledgerSummary = {
//       opening_balance: Math.abs(customer.account_balance || 0),
//       opening_balance_type: customer.balance_type || "Cr",
//       total_sales: totalSales,
//       total_returns: totalReturn,
//       total_receipts: 0, // Since receipts are removed, set to 0
//       balance: Math.abs(closingBalance),
//       balance_type: closingBalance > 0 ? "Dr" : "Cr",
//     };

//     // --- Response ---
//     return res.status(200).json({
//       customer,
//       transactions,
//       ledger_summary: ledgerSummary,
//       transaction_summary: {
//         ...transactionSummary,
//         total_transactions: totalTransactions,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching customer ledger:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

export const getCustomerLedger = async (req, res) => {
  try {
    const { customer_id, company_id } = req.params;
    const customerIdNum = Number(customer_id);
    const companyIdNum = Number(company_id);

    if (isNaN(customerIdNum) || isNaN(companyIdNum)) {
      return res.status(400).json({ message: "Invalid customer or company ID" });
    }

    // --- Fetch Customer Info ---
    const customer = await prisma.vendorscustomer.findUnique({
      where: { id: customerIdNum },
      include: {
        company: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // --- Fetch All Transactions ---
    const [sales, salesReturns, payments] = await Promise.all([
      prisma.salesorder.findMany({
        where: {
          company_id: companyIdNum,
          bill_to_customer_name: customer.name_english,
        },
        include: { salesorderitems: true },
      }),

      prisma.sales_return.findMany({
        where: {
          company_id: companyIdNum,
          customer_id: customerIdNum,
        },
        include: { sales_return_items: true },
      }),

      // ADD: Fetch payments
      prisma.income_vouchers.findMany({
        where: {
          company_id: companyIdNum,
          received_from: customerIdNum,
        },
      }),
    ]);

    // --- Prepare Transactions ---
    const transactions = [];
    let openingBalance = 0;

    if (customer.account_balance && customer.account_balance !== 0) {
      const type = customer.balance_type || "Cr";
      openingBalance = type === "Dr" ? customer.account_balance : -customer.account_balance;

      transactions.push({
        date: customer.creation_date || customer.created_at || new Date(),
        particulars: "Opening Balance",
        vch_type: "Opening",
        vch_no: "--",
        debit: type === "Dr" ? customer.account_balance : 0,
        credit: type === "Cr" ? customer.account_balance : 0,
        balance: openingBalance,
        items: [],
      });
    }

    let runningBalance = openingBalance;

    // 🧾 Sales (Debit: increases balance)
    sales.forEach((s) => {
      const total = s.total.toNumber();
      runningBalance += total; // CHANGED: += for debit
      transactions.push({
        date: s.created_at,
        particulars: `Sales Invoice ${s.SO_no || ""}`,
        vch_type: "Sales",
        vch_no: s.SO_no,
        debit: total, // CHANGED: debit
        credit: 0,
        balance: runningBalance,
        items: s.salesorderitems.map((i) => ({
          item_name: i.item_name,
          quantity: i.qty.toNumber(),
          rate: i.rate.toNumber(),
          value: i.amount.toNumber(),
        })),
      });
    });

    // 🔁 Sales Returns (Credit: decreases balance)
    salesReturns.forEach((r) => {
      const total = r.grand_total.toNumber();
      runningBalance -= total; // CHANGED: -= for credit
      transactions.push({
        date: r.return_date,
        particulars: `Sales Return ${r.return_no}`,
        vch_type: "Sales Return",
        vch_no: r.return_no,
        debit: 0,
        credit: total, // CHANGED: credit
        balance: runningBalance,
        items: r.sales_return_items.map((i) => ({
          item_name: i.item_name,
          quantity: i.quantity.toNumber(),
          rate: i.rate.toNumber(),
          value: i.amount.toNumber(),
        })),
      });
    });

    // 💳 Payments (Credit: decreases balance)
    payments.forEach((p) => {
      const total = p.total_amount.toNumber();
      runningBalance -= total;
      transactions.push({
        date: p.voucher_date,
        particulars: `Payment Received ${p.auto_receipt_no || ""}`,
        vch_type: "Receipt",
        vch_no: p.auto_receipt_no,
        debit: 0,
        credit: total,
        balance: runningBalance,
        items: [],
      });
    });

    // --- Sort by Date ---
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- Transaction Summary ---
    const transactionSummary = {
      opening_balance: customer.account_balance ? 1 : 0,
      sales: sales.length,
      sales_return: salesReturns.length,
      receipts: payments.length, // ADD
      purchase_return: 0,
      banking: 0,
      journal: 0,
    };

    const totalTransactions = Object.values(transactionSummary).reduce((a, b) => a + b, 0);

    // --- Ledger Summary ---
    const totalSales = sales.reduce((a, b) => a + b.total.toNumber(), 0);
    const totalReturn = salesReturns.reduce((a, b) => a + b.grand_total.toNumber(), 0);
    const totalReceipts = payments.reduce((a, b) => a + b.total_amount.toNumber(), 0); // ADD

    const closingBalance = openingBalance + totalSales - totalReturn - totalReceipts;

    const ledgerSummary = {
      opening_balance: Math.abs(customer.account_balance || 0),
      opening_balance_type: customer.balance_type || "Cr",
      total_sales: totalSales,
      total_returns: totalReturn,
      total_receipts: totalReceipts, // ADD
      balance: Math.abs(closingBalance),
      balance_type: closingBalance >= 0 ? "Dr" : "Cr", // CHANGED condition
    };

    // --- Response ---
    return res.status(200).json({
      customer,
      transactions,
      ledger_summary: ledgerSummary,
      transaction_summary: {
        ...transactionSummary,
        total_transactions: totalTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching customer ledger:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};