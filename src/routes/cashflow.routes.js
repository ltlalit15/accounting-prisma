import express from "express";
import { getCashFlow } from "../controllers/cashflow.controller.js";

const router = express.Router();

router.get("/cashflow/:company_id", getCashFlow);

export default router;
