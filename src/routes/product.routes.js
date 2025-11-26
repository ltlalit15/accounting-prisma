// src/routes/product.routes.js
import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getInventoryDetails,
  getInventoryItemDetails,
  getProductById,
  getProductsByCompany,
  getProductsByCompanyAndWarehouse,
  updateProduct,
} from "../controllers/product.controller.js";
//

const router = Router();

router.post("/", createProduct);

// 🟡 Get all
router.get("/", getAllProducts);

// 🟢 Get by company_id
router.get("/company/:company_id", getProductsByCompany);


router.get("/item-details/:product_id/:company_id", getInventoryItemDetails);


// 🟢 Get by company_id + warehouse_id
router.get(
  "/company/:company_id/warehouse/:warehouse_id",
  getProductsByCompanyAndWarehouse
);

// 🟢 Get by ID
router.get("/:id", getProductById);

// 🟠 Update
router.put("/:id", updateProduct);

// 🔴 Delete
router.delete("/:id", deleteProduct);

router.get("/inventory/details/:company_id/:product_id", getInventoryDetails);

export default router;
