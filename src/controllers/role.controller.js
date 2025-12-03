import prisma from "../config/db.js";

const UI_MODULE_MAPPING = {
  Dashboard: null,
  Charts_of_Accounts: "parent_accounts",
  "Customers/Debtors": "vendorscustomer",
  "Vendors/Creditors": "vendorscustomer",
  All_Transaction: "transactions",
  Create_Voucher: "journal_entries",
  Expenses: "expensevouchers",
  Income: "income_vouchers",
  Contra_Voucher: "contra_vouchers",
  Warehouse: "warehouses",
  Unit_of_measure: "unit_details",
  Product_Inventory: "products",
  Service: "services",
  StockTransfer: "transfers",
  Inventory_Management: "adjustments",
  Sales_Order: "salesorder",
  Sales_Return: "sales_return",
  Purchase_Orders: "purchaseorder",
  Purchase_Return: "purchase_return",
  POS_Screen: "pos_invoices",
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

// This order also uses underscores to ensure the response is consistent.
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
  "Inventory_Management",
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

// =================================================================
// 2. HELPER FUNCTIONS (UPDATED)
// =================================================================

/**
 * Formats raw role data from the database into the required UI response format.
 * @param {object} roleData - The role object including its permissions from Prisma.
 * @returns {object} - The formatted role object.
 */
const formatRoleResponse = (roleData) => {
  const permissionMap = new Map();
  roleData.permissions.forEach((p) => {
    permissionMap.set(p.module_name, p);
  });

  const orderedPermissions = UI_PERMISSION_ORDER.map((uiName) => {
    const dbName = UI_MODULE_MAPPING[uiName];

    if (!dbName) {
      return {
        // No transformation needed as UI_PERMISSION_ORDER already has the correct format
        module_name: uiName,
        can_create: false,
        can_view: true,
        can_update: false,
        can_delete: false,
      };
    }

    const permission = permissionMap.get(dbName);

    if (permission) {
      return {
        module_name: uiName,
        can_create: permission.can_create,
        can_view: permission.can_view,
        can_update: permission.can_update,
        can_delete: permission.can_delete,
      };
    } else {
      return {
        module_name: uiName,
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false,
      };
    }
  });

  return {
    role_id: roleData.id,
    role_name: roleData.role_name,
    status: roleData.status,
    created_at: roleData.created_at,
    permissions: orderedPermissions,
  };
};

// =================================================================
// 3. API CONTROLLERS (No changes needed here, they use the constants above)
// =================================================================

/**
 * CREATE a new role with permissions.
 */
export const createRole = async (req, res) => {
  try {
    const { company_id, role_name, permissions } = req.body;

    if (!role_name) {
      return res
        .status(400)
        .json({ success: false, message: "Role name is required" });
    }

    const permissionsToCreate = [];
    if (permissions && Array.isArray(permissions)) {
      for (const perm of permissions) {
        const dbName = UI_MODULE_MAPPING[perm.module_name];
        if (dbName) {
          permissionsToCreate.push({
            module_name: dbName,
            can_create: !!perm.can_create,
            can_view: !!perm.can_view,
            can_update: !!perm.can_update,
            can_delete: !!perm.can_delete,
          });
        }
      }
    }

    const newRole = await prisma.$transaction(async (tx) => {
      const role = await tx.userroles.create({
        data: {
          company_id: company_id ? Number(company_id) : null,
          role_name,
          general_permissions: JSON.stringify([]),
        },
      });

      if (permissionsToCreate.length > 0) {
        await tx.role_permissions.createMany({
          data: permissionsToCreate.map((p) => ({ ...p, role_id: role.id })),
        });
      }

      return role;
    });

    const roleWithPermissions = await prisma.userroles.findUnique({
      where: { id: newRole.id },
      include: { permissions: true },
    });

    const formattedResponse = formatRoleResponse(roleWithPermissions);

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Create Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const { company_id } = req.query;

    const filter = {};
    if (company_id) filter.company_id = parseInt(company_id, 10);

    const roles = await prisma.userroles.findMany({
      where: filter,
      include: { permissions: true },
      orderBy: { created_at: "desc" },
    });

    // Format each role in the array using our helper
    const formattedRoles = roles.map((role) => formatRoleResponse(role));

    res.json({
      success: true,
      message: company_id
        ? `Roles for company_id ${company_id} fetched`
        : "All roles fetched",
      data: formattedRoles,
    });
  } catch (error) {
    console.error("Get All Roles Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.userroles.findUnique({
      where: { id: Number(id) },
      include: { permissions: true },
    });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    // Format the single role object using our helper
    const formattedRole = formatRoleResponse(role);

    res.json({ success: true, data: formattedRole });
  } catch (error) {
    console.error("Get Role by ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    // `general_permissions` is removed from destructuring
    const { role_name, permissions } = req.body;
    const roleId = Number(id);

    const existing = await prisma.userroles.findUnique({
      where: { id: roleId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    // Process incoming permissions to map UI names to DB names
    const permissionsToCreate = [];
    if (permissions && Array.isArray(permissions)) {
      for (const perm of permissions) {
        const dbName = UI_MODULE_MAPPING[perm.module_name];
        if (dbName) {
          permissionsToCreate.push({
            role_id: roleId,
            module_name: dbName,
            can_create: !!perm.can_create,
            can_view: !!perm.can_view,
            can_update: !!perm.can_update,
            can_delete: !!perm.can_delete,
            // `full_access` has been removed
          });
        }
      }
    }

    // Transactional update: update role, delete old perms, create new perms
    await prisma.$transaction([
      prisma.userroles.update({
        where: { id: roleId },
        data: {
          role_name,
          // general_permissions is updated to an empty array by default
          general_permissions: JSON.stringify([]),
        },
      }),
      prisma.role_permissions.deleteMany({ where: { role_id: roleId } }),
      ...(permissionsToCreate.length > 0
        ? [
            prisma.role_permissions.createMany({
              data: permissionsToCreate,
            }),
          ]
        : []),
    ]);

    const roleWithPermissions = await prisma.userroles.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    // Format the final role object using our helper
    const formattedResponse = formatRoleResponse(roleWithPermissions);

    res.json({
      success: true,
      message: "Role updated successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE a role's status (Active/Inactive).
 */
export const updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const roleId = Number(id);
    const existing = await prisma.userroles.findUnique({
      where: { id: roleId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    const updatedRole = await prisma.userroles.update({
      where: { id: roleId },
      data: { status },
    });

    // Manually construct the response for consistency
    const response = {
      role_id: updatedRole.id,
      role_name: updatedRole.role_name,
      status: updatedRole.status,
      created_at: updatedRole.created_at,
    };

    res.status(200).json({
      success: true,
      message: "Role status updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Update role status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = Number(id);

    const existing = await prisma.userroles.findUnique({
      where: { id: roleId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    // The 'onDelete: Cascade' in the schema will automatically delete permissions.
    await prisma.userroles.delete({ where: { id: roleId } });
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
