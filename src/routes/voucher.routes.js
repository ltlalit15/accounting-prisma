import { Router } from "express";
import { upload } from "../config/multer.js";

import {
  createVoucher,
  getVoucherById,
  getVouchersByCompany,
  updateVoucher,
  deleteVoucher,
} from "../controllers/voucherController.js";

const router = Router();

// router.post("/", createVoucher);
router.post("/", createVoucher);

router.get("/company/:companyId", getVouchersByCompany);

router.get("/:id", getVoucherById);

// router.put("/:id", updateVoucher);
router.patch("/:id", updateVoucher);

router.delete("/:id", deleteVoucher);

export default router;
