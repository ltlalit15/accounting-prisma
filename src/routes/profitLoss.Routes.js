// routes/profitLossRoutes.js
import express from "express";
import { getProfitAndLoss ,getAccountTransactions } from "../controllers/ProfitLoss.Controller.js";

const router = express.Router();

/**
 * GET /api/v1/:company_id/reports/profit-loss
 * Query Params:
 *   from_date=YYYY-MM-DD
 *   to_date=YYYY-MM-DD
 *   year=2025 (optional)
 */
router.get("/:company_id/profit-loss", getProfitAndLoss);
router.get("/:company_id/reports/account/:account_id/transactions", getAccountTransactions);

export default router;
