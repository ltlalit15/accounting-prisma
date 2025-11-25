import express from "express"
import { getAssetDetails, getBalanceSheet, getLiabilityCapitalDetails } from "../controllers/balancesheet.controller.js";


const router = express.Router();

// company-wise route
router.get("/:company_id/", getBalanceSheet);
router.get("/AssetsDetails/:company_id", getAssetDetails);
router.get("/liability-capital/:company_id", getLiabilityCapitalDetails);

export default router;