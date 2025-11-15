// src/routes/transaction.routes.js
import { Router } from "express";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCompany,
  getAllTransactions,
  getTransactionById,
  getLedger,
} from "../controllers/transactionController.js";

const router = Router();

// ✅ Create a new transaction
router.post("/", createTransaction);



// ✅ Get all transactions (with company/customer/vendor/account details)
router.get("/", getAllTransactions);
router.get("/ledger", getLedger);
// ✅ Get a single transaction by ID
router.get("/:id",getTransactionById );

// ✅ Get all transactions for a specific company
router.get("/company/:company_id", getTransactionsByCompany); // Better URL clarity


// ✅ Update a transaction by ID
router.put("/:id", updateTransaction); // Using PUT for full/partial update (consistent with planController)

// ✅ Delete a transaction by ID
router.delete("/:id", deleteTransaction);

export default router;