import express from "express";
import { getPOSReport } from "../controllers/posReport.controller.js";


const router = express.Router();

router.get("/", getPOSReport);


export default router;