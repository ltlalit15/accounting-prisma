import express from "express";
import { getPurchaseTaxReport, getSalesTaxReport } from "../controllers/taxReport.controller.js";


const router = express.Router();

router.get("/purchase/:company_id", getPurchaseTaxReport);
router.get("/sales/:company_id", getSalesTaxReport);


export default router;         