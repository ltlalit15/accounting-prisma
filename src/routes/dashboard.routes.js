import express from "express";
import {
  getAdminDashboardData,
  getDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/admin", getAdminDashboardData);
router.get("/:company_id", getDashboard);

export default router;
