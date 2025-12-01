import express from "express";
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} from "../controllers/journalEntry.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/:company_id/journal-entries",
  upload.array("attachments", 5),
  createJournalEntry
);

router.get("/:company_id/journal-entries", getJournalEntries);
router.get("/:company_id/journal-entries/:id", getJournalEntryById);

router.put(
  "/:company_id/journal-entries/:id",
  upload.array("attachments", 5),
  updateJournalEntry
);

router.delete("/:company_id/journal-entries/:id", deleteJournalEntry);

export default router;
