import prisma from "../config/db.js";

export const createRole = async (req, res) => {
  try {
    const { company_id, role_name, general_permissions, permissions } = req.body;

    if (!role_name)
      return res.status(400).json({ success: false, message: "Role name is required" });

    // Ensure stored as JSON string (or change as per your preference)
    const role = await prisma.userroles.create({
      data: {
        company_id: company_id ? Number(company_id) : null,
        role_name,
        general_permissions: JSON.stringify(general_permissions || []),
        permissions: {
          create:
            permissions?.map((p) => ({
              module_name: p.module_name,
              can_create: !!p.can_create,
              can_view: !!p.can_view,
              can_update: !!p.can_update,
              can_delete: !!p.can_delete,
              full_access: !!p.full_access,
            })) || [],
        },
      },
      include: {
        permissions: true,
      },
    });

    res.status(201).json({ success: true, message: "Role created successfully", data: role });
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

    res.json({
      success: true,
      message: company_id ? `Roles for company_id ${company_id} fetched` : "All roles fetched",
      data: roles,
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

    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    res.json({ success: true, data: role });
  } catch (error) {
    console.error("Get Role by ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, general_permissions, permissions } = req.body;
    const roleId = Number(id);

    // Check role exists
    const existing = await prisma.userroles.findUnique({ where: { id: roleId } });
    if (!existing) return res.status(404).json({ success: false, message: "Role not found" });

    // Transactional update: update role, delete old perms, create new perms
    await prisma.$transaction([
      prisma.userroles.update({
        where: { id: roleId },
        data: {
          role_name,
          general_permissions: JSON.stringify(general_permissions || []),
        },
      }),
      prisma.role_permissions.deleteMany({ where: { role_id: roleId } }),
      // createMany might fail silently on empty array; ensure array exists
      ...(permissions && permissions.length
        ? [prisma.role_permissions.createMany({
            data: permissions.map((p) => ({
              role_id: roleId,
              module_name: p.module_name,
              can_create: !!p.can_create,
              can_view: !!p.can_view,
              can_update: !!p.can_update,
              can_delete: !!p.can_delete,
              full_access: !!p.full_access,
            })),
          })]
        : []),
    ]);

    const roleWithPermissions = await prisma.userroles.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    res.json({ success: true, message: "Role updated successfully", data: roleWithPermissions });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ success: false, message: "Status is required" });

    const roleId = Number(id);
    const existing = await prisma.userroles.findUnique({ where: { id: roleId } });
    if (!existing) return res.status(404).json({ success: false, message: "Role not found" });

    const updatedRole = await prisma.userroles.update({
      where: { id: roleId },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: "Role status updated successfully",
      data: updatedRole,
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

    const existing = await prisma.userroles.findUnique({ where: { id: roleId } });
    if (!existing) return res.status(404).json({ success: false, message: "Role not found" });

    await prisma.userroles.delete({ where: { id: roleId } });
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete Role Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
