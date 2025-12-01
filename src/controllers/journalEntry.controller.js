import prisma from "../config/db.js";



/**
 * Simple generator: finds numeric suffixes in existing voucher strings and returns next one.
 * Example: existing ["VCH-001","VCH-002"] -> returns "VCH-003"
 */
function generateNextVoucher(existing = [], prefix = "VCH-") {
  const nums = existing
    .map((s) => {
      if (!s) return null;
      const m = String(s).match(/(\d+)$/);
      return m ? Number(m[1]) : null;
    })
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 0;
  const next = (max + 1).toString().padStart(3, "0");
  return prefix + next;
}

export const createJournalEntry = async (req, res) => {
  try {
    console.log("📌 Uploaded Files =>", req.files);

    // use company_id from route params
    const { company_id } = req.params;

    const {
      voucher_no_auto: incomingVoucherNo,
      manual_voucher_no,
      voucher_date,
      narration,
      created_by,
      lines
    } = req.body;

    let parsedLines = typeof lines === "string" ? JSON.parse(lines) : lines;

    if (!parsedLines || parsedLines.length === 0) {
      return res.status(400).json({ message: "At least one journal line required" });
    }

    const totalDebit = parsedLines.reduce((sum, l) => sum + Number(l.debit_amount || 0), 0);
    const totalCredit = parsedLines.reduce((sum, l) => sum + Number(l.credit_amount || 0), 0);

    if (totalDebit !== totalCredit) {
      return res.status(400).json({ message: "Debit and Credit must be equal" });
    }

    // ----------------- voucher_no_auto: generate if missing -----------------
    let voucher_no_auto = incomingVoucherNo || null;
    if (!voucher_no_auto) {
      // fetch recent voucher_no_auto for this company to calculate next
      const recent = await prisma.journal_entries.findMany({
        where: { company_id: Number(company_id) },
        select: { voucher_no_auto: true },
        orderBy: { id: "desc" },
        take: 200,
      });
      const existing = recent.map((r) => r.voucher_no_auto).filter(Boolean);
      voucher_no_auto = generateNextVoucher(existing, "VCH-");
      console.log("Auto-generated voucher_no_auto:", voucher_no_auto);
    }
    // -----------------------------------------------------------------------

    // STEP 1: Create Journal Entry (try once, handle unique race by retrying once)
    let journalEntry;
    try {
      journalEntry = await prisma.journal_entries.create({
        data: {
          voucher_no_auto,
          manual_voucher_no,
          voucher_date: voucher_date ? new Date(voucher_date) : new Date(),
          narration,
          company_id: Number(company_id),
          created_by: created_by ? Number(created_by) : null,
          total_debit: totalDebit,
          total_credit: totalCredit,
        },
      });
    } catch (err) {
      // handle unique constraint race on voucher_no_auto (Prisma P2002)
      if (
        err &&
        err.code === "P2002" &&
        err.meta &&
        err.meta.target &&
        String(err.meta.target).includes("unique")
      ) {
        console.warn("Voucher unique constraint hit. Regenerating and retrying once...");
        // regen and retry once
        const recent = await prisma.journal_entries.findMany({
          where: { company_id: Number(company_id) },
          select: { voucher_no_auto: true },
          orderBy: { id: "desc" },
          take: 200,
        });
        const existing = recent.map((r) => r.voucher_no_auto).filter(Boolean);
        const alt = generateNextVoucher(existing, "VCH-");
        voucher_no_auto = alt;
        try {
          journalEntry = await prisma.journal_entries.create({
            data: {
              voucher_no_auto,
              manual_voucher_no,
              voucher_date: voucher_date ? new Date(voucher_date) : new Date(),
              narration,
              company_id: Number(company_id),
              created_by: created_by ? Number(created_by) : null,
              total_debit: totalDebit,
              total_credit: totalCredit,
            },
          });
        } catch (e2) {
          console.error("Retry create failed:", e2);
          return res.status(500).json({ success: false, message: "Server error", error: e2.message });
        }
      } else {
        console.error("Prisma create error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message || String(err) });
      }
    }

    // STEP 2: Create Journal Lines
    if (parsedLines && parsedLines.length > 0) {
      await prisma.journal_lines.createMany({
        data: parsedLines.map((l, index) => ({
          journal_entry_id: journalEntry.id,
          account_id: Number(l.account_id),
          debit_amount: Number(l.debit_amount || 0),
          credit_amount: Number(l.credit_amount || 0),
          narration: l.narration || "",
          seq: index + 1,
        })),
      });
    }

    // STEP 3: Attachments (multer-storage-cloudinary)
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map((f) => ({
        journal_entry_id: journalEntry.id,
        file_name: f.originalname,
        file_url: f.path,
        file_type: f.mimetype,
        size: f.size,
        public_id: f.filename,
      }));

      await prisma.journal_attachments.createMany({ data: attachments });
    }

    const fullEntry = await prisma.journal_entries.findUnique({
      where: { id: journalEntry.id },
      include: { lines: true, attachments: true },
    });

    return res.status(201).json({
      message: "Journal Entry Created Successfully",
      data: fullEntry,
    });

  } catch (error) {
    console.error("CREATE JOURNAL ERROR:", error);
    res.status(500).json({
      message: "Error creating journal entry",
      error: error.message,
    });
  }
};




