// src/controllers/customers.controller.js
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
import fs from "fs";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

const uploadToCloudinary = async (tempFilePath, folder = "customers") => {
  try {
    const result = await cloudinary.uploader.upload(tempFilePath, { folder });
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// CREATE Customer (Auto-Ledger Creation)
export const createCustomer = async (req, res) => {
  try {
    const {
      company_id,
      name_english,
      name_arabic,
      company_name,
      google_location,
      account_type = "Sundry Debtors", // Default target group
      balance_type = "Debit",
      account_name,
      account_balance = 0.0,
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
      credit_period = 0,
      gstin,
      enable_gst = false
    } = req.body;

    if (!name_english || !company_id) {
      return res.status(400).json({ status: false, message: "name_english and company_id are required" });
    }

    // File Uploads
    let id_card_image = null;
    let image = null;

    if (req.files?.id_card_image) {
      id_card_image = await uploadToCloudinary(req.files.id_card_image.tempFilePath);
    }
    if (req.files?.image) {
      image = await uploadToCloudinary(req.files.image.tempFilePath);
    }

    const companyIdInt = parseInt(company_id);

    // TRANSACTION: Create Account -> Create Customer
    const customer = await prisma.$transaction(async (tx) => {

      // 1. Find the Subgroup for "Sundry Debtors" (or generic Assets)
      // This ensures the new account lands in the right place in the COA
      let targetSubgroup = await tx.sub_of_subgroups.findFirst({
        where: {
          // company_id: companyIdInt, // sub_of_subgroups usually doesn't have company_id in some schemas, check schema!
          // Schema Check: sub_of_subgroups does NOT have company_id. 
          // It links to parent_accounts which HAS company_id.
          name: account_type, // "Sundry Debtors"
          parent_account: {
            company_id: companyIdInt
          }
        },
        include: { parent_account: true }
      });

      // Fallback: If "Sundry Debtors" not found, find ANY "Current Assets"
      if (!targetSubgroup) {
        targetSubgroup = await tx.sub_of_subgroups.findFirst({
          where: {
            parent_account: {
              company_id: companyIdInt,
              subgroup_name: "Current Assets"
            }
          }
        });
      }

      let accountId = null;

      // Only create Ledger Account if we found a valid place in COA
      if (targetSubgroup) {
        const newAccount = await tx.accounts.create({
          data: {
            company_id: companyIdInt,
            subgroup_id: targetSubgroup.subgroup_id, // Parent Group (Current Assets)
            sub_of_subgroup_id: targetSubgroup.id,   // Sub Group (Sundry Debtors)
            account_name: name_english,
            accountBalance: parseFloat(account_balance || 0),
            // Default fields
          }
        });
        accountId = newAccount.id;
      } else {
        console.warn(`COA Gap: Could not find 'Sundry Debtors' or 'Current Assets' for Company ${companyIdInt}. Customer created without Ledger Account.`);
      }

      // 2. Create Create Customer linked to Account
      return await tx.customers.create({
        data: {
          company_id: companyIdInt,
          account_id: accountId, // LINKED!
          name_english,
          name_arabic,
          company_name,
          google_location,
          id_card_image,
          image,
          account_type,
          balance_type,
          account_name: account_name || name_english,
          account_balance: parseFloat(account_balance),

          creation_date: creation_date || null,
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
          credit_period: parseInt(credit_period),
          gstin,
          enable_gst: Boolean(enable_gst)
        }
      });

    });

    res.status(201).json({
      status: true,
      message: "Customer created successfully",
      customerId: customer.id,
      accountId: customer.account_id
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    res.status(500).json({ status: false, message: "Internal server error: " + error.message });
  }
};

// GET All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customers.findMany({
      orderBy: { id: 'desc' }
    });
    res.json({ status: true, message: "Customers fetched successfully", data: customers });
  } catch (error) {
    console.error("Get All Customers Error:", error);
    res.status(500).json({ status: false, message: "Failed to fetch customers" });
  }
};

// GET Customer By ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ status: false, message: "Valid customer ID required" });
    }

    const customer = await prisma.customers.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ status: false, message: "Customer not found" });
    }

    res.json({ status: true, message: "Customer fetched successfully", data: customer });
  } catch (error) {
    console.error("Get Customer By ID Error:", error);
    res.status(500).json({ status: false, message: "Failed to fetch customer" });
  }
};

// UPDATE Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ status: false, message: "Valid customer ID required" });
    }

    const data = { ...req.body };

    // Handle file uploads
    if (req.files?.id_card_image) {
      data.id_card_image = await uploadToCloudinary(req.files.id_card_image.tempFilePath);
    }
    if (req.files?.image) {
      data.image = await uploadToCloudinary(req.files.image.tempFilePath);
    }

    // Convert types — but NOT creation_date
    if (data.company_id) data.company_id = parseInt(data.company_id);
    if (data.account_balance) data.account_balance = parseFloat(data.account_balance);
    if (data.credit_period) data.credit_period = parseInt(data.credit_period);
    if (data.enable_gst !== undefined) data.enable_gst = Boolean(data.enable_gst);

    // ✅ DO NOT convert creation_date to Date — keep as string!
    // if (data.creation_date) data.creation_date = new Date(data.creation_date); ← REMOVE THIS

    const customer = await prisma.customers.update({
      where: { id: customerId },
      data
    });

    res.json({ status: true, message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update Customer Error:", error);
    res.status(500).json({ status: false, message: "Failed to update customer" });
  }
};
// DELETE Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ status: false, message: "Valid customer ID required" });
    }

    await prisma.customers.delete({
      where: { id: customerId }
    });

    res.json({ status: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete Customer Error:", error);
    res.status(500).json({ status: false, message: "Failed to delete customer" });
  }
};

// GET Customers by Company ID
export const getCustomersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const companyId = parseInt(company_id);
    if (isNaN(companyId)) {
      return res.status(400).json({ status: false, message: "Valid company_id is required" });
    }

    const customers = await prisma.customers.findMany({
      where: { company_id: companyId },
      orderBy: { name_english: 'asc' }
    });

    if (customers.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No customers found for this company"
      });
    }

    res.json({
      status: true,
      message: "Customers fetched successfully",
      data: customers
    });
  } catch (error) {
    console.error("Get Customers by Company Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch customers for this company"
    });
  }
};



