import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1d"; // token validity

// ---------------------------------------------------
// LOGIN (email + password, role in JWT)
// ---------------------------------------------------

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     // Find user
//     const user = await prisma.users.findUnique({ where: { email } });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // JWT payload
//     const payload = {
//       id: user.id,
//       email: user.email,
//       role: user.role, // SUPERADMIN or COMPANY
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

//     return res.status(200).json({
//       message: "Login successful",
//       data: {
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           profile: user.profile,
//           UserStatus: user.UserStatus,
//         },
//         token,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

const UI_MODULE_MAPPING = {
  Dashboard: null,

  Charts_of_Accounts: "charts_of_accounts",
  "Customers/Debtors": "customers_debtors",
  "Vendors/Creditors": "vendors_creditors",

  All_Transaction: "all_transactions",

  Warehouse: "warehouses",
  Unit_of_measure: "unit_details",
  Product_Inventory: "products",
  Service: "services",
  StockTransfer: "transfers",
  Inventory_Adjustment: "adjustments",

  Sales_Order: "salesorder",
  Sales_Return: "sales_return",
  Purchase_Orders: "purchaseorder",
  Purchase_Return: "purchase_return",

  POS_Screen: "pos_invoices",
  Create_Voucher: "journal_entries",

  Expenses: "expensevouchers",
  Income: "income_vouchers",
  Contra_Voucher: "contra_vouchers",

  Sales_Report: null,
  Purchase_Report: null,
  POS_Report: null,
  Tax_Report: null,
  Inventory_Summary: null,
  Balance_Sheet: null,
  Cash_Flow: null,
  Profit_Loss: null,
  Vat_Report: null,
  DayBook: null,

  Journal_Entries: "journal_entries",
  Ledger: null,
  Trial_Balance: null,

  Users: "users",
  Roles_Permissions: "userroles",
  Company_Info: "users",
  Password_Requests: "password_change_requests",
};

const UI_PERMISSION_ORDER = [
  "Dashboard",
  "Charts_of_Accounts",
  "Customers/Debtors",
  "Vendors/Creditors",
  "All_Transaction",
  "Warehouse",
  "Unit_of_measure",
  "Product_Inventory",
  "Service",
  "StockTransfer",
  "Inventory_Adjustment",
  "Sales_Order",
  "Sales_Return",
  "Purchase_Orders",
  "Purchase_Return",
  "POS_Screen",
  "Create_Voucher",
  "Expenses",
  "Income",
  "Contra_Voucher",
  "Sales_Report",
  "Purchase_Report",
  "POS_Report",
  "Tax_Report",
  "Inventory_Summary",
  "Balance_Sheet",
  "Cash_Flow",
  "Profit_Loss",
  "Vat_Report",
  "DayBook",
  "Journal_Entries",
  "Ledger",
  "Trial_Balance",
  "Users",
  "Roles_Permissions",
  "Company_Info",
  "Password_Requests",
];

