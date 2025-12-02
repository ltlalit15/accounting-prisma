// src/routes/contraVoucher.routes.js
import express from "express";
import {
  createContraVoucher,
  getAllContraVouchers,
  getContraVoucherById,
  updateContraVoucher,
  deleteContraVoucher,
  getAccounts,
  getContraVouchersByCompany,
} from "../controllers/contraVoucherController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// ✅ Remove "/contra-vouchers" prefix from all routes
router.get("/accounts", getAccounts); // → /api/contravouchers/accounts
// router.post("/", createContraVoucher);         // → /api/contravouchers
router.post("/", createContraVoucher);
router.get("/", getAllContraVouchers); // → /api/contravouchers
router.get("/:id", getContraVoucherById); // → /api/contravouchers/1
// router.put("/:id", updateContraVoucher);       // → /api/contravouchers/1
router.put("/:id", updateContraVoucher);
router.delete("/:id", deleteContraVoucher); // → /api/contravouchers/1
// Get by company
router.get("/company/:company_id", getContraVouchersByCompany);
export default router;
