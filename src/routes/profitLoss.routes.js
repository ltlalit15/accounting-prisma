// routes/profitLossRoutes.js
import express from "express";
import { getProfitAndLoss } from "../controllers/profitLoss.controller.js";

const router = express.Router();

/**
 * GET /api/v1/:company_id/reports/profit-loss
 * Query Params:
 *   from_date=YYYY-MM-DD
 *   to_date=YYYY-MM-DD
 *   year=2025 (optional)
 */
router.get("/:company_id/profit-loss", getProfitAndLoss);

export default router;
