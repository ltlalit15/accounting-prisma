
import { Router } from "express";
import {
  createVendor,
  deleteVendor,
  getAllVendors,
  getVendorById,
  getVendorsByCompanyId,
  updateVendor,
  getVendorLedger,
  getCustomerLedger,
} from "../controllers/vendor.controller.js";


const router = Router();



router.post("/", createVendor);
router.get("/", getAllVendors);
router.get("/company/:company_id", getVendorsByCompanyId);
router.get("/:id", getVendorById);
router.get("/vendor-ledger/:vendor_id/:company_id", getVendorLedger);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

router.get("/customer-ledger/:customer_id/:company_id", getCustomerLedger);


export default router;
