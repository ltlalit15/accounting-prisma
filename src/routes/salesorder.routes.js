


import { Router } from "express";
import { 
  createSalesOrder,
  saveOrUpdateSalesOrder,
  getAllSalesOrders,
  getSalesOrdersByCompanyId
} from "../controllers/salesOrderController.js";

const router = Router();

// Create Sales Order (POST)
router.post("/create-sales-order", createSalesOrder);
router.put("/save-or-update/:id", saveOrUpdateSalesOrder);
router.get('/company/:companyId', getSalesOrdersByCompanyId);
router.get("/", getAllSalesOrders);



// Save or Update Sales Order (legacy - supports both create and update)


export default router;