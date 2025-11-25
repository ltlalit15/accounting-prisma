import express from "express";
import { getLedgerReport, getLedgerVoucherDetails } from "../controllers/ledger.controller.js";


const router = express.Router();

router.get("/ledger/:company_id", getLedgerReport);
router.get("/ledger/voucher-details/:id", getLedgerVoucherDetails);


export default router;         