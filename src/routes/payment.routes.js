import express from "express";
import {
  deletePayment,
  getAllPayments,
  getPaymentById,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/transactions", getAllPayments);
router.get("/transactions/:id", getPaymentById);
router.delete("/transactions/:id", deletePayment);

export default router;
