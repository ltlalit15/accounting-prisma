


import { Router } from "express";
import { 
  createOrUpdateSalesOrder,
  getSalesOrderById,
  getSalesOrdersByCompanyId
} from "../controllers/salesOrderController.js";

const router = Router();

// Create Sales Order (POST)
router.post("/create-sales-order", createOrUpdateSalesOrder);
router.put("/create-sales-order/:id", createOrUpdateSalesOrder);
{/*
router.put("/save-or-update/:id", saveOrUpdateSalesOrder);

router.get("/", getAllSalesOrders);
*/}
router.get('/company/:companyId', getSalesOrdersByCompanyId);
router.get('/:id', getSalesOrderById);

// Save or Update Sales Order (legacy - supports both create and update)


export default router;