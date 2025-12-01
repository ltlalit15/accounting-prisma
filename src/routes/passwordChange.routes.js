import express from "express";
import {
  approvePasswordChangeRequest,
  createPasswordChangeRequest,
  getAllPasswordChangeRequests,
  getPasswordChangeRequestsByCompanyId,
  rejectPasswordChangeRequest,
} from "../controllers/passwordChange.controller.js";
const router = express.Router();

router.post("/request", createPasswordChangeRequest);
router.get("/requests", getAllPasswordChangeRequests);
router.put("/requests/:requestId/approve", approvePasswordChangeRequest);
router.put("/requests/:requestId/reject", rejectPasswordChangeRequest);
router.get("/my-requests/:companyId", getPasswordChangeRequestsByCompanyId);
export default router;
