


import { Router } from "express";
import { 
  createOrUpdateSalesOrder,
  deleteSalesOrder,
  getSalesOrderById,
  getSalesOrdersByCompanyId
} from "../controllers/salesOrderController.js";
import upload from "../middlewares/multer.js";

const router = Router();

// Create Sales Order (POST)
// router.post("/create-sales-order",upload.fields([
//     { name: "files", maxCount: 20 }, // multiple images
//     { name: "logo_url", maxCount: 1 },
//     { name: "signature_url", maxCount: 1 },
//     { name: "photo_url", maxCount: 1 },
//     { name: "attachment_url", maxCount: 1 }
//   ]), createOrUpdateSalesOrder);
// router.put("/create-sales-order/:id",upload.fields([
//     { name: "files", maxCount: 20 },
//     { name: "logo_url", maxCount: 1 },
//     { name: "signature_url", maxCount: 1 },
//     { name: "photo_url", maxCount: 1 },
//     { name: "attachment_url", maxCount: 1 }
//   ]),createOrUpdateSalesOrder);



  router.post("/create-sales-order", createOrUpdateSalesOrder);
router.put("/create-sales-order/:id", createOrUpdateSalesOrder);


router.get('/company/:companyId', getSalesOrdersByCompanyId);
router.get('/:id', getSalesOrderById);
router.delete('/:id', deleteSalesOrder);

// Save or Update Sales Order (legacy - supports both create and update)


export default router;