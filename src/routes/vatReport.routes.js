import express from "express";
import { getVatSummary } from "../controllers/vatReport.controller.js";

const router= express.Router();

router.get("/",getVatSummary)

export default router;