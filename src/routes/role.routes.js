import { Router } from "express";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleStatus,
} from "../controllers/role.controller.js";

const router = Router();

// If you decide to include company_id in route, change endpoints accordingly
router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.put("/:id", updateRole);
router.patch("/:id/status", updateRoleStatus);
router.delete("/:id", deleteRole);

export default router;
