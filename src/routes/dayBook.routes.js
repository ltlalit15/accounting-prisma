


import express from "express"
import { deleteDayBookEntry, getDayBook } from "../controllers/dayBook.controller.js"

const router = express.Router()

router.get("/:company_id", getDayBook)
router.delete("/:id", deleteDayBookEntry)

export default router