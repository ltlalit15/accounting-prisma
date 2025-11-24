import { Router } from "express";
import { createOrUpdatePurchaseOrder, deletePurchaseOrder, getPurchaseOrderById, getPurchaseOrdersByCompanyId } from "../controllers/purchaseOrder.controller.js";
import upload from "../middlewares/multer.js";

const router = Router();

{/* 

router.post("/create-purchase-order", createPurchaseOrder);
router.get("/get-orders", getAllPurchaseOrders);
router.get("/get-particular/:id", getPurchaseOrderById);
router.put("/update-purchase/:id", updatePurchaseOrder);
router.patch("/update-status/:id", updatePurchaseOrderStatus);
router.delete("/delete-purchase/:id", deletePurchaseOrder);
*/}

router.post("/create-purchase-order",createOrUpdatePurchaseOrder);
router.put("/create-purchase-order/:id", createOrUpdatePurchaseOrder);

  router.get("/company/:companyId", getPurchaseOrdersByCompanyId);
router.get("/:id", getPurchaseOrderById);
router.delete("/:id", deletePurchaseOrder);

export default router;