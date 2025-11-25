import express from "express";
import { getLedgerDetails, getTrialBalance } from "../controllers/getTrialBalance.controller.js";

const router = express.Router();

router.get("/:company_id",getTrialBalance )
router.get("/ledger/:company_id/:account_id",getLedgerDetails )

export default router;
