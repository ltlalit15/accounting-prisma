// src/routes/auth.routes.js
import { Router } from "express";
import {
  createCompany,
  createSuperAdmin,
  createUser,
  deleteCompany,
  deleteUser,
  getAllCompanies,
  getCompanyById,
  getUserById,
  getUsersByCompanyId,
  login,
  updateCompany,
  updateUser,
} from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.js";

const router = Router();

// // Public routes
// router.post("/company-login", companyLogin);
// router.post("/superadmin-login", superadminLogin); // ✅ NEW

// // Protected route
// router.get("/me/modules", authCompany, myModules);
router.post("/login", login);

//-------Supter Admin routes-------//
router.post("/Super-admin", upload.single("profile"), createSuperAdmin);

//-------Company routes-------//
router.post("/Company", createCompany);
router.put("/Company/:id", updateCompany);
router.get("/Company/:id", getCompanyById);
router.get("/Company", getAllCompanies);
router.delete("/Company/:id", deleteCompany);

//-------User routes-------//
router.post("/User", createUser);
router.put("/User/:id", updateUser);
router.delete("/User/:id", deleteUser);
router.get("/User/company/:company_id", getUsersByCompanyId);
router.get("/User/:id", getUserById);

export default router;