export const getJournalEntries = async (req, res) => {
  try {
   
    const { company_id } = req.params;
    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id required" });
    }

    const {
      voucher_type,
      from_date,
      to_date,
      q,
      limit = 50,
      page = 1,
    } = req.query;
    const take = Math.min(Number(limit) || 50, 200);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const where = { company_id: Number(company_id) };
    if (voucher_type) where.voucher_type = voucher_type;
    if (from_date || to_date) where.voucher_date = {};
    if (from_date) where.voucher_date.gte = new Date(from_date);
    if (to_date) where.voucher_date.lte = new Date(to_date);
    if (q) where.narration = { contains: q, mode: "insensitive" };

    const [rows, total] = await Promise.all([
      prisma.journal_entries.findMany({
        where,
        include: { lines: true, attachments: true },
        orderBy: [{ voucher_date: "desc" }, { id: "desc" }],
        skip,
        take,
      }),
      prisma.journal_entries.count({ where }),
    ]);

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page) || 1, limit: take },
    });
  } catch (err) {
    console.error("getJournalEntries error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const getJournalEntryById = async (req, res) => {
  try {
    const { company_id, id } = req.params;
    if (!company_id || !id) {
      return res.status(400).json({
        success: false,
        message: "company_id and id required",
      });
    }

    const entry = await prisma.journal_entries.findFirst({
      where: { id: Number(id), company_id: Number(company_id) },
      include: { lines: true, attachments: true },
    });

    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: "Journal entry not found" });
    }

    return res.json({ success: true, data: entry });
  } catch (err) {
    console.error("getJournalEntryById error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const updateJournalEntry = async (req, res) => {
  try {
    const { company_id, id } = req.params;
    if (!company_id || !id) {
      return res.status(400).json({
        success: false,
        message: "company_id and id required",
      });
    }

    // Debug – see what comes in
    console.log("UPDATE JOURNAL BODY =>", req.body);
    console.log("UPDATE JOURNAL FILES (raw) =>", req.files);

    const {
      voucher_no_auto,
      manual_voucher_no,
      voucher_type,
      voucher_date,
      narration,
      created_by,
      lines,
    } = req.body;

    // parse lines safely
    let parsedLines = [];
    if (typeof lines === "string") {
      try {
        parsedLines = JSON.parse(lines);
      } catch (e) {
        console.error("Failed to parse lines JSON:", e.message);
        parsedLines = [];
      }
    } else if (Array.isArray(lines)) parsedLines = lines;

    const total_debit = parsedLines.reduce(
      (s, l) => s + Number(l.debit_amount || 0),
      0
    );
    const total_credit = parsedLines.reduce(
      (s, l) => s + Number(l.credit_amount || 0),
      0
    );

    const updated = await prisma.$transaction(async (tx) => {
      const exists = await tx.journal_entries.findFirst({
        where: { id: Number(id), company_id: Number(company_id) },
      });
      if (!exists) throw new Error("Journal entry not found");

      // delete existing lines
      await tx.journal_lines.deleteMany({
        where: { journal_entry_id: Number(id) },
      });

      // create new lines if provided
      if (parsedLines.length > 0) {
        const toCreate = parsedLines.map((l, idx) => ({
          journal_entry_id: Number(id),
          account_id: Number(l.account_id),
          seq: typeof l.seq === "number" ? l.seq : idx,
          debit_amount: l.debit_amount ? Number(l.debit_amount) : 0,
          credit_amount: l.credit_amount ? Number(l.credit_amount) : 0,
          narration: l.narration || null,
        }));
        await tx.journal_lines.createMany({ data: toCreate });
      }

      // update header
      const header = await tx.journal_entries.update({
        where: { id: Number(id) },
        data: {
          voucher_no_auto: voucher_no_auto || exists.voucher_no_auto,
          manual_voucher_no:
            manual_voucher_no !== undefined
              ? manual_voucher_no
              : exists.manual_voucher_no,
          voucher_type:
            voucher_type !== undefined ? voucher_type : exists.voucher_type,
          voucher_date: voucher_date
            ? new Date(voucher_date)
            : exists.voucher_date,
          narration: narration !== undefined ? narration : exists.narration,
          total_debit,
          total_credit,
          updated_at: new Date(),
          created_by: created_by ? Number(created_by) : exists.created_by,
        },
      });

      return header;
    });

    // ----------------- Attachments handling (same approach as create) -----------------
    // Normalize files: support req.files array, single req.file, or object
    const files = [];
    if (Array.isArray(req.files)) files.push(...req.files);
    else if (req.file) files.push(req.file);
    else if (req.files && typeof req.files === "object") files.push(...Object.values(req.files).flat());

    if (files.length > 0) {
      const attachments = files.map((f) => ({
        journal_entry_id: Number(id),
        file_name: f.originalname || f.name || f.filename || null,
        file_url: f.path || f.location || f.url || null, // expect multer-storage-cloudinary to populate .path (or .location)
        file_type: f.mimetype || f.format || null,
        size: f.size || null,
        public_id: f.filename || f.public_id || null,
      })).filter(a => a.file_url); // only insert if we have some URL/path

      if (attachments.length > 0) {
        try {
          await prisma.journal_attachments.createMany({ data: attachments });
          console.log("Saved new attachments to DB:", attachments.length);
        } catch (e) {
          console.error("Failed to save attachments to DB:", e);
        }
      } else {
        console.log("No valid attachment URLs found in uploaded files.");
      }
    }

    // fetch updated entry with relations
    const result = await prisma.journal_entries.findUnique({
      where: { id: Number(id) },
      include: { lines: true, attachments: true },
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("updateJournalEntry error:", err);
    if (err.message === "Journal entry not found") {
      return res.status(404).json({ success: false, message: err.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteJournalEntry = async (req, res) => {
  try {
    const { company_id, id } = req.params;
    if (!company_id || !id) {
      return res.status(400).json({
        success: false,
        message: "company_id and id required",
      });
    }

    const attachments = await prisma.journal_attachments.findMany({
      where: { journal_entry_id: Number(id) },
    });

    await prisma.$transaction([
      prisma.journal_attachments.deleteMany({
        where: { journal_entry_id: Number(id) },
      }),
      prisma.journal_lines.deleteMany({
        where: { journal_entry_id: Number(id) },
      }),
      prisma.journal_entries.deleteMany({
        where: { id: Number(id), company_id: Number(company_id) },
      }),
    ]);

    // Remove from Cloudinary
    for (const a of attachments) {
      if (a.public_id) {
        try {
          await deleteFromCloudinary(a.public_id);
        } catch (e) {
          console.warn("Failed to delete from cloudinary:", e.message);
        }
      }
    }

    return res.json({ success: true, message: "Journal entry deleted" });
  } catch (err) {
    console.error("deleteJournalEntry error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
