import express from "express";
import { authCompany } from "../middlewares/authCompany.js";
import { getInventorySummary, getProductInventoryDetails } from "../controllers/inventory.controller.js";
const router = express.Router();

// 👉 GET inventory summary (company protected)
router.get("/summary", getInventorySummary);
router.get("/product/:companyId/:productId", getProductInventoryDetails);

export default router;