export const formatPermissions = (roleData) => {
  /* =========================
     1️⃣ DB PERMISSIONS MAP
  ========================= */
  const permissionMap = new Map();
  (roleData.permissions || []).forEach((p) => {
    permissionMap.set(p.module_name, {
      can_create: !!p.can_create,
      can_view: !!p.can_view,
      can_update: !!p.can_update,
      can_delete: !!p.can_delete,
    });
  });

  /* =========================
     2️⃣ GENERAL PERMISSIONS
  ========================= */
  let generalPerms = [];
  try {
    if (Array.isArray(roleData.general_permissions)) {
      generalPerms = roleData.general_permissions;
    } else if (
      typeof roleData.general_permissions === "string" &&
      roleData.general_permissions.trim() !== ""
    ) {
      generalPerms = JSON.parse(roleData.general_permissions);
    }
  } catch {
    generalPerms = [];
  }

  const generalMap = new Map();
  generalPerms.forEach((p) => {
    if (p?.module_name) {
      generalMap.set(p.module_name, p);
    }
  });

  /* =========================
     3️⃣ FINAL UI RESPONSE
  ========================= */
  return UI_PERMISSION_ORDER.map((uiName) => {
    const dbName = UI_MODULE_MAPPING[uiName];

    // 🔹 Dashboard + Reports
    if (!dbName) {
      const gp = generalMap.get(uiName);
      return {
        module_name: uiName,
        can_create: gp ? !!gp.can_create : false,
        can_view: gp ? !!gp.can_view : false,
        can_update: gp ? !!gp.can_update : false,
        can_delete: gp ? !!gp.can_delete : false,
      };
    }

    // 🔹 DB modules (shared mapping SAFE)
    const perm = permissionMap.get(dbName);
    if (perm) {
      return {
        module_name: uiName,
        ...perm,
      };
    }

    // 🔹 Default
    return {
      module_name: uiName,
      can_create: false,
      can_view: false,
      can_update: false,
      can_delete: false,
    };
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /* =========================
       1️⃣ FIND USER
    ========================= */
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* =========================
       2️⃣ PASSWORD CHECK
    ========================= */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* =========================
       3️⃣ JWT TOKEN
    ========================= */
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    /* =========================
       4️⃣ BASE RESPONSE
    ========================= */
    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        UserStatus: user.UserStatus,
        companyId: user.created_by || null,
      },
      token,
    };

    // USER role adjustment
    if (user.role === "USER") {
      responseData.user = {
        ...responseData.user,
        id: user.created_by || null, // companyId as id
        userId: user.id, // actual user id
      };
      delete responseData.user.companyId;
    }

    /* =========================
       5️⃣ PERMISSIONS HANDLING
    ========================= */

    // 🔹 USER ROLE (CUSTOM ROLE)
    if (user.role === "USER" && user.user_role) {
      const userRole = await prisma.userroles.findUnique({
        where: { id: Number(user.user_role) },
        include: {
          permissions: true, // role_permissions table
        },
      });

      if (userRole) {
        responseData.userRole = {
          role_id: userRole.id,
          role_name: userRole.role_name,
          status: userRole.status,
          permissions: formatPermissions(userRole), // ✅ DB + GENERAL
        };
      }
    }

    // 🔹 COMPANY / SUPERADMIN
    else if (user.role === "COMPANY" || user.role === "SUPERADMIN") {
      // ⚠️ NOTE:
      // Agar future me COMPANY ke liye bhi role-based control chahiye,
      // to yaha bhi userroles use kar sakte ho

      responseData.userRole = {
        role_id: null,
        role_name: user.role,
        status: user.UserStatus || "Active",
        permissions: UI_PERMISSION_ORDER.map((uiName) => ({
          module_name: uiName,
          can_create: true,
          can_view: true,
          can_update: true,
          can_delete: true,
        })),
      };
    }

    /* =========================
       6️⃣ FINAL RESPONSE
    ========================= */
    return res.status(200).json({
      message: "Login successful",
      data: responseData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ----------Super Admin Controllers ----------

export const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload profile image if exists
    let profileUrl = null;
    if (req.file) {
      profileUrl = await uploadToCloudinary(req.file.buffer, "superadmins");
    }

    // Create super admin
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPERADMIN",
        profile: profileUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        created_at: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Super admin created successfully", data: newUser });
  } catch (error) {
    console.error("Create super admin error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ---------- Company Controllers All Controllers----------

// export const createCompany = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       startDate,
//       expireDate,
//       plan_id,
//       planType,
//       address,
//       country,
//       state,
//       city,
//       postal_code,
//       currency,
//     } = req.body;

//     // ✅ Validate required fields
//     if (
//       !name ||
//       !email ||
//       !password ||
//       !startDate ||
//       !expireDate ||
//       !plan_id ||
//       !planType
//     ) {
//       return res
//         .status(400)
//         .json({ message: "All required fields must be provided" });
//     }

//     // ✅ Check if company email exists
//     const existingUser = await prisma.users.findUnique({ where: { email } });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ message: "Company with this email already exists" });
//     }

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 🖼️ Upload multiple company images (if provided)
//     let company_icon_url = null;
//     let favicon_url = null;
//     let company_logo_url = null;
//     let company_dark_logo_url = null;

//     if (req.files) {
//       if (req.files.company_icon) {
//         company_icon_url = await uploadToCloudinary(
//           req.files.company_icon[0].buffer,
//           "company_icons"
//         );
//       }
//       if (req.files.favicon) {
//         favicon_url = await uploadToCloudinary(
//           req.files.favicon[0].buffer,
//           "company_favicons"
//         );
//       }
//       if (req.files.company_logo) {
//         company_logo_url = await uploadToCloudinary(
//           req.files.company_logo[0].buffer,
//           "company_logos"
//         );
//       }
//       if (req.files.company_dark_logo) {
//         company_dark_logo_url = await uploadToCloudinary(
//           req.files.company_dark_logo[0].buffer,
//           "company_dark_logos"
//         );
//       }
//     }

//     // ✅ Create company record
//     const newCompany = await prisma.users.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: "COMPANY",
//         startDate: new Date(startDate),
//         expireDate: new Date(expireDate),
//         address,
//         country,
//         state,
//         city,
//         postal_code,
//         currency,
//         company_icon_url,
//         favicon_url,
//         company_logo_url,
//         company_dark_logo_url,
//         user_plans: {
//           create: {
//             plan_id: parseInt(plan_id),
//             planType,
//           },
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         startDate: true,
//         expireDate: true,
//         address: true,
//         country: true,
//         state: true,
//         city: true,
//         postal_code: true,
//         currency: true,
//         company_icon_url: true,
//         favicon_url: true,
//         company_logo_url: true,
//         company_dark_logo_url: true,
//         user_plans: true,
//         created_at: true,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "✅ Company created successfully",
//       data: newCompany,
//     });
//   } catch (error) {
//     console.error("❌ Create company error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
export const createCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      startDate,
      expireDate,
      plan_id,
      planType,
      address,
      country,
      state,
      city,
      postal_code,
      currency,
      bank_name,
      account_number,
      account_holder,
      ifsc_code,
      notes,
      terms_and_conditions,
    } = req.body;

    /* =========================
       1️⃣ BASIC VALIDATION
    ========================= */
    if (
      !name ||
      !email ||
      !password ||
      !startDate ||
      !expireDate ||
      !plan_id ||
      !planType
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    /* =========================
       2️⃣ CHECK DUPLICATE COMPANY
    ========================= */
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Company with this email already exists",
      });
    }

    /* =========================
       3️⃣ HASH PASSWORD
    ========================= */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       4️⃣ FILE UPLOADS (PROFILE + LOGOS)
    ========================= */
    let profile_url = null;
    let company_icon_url = null;
    let favicon_url = null;
    let company_logo_url = null;
    let company_dark_logo_url = null;

    if (req.files) {
      if (req.files.profile) {
        profile_url = await uploadToCloudinary(
          req.files.profile,
          "company_profiles"
        );
      }

      if (req.files.company_icon) {
        company_icon_url = await uploadToCloudinary(
          req.files.company_icon,
          "company_icons"
        );
      }

      if (req.files.favicon) {
        favicon_url = await uploadToCloudinary(
          req.files.favicon,
          "company_favicons"
        );
      }

      if (req.files.company_logo) {
        company_logo_url = await uploadToCloudinary(
          req.files.company_logo,
          "company_logos"
        );
      }

      if (req.files.company_dark_logo) {
        company_dark_logo_url = await uploadToCloudinary(
          req.files.company_dark_logo,
          "company_dark_logos"
        );
      }
    }

    /* =========================
       5️⃣ CREATE COMPANY + PLAN
    ========================= */
    const newCompany = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "COMPANY",

        startDate: new Date(startDate),
        expireDate: new Date(expireDate),

        profile_url, // ✅ NEW FIELD

        address,
        country,
        state,
        city,
        postal_code,
        currency,

        company_icon_url,
        favicon_url,
        company_logo_url,
        company_dark_logo_url,

        user_plans: {
          create: {
            plan_id: parseInt(plan_id),
            planType, // enum value e.g. "Paid"
          },
        },

        // 💳 BANK DETAILS
        bank_name: bank_name || null,
        account_number: account_number || null,
        account_holder: account_holder || null,
        ifsc_code: ifsc_code || null,
        notes: notes || null,
        terms_and_conditions: terms_and_conditions || null,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,

        startDate: true,
        expireDate: true,

        profile_url: true, // ✅ RETURN PROFILE

        address: true,
        country: true,
        state: true,
        city: true,
        postal_code: true,
        currency: true,

        company_icon_url: true,
        favicon_url: true,
        company_logo_url: true,
        company_dark_logo_url: true,

        bank_name: true,
        account_number: true,
        account_holder: true,
        ifsc_code: true,
        notes: true,
        terms_and_conditions: true,

        user_plans: true,
        created_at: true,
      },
    });

    /* =========================
       6️⃣ SUCCESS RESPONSE
    ========================= */
    return res.status(201).json({
      success: true,
      message: "✅ Company created successfully",
      data: newCompany,
    });
  } catch (error) {
    console.error("❌ Create company error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const updateCompany = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       startDate,
//       expireDate,
//       plan_id,
//       planType,
//       address,
//       country,
//       state,
//       city,
//       postal_code,
//       currency,
//     } = req.body;

//     const companyId = parseInt(id);

//     const existingCompany = await prisma.users.findUnique({
//       where: { id: companyId },
//       include: { user_plans: true },
//     });

//     if (!existingCompany || existingCompany.role !== "COMPANY") {
//       return res.status(404).json({ success: false, message: "Company not found" });
//     }

//     // 🖼️ Handle multiple image uploads (replace only those provided)
//     let {
//       company_icon_url,
//       favicon_url,
//       company_logo_url,
//       company_dark_logo_url,
//     } = existingCompany;

//     if (req.files) {
//       if (req.files.company_icon) {
//         company_icon_url = await uploadToCloudinary(req.files.company_icon[0].buffer, "company_icons");
//       }
//       if (req.files.favicon) {
//         favicon_url = await uploadToCloudinary(req.files.favicon[0].buffer, "company_favicons");
//       }
//       if (req.files.company_logo) {
//         company_logo_url = await uploadToCloudinary(req.files.company_logo[0].buffer, "company_logos");
//       }
//       if (req.files.company_dark_logo) {
//         company_dark_logo_url = await uploadToCloudinary(req.files.company_dark_logo[0].buffer, "company_dark_logos");
//       }
//     }

//     // 🧱 Build update object
//     const updateData = {
//       name: name ?? existingCompany.name,
//       startDate: startDate ? new Date(startDate) : existingCompany.startDate,
//       expireDate: expireDate ? new Date(expireDate) : existingCompany.expireDate,
//       address: address ?? existingCompany.address,
//       country: country ?? existingCompany.country,
//       state: state ?? existingCompany.state,
//       city: city ?? existingCompany.city,
//       postal_code: postal_code ?? existingCompany.postal_code,
//       currency: currency ?? existingCompany.currency,
//       company_icon_url,
//       favicon_url,
//       company_logo_url,
//       company_dark_logo_url,
//     };

//     // ✅ Plan update or creation
//     if (plan_id || planType) {
//       const lastPlan = await prisma.user_plans.findFirst({
//         where: { user_id: companyId },
//         orderBy: { id: "desc" },
//       });

//       if (lastPlan) {
//         await prisma.user_plans.update({
//           where: { id: lastPlan.id },
//           data: {
//             plan_id: plan_id ? parseInt(plan_id) : lastPlan.plan_id,
//             planType: planType ?? lastPlan.planType,
//           },
//         });
//       } else {
//         await prisma.user_plans.create({
//           data: {
//             user_id: companyId,
//             plan_id: parseInt(plan_id),
//             planType,
//           },
//         });
//       }
//     }

//     // ✅ Update company details
//     const updatedCompany = await prisma.users.update({
//       where: { id: companyId },
//       data: updateData,
//       include: { user_plans: true },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "✅ Company updated successfully",
//       data: updatedCompany,
//     });
//   } catch (error) {
//     console.error("❌ Update company error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const getCompanyById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const company = await prisma.users.findUnique({
//       where: { id: parseInt(id) },
//       include: { user_plans: true },
//     });

//     if (!company || company.role !== "COMPANY") {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     return res.status(200).json({ message: "Company fetched successfully", data: company });
//   } catch (error) {
//     console.error("Get company by ID error:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// export const updateCompany = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       email,
//       phone,
//       startDate,
//       expireDate,
//       plan_id,
//       planType,
//       address,
//       country,
//       state,
//       city,
//       postal_code,
//       currency,
//     } = req.body;

//     const companyId = parseInt(id);

//     // ✅ 1. Find existing company
//     const existingCompany = await prisma.users.findUnique({
//       where: { id: companyId },
//       include: { user_plans: true },
//     });

//     if (!existingCompany || existingCompany.role !== "COMPANY") {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }

//     // ✅ 2. Keep old URLs unless new ones are uploaded
//     let {
//       company_icon_url,
//       favicon_url,
//       company_logo_url,
//       company_dark_logo_url,
//     } = existingCompany;

//     // ✅ 3. Handle uploaded files from multer-storage-cloudinary
//     if (req.files) {
//       console.log("🟢 Incoming files:", Object.keys(req.files));

//       if (req.files.companyIcon) {
//         company_icon_url = req.files.companyIcon[0].path; // Cloudinary URL
//       }

//       if (req.files.favicon) {
//         favicon_url = req.files.favicon[0].path;
//       }

//       if (req.files.companyLogo) {
//         company_logo_url = req.files.companyLogo[0].path;
//       }

//       if (req.files.companyDarkLogo) {
//         company_dark_logo_url = req.files.companyDarkLogo[0].path;
//       }
//     }

//     // ✅ 4. Prepare update data
//     const updateData = {
//       name: name ?? existingCompany.name,
//       email: email ?? existingCompany.email,
//       phone: phone ?? existingCompany.phone,
//       startDate: startDate ? new Date(startDate) : existingCompany.startDate,
//       expireDate: expireDate
//         ? new Date(expireDate)
//         : existingCompany.expireDate,
//       address: address ?? existingCompany.address,
//       country: country ?? existingCompany.country,
//       state: state ?? existingCompany.state,
//       city: city ?? existingCompany.city,
//       postal_code: postal_code ?? existingCompany.postal_code,
//       currency: currency ?? existingCompany.currency,
//       company_icon_url,
//       favicon_url,
//       company_logo_url,
//       company_dark_logo_url,
//     };

//     // ✅ 5. Update or create plan
//     if (plan_id || planType) {
//       const lastPlan = await prisma.user_plans.findFirst({
//         where: { user_id: companyId },
//         orderBy: { id: "desc" },
//       });

//       if (lastPlan) {
//         await prisma.user_plans.update({
//           where: { id: lastPlan.id },
//           data: {
//             plan_id: plan_id ? parseInt(plan_id) : lastPlan.plan_id,
//             planType: planType ?? lastPlan.planType,
//           },
//         });
//       } else {
//         await prisma.user_plans.create({
//           data: {
//             user_id: companyId,
//             plan_id: parseInt(plan_id),
//             planType,
//           },
//         });
//       }
//     }

//     // ✅ 6. Update company record in DB
//     const updatedCompany = await prisma.users.update({
//       where: { id: companyId },
//       data: updateData,
//       include: { user_plans: true },
//     });

//     // ✅ 7. Respond with success
//     return res.status(200).json({
//       success: true,
//       message: "✅ Company updated successfully",
//       data: updatedCompany,
//     });
//   } catch (error) {
//     console.error("❌ Update company error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      startDate,
      expireDate,
      plan_id,
      planType,
      address,
      country,
      state,
      city,
      postal_code,
      currency,
      bank_name,
      account_number,
      account_holder,
      ifsc_code,
      notes,
      terms_and_conditions,
    } = req.body;

    const companyId = parseInt(id);

    // ✅ 1. Find existing company
    const existingCompany = await prisma.users.findUnique({
      where: { id: companyId },
      include: { user_plans: true },
    });

    if (!existingCompany || existingCompany.role !== "COMPANY") {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ 2. Keep old URLs unless new ones are uploaded
    let {
      company_icon_url,
      favicon_url,
      company_logo_url,
      company_dark_logo_url,
    } = existingCompany;

    // ✅ 3. Handle uploaded files from multer-storage-cloudinary
    if (req.files) {
      console.log("🟢 Incoming files:", Object.keys(req.files));

      if (req.files.company_icon) {
        company_icon_url = await uploadToCloudinary(
          req.files.company_icon,
          "company_icons"
        );
      }

      if (req.files.favicon) {
        favicon_url = await uploadToCloudinary(
          req.files.favicon,
          "company_favicons"
        );
      }

      if (req.files.company_logo) {
        company_logo_url = await uploadToCloudinary(
          req.files.company_logo,
          "company_logos"
        );
      }

      if (req.files.company_dark_logo) {
        company_dark_logo_url = await uploadToCloudinary(
          req.files.company_dark_logo,
          "company_dark_logos"
        );
      }
    }

    // ✅ 4. Prepare update data
    const updateData = {
      name: name ?? existingCompany.name,
      email: email ?? existingCompany.email,
      phone: phone ?? existingCompany.phone,
      startDate: startDate ? new Date(startDate) : existingCompany.startDate,
      expireDate: expireDate
        ? new Date(expireDate)
        : existingCompany.expireDate,
      address: address ?? existingCompany.address,
      country: country ?? existingCompany.country,
      state: state ?? existingCompany.state,
      city: city ?? existingCompany.city,
      postal_code: postal_code ?? existingCompany.postal_code,
      currency: currency ?? existingCompany.currency,
      company_icon_url,
      favicon_url,
      company_logo_url,
      company_dark_logo_url,
      // Add new fields to the update data
      bank_name: bank_name ?? existingCompany.bank_name,
      account_number: account_number ?? existingCompany.account_number,
      account_holder: account_holder ?? existingCompany.account_holder,
      ifsc_code: ifsc_code ?? existingCompany.ifsc_code,
      notes: notes ?? existingCompany.notes,
      terms_and_conditions:
        terms_and_conditions ?? existingCompany.terms_and_conditions,
    };

    // ✅ 5. Update or create plan
    if (plan_id || planType) {
      const lastPlan = await prisma.user_plans.findFirst({
        where: { user_id: companyId },
        orderBy: { id: "desc" },
      });

      if (lastPlan) {
        await prisma.user_plans.update({
          where: { id: lastPlan.id },
          data: {
            plan_id: plan_id ? parseInt(plan_id) : lastPlan.plan_id,
            planType: planType ?? lastPlan.planType,
          },
        });
      } else {
        await prisma.user_plans.create({
          data: {
            user_id: companyId,
            plan_id: parseInt(plan_id),
            planType,
          },
        });
      }
    }

    // ✅ 6. Update company record in DB
    const updatedCompany = await prisma.users.update({
      where: { id: companyId },
      data: updateData,
      include: { user_plans: true },
    });

    // ✅ 7. Respond with success
    return res.status(200).json({
      success: true,
      message: "✅ Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("❌ Update company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const getCompanyById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID is required",
//       });
//     }

//     // 🔹 Fetch company details with related data
//     const company = await prisma.users.findUnique({
//       where: { id: Number(id) },
//       include: {
//         user_plans: true,
//         created_users: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             created_at: true,
//           },
//         },
//       },
//     });

//     if (!company || company.role !== "COMPANY") {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }

//     // ✅ Format response to match schema and UI needs
//     const formattedCompany = {
//       id: company.id,
//       name: company.name,
//       email: company.email,
//       phone: company.phone,
//       role: company.role,
//       user_role: company.user_role,
//       address: company.address,
//       country: company.country,
//       state: company.state,
//       city: company.city,
//       postal_code: company.postal_code,
//       currency: company.currency,
//       startDate: company.startDate,
//       expireDate: company.expireDate,
//       UserStatus: company.UserStatus,
//       created_at: company.created_at,
//       branding: {
//         company_logo_url: company.company_logo_url,
//         company_dark_logo_url: company.company_dark_logo_url,
//         company_icon_url: company.company_icon_url,
//         favicon_url: company.favicon_url,
//       },
//       user_plans: company.user_plans,
//       team_members: company.created_users, // 👈 users created under this company
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Company fetched successfully",
//       data: formattedCompany,
//     });
//   } catch (error) {
//     console.error("❌ Get company by ID error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const getAllCompanies = async (req, res) => {
//   try {
//     const companies = await prisma.users.findMany({
//       where: { role: "COMPANY" },
//       include: {
//         user_plans: {
//           include: {
//             plan: true, // ✅ Fetch related plan details
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     return res.status(200).json({
//       message: "Companies fetched successfully",
//       data: companies,
//     });
//   } catch (error) {
//     console.error("Get all companies error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // 🔹 Fetch company details with related data
    const company = await prisma.users.findUnique({
      where: { id: Number(id) },
      include: {
        user_plans: true,
        createdUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    if (!company || company.role !== "COMPANY") {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ Format response to match schema and UI needs
    const formattedCompany = {
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      role: company.role,
      user_role: company.user_role,
      address: company.address,
      country: company.country,
      state: company.state,
      city: company.city,
      postal_code: company.postal_code,
      currency: company.currency,
      startDate: company.startDate,
      expireDate: company.expireDate,
      UserStatus: company.UserStatus,
      created_at: company.created_at,

      // Include bank details, notes, and terms & conditions
      bank_details: {
        bank_name: company.bank_name,
        account_number: company.account_number,
        account_holder: company.account_holder,
        ifsc_code: company.ifsc_code,
      },
      notes: company.notes,
      terms_and_conditions: company.terms_and_conditions,

      branding: {
        company_logo_url: company.company_logo_url,
        company_dark_logo_url: company.company_dark_logo_url,
        company_icon_url: company.company_icon_url,
        favicon_url: company.favicon_url,
      },

      user_plans: company.user_plans,
      team_members: company.createdUsers, // 👈 users created under this company
    };

    return res.status(200).json({
      success: true,
      message: "Company fetched successfully",
      data: formattedCompany,
    });
  } catch (error) {
    console.error("❌ Get company by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const getAllCompanies = async (req, res) => {
//   try {
//     // 🔹 Fetch all companies (role = COMPANY)
//     const companies = await prisma.users.findMany({
//       where: { role: "COMPANY" },
//       include: {
//         user_plans: {
//           include: {
//             plan: true, // ✅ Include related plan info
//           },
//         },
//         created_users: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             created_at: true,
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     if (!companies || companies.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No companies found",
//       });
//     }

//     // 🔹 Format each company into a clean UI-ready structure
//     const formattedCompanies = companies.map((company) => ({
//       id: company.id,
//       name: company.name,
//       email: company.email,
//       phone: company.phone,
//       role: company.role,
//       user_role: company.user_role,
//       address: company.address,
//       country: company.country,
//       state: company.state,
//       city: company.city,
//       postal_code: company.postal_code,
//       currency: company.currency,
//       startDate: company.startDate,
//       expireDate: company.expireDate,
//       UserStatus: company.UserStatus,
//       created_at: company.created_at,
//       branding: {
//         company_logo_url: company.company_logo_url,
//         company_dark_logo_url: company.company_dark_logo_url,
//         company_icon_url: company.company_icon_url,
//         favicon_url: company.favicon_url,
//       },
//       user_plans: company.user_plans.map((planData) => ({
//         id: planData.id,
//         status: planData.status,
//         start_date: planData.start_date,
//         end_date: planData.end_date,
//         plan: planData.plan
//           ? {
//               id: planData.plan.id,
//               plan_name: planData.plan.plan_name,
//               duration: planData.plan.duration,
//               amount: planData.plan.amount,
//             }
//           : null,
//       })),
//       team_members: company.created_users,
//     }));

//     // ✅ Send formatted response
//     return res.status(200).json({
//       success: true,
//       message: "Companies fetched successfully",
//       count: formattedCompanies.length,
//       data: formattedCompanies,
//     });
//   } catch (error) {
//     console.error("❌ Get all companies error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// export const getAllCompanies = async (req, res) => {
//   try {
//     // 🔹 Fetch all companies (role = COMPANY)
//     const companies = await prisma.users.findMany({
//       where: { role: "COMPANY" },
//       include: {
//         user_plans: {
//           include: {
//             plan: true, // ✅ Include related plan info
//           },
//         },
//         created_users: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             created_at: true,
//           },
//         },
//       },
//       orderBy: { created_at: "desc" },
//     });

//     if (!companies || companies.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No companies found",
//       });
//     }

//     // 🔹 Format each company into a clean UI-ready structure
//     const formattedCompanies = companies.map((company) => ({
//       id: company.id,
//       name: company.name,
//       email: company.email,
//       phone: company.phone,
//       role: company.role,
//       user_role: company.user_role,
//       address: company.address,
//       country: company.country,
//       state: company.state,
//       city: company.city,
//       postal_code: company.postal_code,
//       currency: company.currency,
//       startDate: company.startDate,
//       expireDate: company.expireDate,
//       UserStatus: company.UserStatus,
//       created_at: company.created_at,

//       // Include bank details, notes, and terms & conditions
//       bank_details: {
//         bank_name: company.bank_name,
//         account_number: company.account_number,
//         account_holder: company.account_holder,
//         ifsc_code: company.ifsc_code,
//       },
//       notes: company.notes,
//       terms_and_conditions: company.terms_and_conditions,

//       branding: {
//         company_logo_url: company.company_logo_url,
//         company_dark_logo_url: company.company_dark_logo_url,
//         company_icon_url: company.company_icon_url,
//         favicon_url: company.favicon_url,
//       },

//       // User plan details
//       user_plans: company.user_plans.map((planData) => ({
//         id: planData.id,
//         status: planData.status,
//         start_date: planData.start_date,
//         end_date: planData.end_date,
//         plan: planData.plan
//           ? {
//               id: planData.plan.id,
//               plan_name: planData.plan.plan_name,
//               duration: planData.plan.duration,
//               amount: planData.plan.amount,
//             }
//           : null,
//       })),

//       // Team members associated with the company
//       team_members: company.created_users,
//     }));

//     // ✅ Send formatted response
//     return res.status(200).json({
//       success: true,
//       message: "Companies fetched successfully",
//       count: formattedCompanies.length,
//       data: formattedCompanies,
//     });
//   } catch (error) {
//     console.error("❌ Get all companies error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.users.findMany({
      where: { role: "COMPANY" },
      include: {
        user_plans: {
          include: { plan: true },
        },
        createdUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    if (!companies || companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No companies found",
      });
    }

    const format = (value) => value ?? "";

    const formattedCompanies = companies.map((c) => ({
      id: c.id,
      name: format(c.name),
      email: format(c.email),
      phone: format(c.phone),
      role: c.role,
      user_role: format(c.user_role),

      // ✅ PROFILE ADDED
      profile: format(c.profile_url),

      address: format(c.address),
      country: format(c.country),
      state: format(c.state),
      city: format(c.city),
      postal_code: format(c.postal_code),
      currency: format(c.currency),

      startDate: c.startDate,
      expireDate: c.expireDate,
      UserStatus: format(c.UserStatus),
      created_at: c.created_at,

      // 🏦 Bank details
      bank_details: {
        bank_name: format(c.bank_name),
        account_number: format(c.account_number),
        account_holder: format(c.account_holder),
        ifsc_code: format(c.ifsc_code),
      },

      notes: format(c.notes),
      terms_and_conditions: format(c.terms_and_conditions),

      // 🖼 Branding
      branding: {
        company_logo_url: format(c.company_logo_url),
        company_dark_logo_url: format(c.company_dark_logo_url),
        company_icon_url: format(c.company_icon_url),
        favicon_url: format(c.favicon_url),
      },

      // 📅 User plans
      user_plans: c.user_plans.map((p) => ({
        id: p.id,
        status: p.status,
        start_date: p.start_date,
        end_date: p.end_date,
        plan: p.plan
          ? {
              id: p.plan.id,
              plan_name: format(p.plan.plan_name),
              duration: p.plan.duration,
              amount: p.plan.amount,
            }
          : null,
      })),

      // 👥 Team members
      team_members: c.createdUsers || [],
    }));

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      count: formattedCompanies.length,
      data: formattedCompanies,
    });
  } catch (error) {
    console.error("❌ Get all companies error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find company
    const company = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });
    if (!company || company.role !== "COMPANY") {
      return res.status(404).json({ message: "Company not found" });
    }

    // ✅ Delete profile image from Cloudinary if exists
    if (company.profile) {
      // Extract public_id from URL
      const publicId = company.profile.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    // ✅ Delete company from database
    await prisma.users.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Delete company error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// user creaete under company
//all Controler functions related to USER management

// export const createUser = async (req, res) => {
//   try {
//     const { name, email, password, phone, UserStatus, company_id, user_role } =
//       req.body;

//     // 🧾 Validate required fields
//     if (!email || !password || !name || !user_role) {
//       return res
//         .status(400)
//         .json({ message: "Name, email, user_role and password are required" });
//     }

//     // 🧍‍♂️ Validate company_id (the user who creates others)
//     if (!company_id) {
//       return res
//         .status(400)
//         .json({ message: "company_id (creator user) is required" });
//     }

//     // Check if the creator user actually exists and is a COMPANY
//     const creator = await prisma.users.findUnique({
//       where: { id: parseInt(company_id) },
//     });

//     if (!creator || creator.role !== "COMPANY") {
//       return res
//         .status(403)
//         .json({ message: "Invalid company_id or user is not a COMPANY role" });
//     }

//     // 🧍 Check if user already exists
//     const existingUser = await prisma.users.findUnique({
//       where: { email },
//     });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json({ message: "User with this email already exists" });
//     }

//     // 🔐 Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ☁️ Upload profile image if provided
//     let profileUrl = null;
//     if (req.file) {
//       profileUrl = await uploadToCloudinary(req.file.buffer, "users");
//     }

//     // 🏗️ Create USER under the COMPANY
//     const newUser = await prisma.users.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: "USER",
//         profile: profileUrl,
//         phone,
//         UserStatus,
//         user_role,
//         created_by: parseInt(company_id), // 👈 link to COMPANY user
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         profile: true,
//         phone: true,
//         UserStatus: true,
//         user_role: true,
//         created_at: true,
//         createdByUser: {
//           select: { id: true, name: true, email: true }, // show which company created them
//         },
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "User created successfully under the company",
//       data: newUser,
//     });
//   } catch (error) {
//     console.error("Create user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, UserStatus, company_id, user_role } =
      req.body;

    // 🧾 Validate required fields
    if (!email || !password || !name || !user_role) {
      return res
        .status(400)
        .json({ message: "Name, email, user_role and password are required" });
    }

    // 🧾 Validate company_id (the user who creates others)
    if (!company_id) {
      return res
        .status(400)
        .json({ message: "company_id (creator user) is required" });
    }

    // Check if creator user actually exists and is a COMPANY
    const creator = await prisma.users.findUnique({
      where: { id: parseInt(company_id) },
    });

    if (!creator || creator.role !== "COMPANY") {
      return res
        .status(403)
        .json({ message: "Invalid company_id or user is not a COMPANY role" });
    }

    // 🧍 Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // 🔐 Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // ☁️ Upload profile image if provided using express-fileupload
    let profileUrl = null;
    if (req.files?.profile) {
      const profileFile = req.files.profile; // This object has the tempFilePath
      profileUrl = await uploadToCloudinary(profileFile, "users");

      // Since your function returns null on error, let's handle that.
      if (profileUrl === null) {
        return res.status(500).json({
          success: false,
          message: "Profile image upload failed. Please try again.",
        });
      }
    }

    // 🏗️ Create USER under the COMPANY
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        profile: profileUrl,
        phone,
        UserStatus,
        user_role,
        created_by: parseInt(company_id), // 👈 link to COMPANY user
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        phone: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
        createdByUser: {
          select: { id: true, name: true, email: true }, // show which company created them
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully under company",
      data: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, phone, UserStatus, password, user_role } = req.body;

//     // 🔍 Find existing user
//     const existingUser = await prisma.users.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ☁️ Handle profile image update
//     let profileUrl = existingUser.profile;

//     if (req.file) {
//       // If old image exists, delete it first
//       if (existingUser.profile) {
//         try {
//           const publicId = existingUser.profile.split("/").pop().split(".")[0];
//           await deleteFromCloudinary(publicId);
//         } catch (err) {
//           console.warn("Failed to delete old image:", err.message);
//         }
//       }
//       // Upload new image
//       profileUrl = await uploadToCloudinary(req.file.buffer, "users");
//     }

//     // 🔐 If password provided → hash it
//     let hashedPassword = existingUser.password;
//     if (password) {
//       const bcrypt = await import("bcryptjs");
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     // 🧩 Prepare update data
//     const updateData = {
//       name: name ?? existingUser.name,
//       phone: phone ?? existingUser.phone,
//       profile: profileUrl,
//       UserStatus: UserStatus ?? existingUser.UserStatus,
//       user_role: user_role ?? existingUser.user_role,
//       password: hashedPassword,
//     };

//     // 🛠️ Update user
//     const updatedUser = await prisma.users.update({
//       where: { id: parseInt(id) },
//       data: updateData,
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         role: true,
//         profile: true,
//         UserStatus: true,
//         user_role: true,
//         created_at: true,
//         createdByUser: {
//           select: { id: true, name: true, email: true },
//         },
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.error("Update user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, UserStatus, password, user_role } = req.body;

    // 🔍 Find existing user
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ☁️ Handle profile image update using express-fileupload
    let profileUrl = existingUser.profile;

    if (req.files?.profile) {
      // If old image exists, delete it first
      if (existingUser.profile) {
        try {
          // Extract public ID from the URL
          // For a URL like: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/users/abc123.jpg
          // The public ID would be: users/abc123
          const urlParts = existingUser.profile.split("/");
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `users/${publicIdWithExtension.split(".")[0]}`;
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.warn("Failed to delete old image:", err.message);
        }
      }

      // Upload new image
      const profileFile = req.files.profile; // This object has the tempFilePath
      profileUrl = await uploadToCloudinary(profileFile, "users");

      // Since your function returns null on error, let's handle that.
      if (profileUrl === null) {
        return res.status(500).json({
          success: false,
          message: "Profile image upload failed. Please try again.",
        });
      }
    }

    // 🔐 If password provided → hash it
    let hashedPassword = existingUser.password;
    if (password) {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 🧩 Prepare update data
    const updateData = {
      name: name ?? existingUser.name,
      phone: phone ?? existingUser.phone,
      profile: profileUrl,
      UserStatus: UserStatus ?? existingUser.UserStatus,
      user_role: user_role ?? existingUser.user_role,
      password: hashedPassword,
    };

    // 🛠️ Update user
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUsersByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ message: "company_id is required" });
    }

    // Fetch users created by the given company
    const users = await prisma.users.findMany({
      where: { created_by: parseInt(company_id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        phone: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully for this company",
      data: users,
    });
  } catch (error) {
    console.error("Get users by company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true,
        phone: true,
        UserStatus: true,
        user_role: true,
        created_at: true,
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧾 Validate ID
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 🔍 Find the user
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🛡️ Optional: Prevent deleting COMPANY or SUPERADMIN users
    if (existingUser.role === "COMPANY" || existingUser.role === "SUPERADMIN") {
      return res
        .status(403)
        .json({ message: "Cannot delete COMPANY or SUPERADMIN users" });
    }

    // ☁️ Delete profile image from Cloudinary if exists
    if (existingUser.profile) {
      try {
        const publicId = existingUser.profile.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      } catch (err) {
        console.warn(
          "⚠️ Failed to delete profile image from Cloudinary:",
          err.message
        );
      }
    }

    // 🗑️ Delete the user
    await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true, // username
        email: true,
        phone: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // split name → first & last (UI ke liye)
    const [firstName = "", lastName = ""] = user.name?.split(" ");

    return res.json({
      success: true,
      data: {
        id: user.id,
        firstName,
        lastName,
        username: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // ✅ SAFETY FIX
    const body = req.body || {};

    const { firstName, lastName, username, email, phone, password } = body;

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};

    // 👤 Name
    if (username?.trim()) {
      updateData.name = username.trim();
    } else if (firstName || lastName) {
      updateData.name = `${firstName || ""} ${lastName || ""}`.trim();
    }

    // 📧 Email
    if (email?.trim()) updateData.email = email.trim();

    // 📞 Phone
    if (phone?.trim()) updateData.phone = phone.trim();

    // 🔐 Password
    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 🖼 Profile Image
    if (req.files?.profile) {
      const imageUrl = await uploadToCloudinary(
        req.files.profile,
        "users/profile"
      );

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed",
        });
      }

      if (user.profile) {
        const publicId = user.profile
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await deleteFromCloudinary(publicId);
      }

      updateData.profile = imageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
