import express from "express";
import { createAccount, createParentAccount, createSubOfSubgroup, deleteAccount, deleteSubOfSubgroup, getAccountsByCompanyId, getAllAccounts, getLedger, getParentAccountsByCompanyId, getSubOfSubgroupsBySubgroupId, updateAccount,getLedgerBySubOfSubgroup } from "../controllers/account.controller.js";


const router = express.Router();


router.post("/create-subgroup", createParentAccount);
router.get("/subgroup/:company_id", getParentAccountsByCompanyId);

// ----------- Sub-Of-Subgroup Account Controllers ----------- //
router.post("/sub-of-subgroup", createSubOfSubgroup);
router.get("/sub-of-subgroup/:subgroup_id", getSubOfSubgroupsBySubgroupId);
router.delete("/sub-of-subgroup/:id", deleteSubOfSubgroup);

// ----------- Account Controllers ----------- //

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/company/:company_id", getAccountsByCompanyId);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.get("/ledger/:company_id/:subgroup_id",getLedger)
router.get(
  "/ledger/company/:company_id/subgroup/:sub_of_subgroup_id",
  getLedgerBySubOfSubgroup
);
export default router;
