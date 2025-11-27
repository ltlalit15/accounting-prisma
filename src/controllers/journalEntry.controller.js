import { deleteFromCloudinary } from "../config/cloudinary.js";
import prisma from "../config/db.js";

/**
 * Helper: normalize uploaded file info (multer + multer-storage-cloudinary).
 */
const getFileMeta = (file) => {
  if (!file) return null;
  return {
    file_name:
      file.originalname || file.filename || file.public_id || "attachment",
    file_url: file.path || file.location || file.secure_url || file.url || "",
    file_type: file.mimetype || null,
    size: file.size || null,
    public_id: file.filename || file.public_id || null,
  };
};

export const createJournalEntry = async (req, res) => {
  try {
    const { company_id } = req.params;
    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "company_id required" });
    }

    // Debug – check body & files (remove later if you want)
    console.log("CREATE JOURNAL BODY =>", req.body);
    console.log("CREATE JOURNAL FILES =>", req.files);

    const {
      voucher_no_auto,
      manual_voucher_no,
      voucher_type,
      voucher_date,
      narration,
      created_by,
      lines, // expected: [{ account_id, debit_amount, credit_amount, narration, seq }]
    } = req.body;

    // Parse lines if passed as JSON string
    let parsedLines = [];
    if (typeof lines === "string") {
      try {
        parsedLines = JSON.parse(lines);
      } catch (e) {
        console.error("Failed to parse lines JSON:", e.message);
        parsedLines = [];
      }
    } else if (Array.isArray(lines)) {
      parsedLines = lines;
    }

    // Minimal validation
    if (!voucher_no_auto) {
      return res
        .status(400)
        .json({ success: false, message: "voucher_no_auto required" });
    }
    if (!voucher_date) {
      return res
        .status(400)
        .json({ success: false, message: "voucher_date required" });
    }

    // Calculate totals
    let total_debit = 0;
    let total_credit = 0;
    parsedLines.forEach((l) => {
      const debit = Number(l.debit_amount || 0);
      const credit = Number(l.credit_amount || 0);
      total_debit += debit;
      total_credit += credit;
    });

    // Create entry with nested lines
    const created = await prisma.journal_entries.create({
      data: {
        company_id: Number(company_id),
        voucher_no_auto,
        manual_voucher_no: manual_voucher_no || null,
        voucher_type: voucher_type || null,
        voucher_date: new Date(voucher_date),
        narration: narration || null,
        total_debit: total_debit || 0,
        total_credit: total_credit || 0,
        created_by: created_by ? Number(created_by) : null,
        lines: {
          create: parsedLines.map((l, idx) => ({
            account_id: Number(l.account_id),
            seq: typeof l.seq === "number" ? l.seq : idx,
            debit_amount: l.debit_amount ? Number(l.debit_amount) : 0,
            credit_amount: l.credit_amount ? Number(l.credit_amount) : 0,
            narration: l.narration || null,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    // Handle attachments (multer + cloudinary-storage)
    const files = req.files || (req.file ? [req.file] : []);
    if (files && files.length > 0) {
      const attachments = files.map((f) => {
        const meta = getFileMeta(f);
        return {
          journal_entry_id: created.id,
          file_name: meta.file_name,
          file_url: meta.file_url,
          file_type: meta.file_type,
          size: meta.size,
          public_id: meta.public_id,
        };
      });

      await prisma.journal_attachments.createMany({ data: attachments });
    }

    const result = await prisma.journal_entries.findUnique({
      where: { id: created.id },
      include: { lines: true, attachments: true },
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("createJournalEntry error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
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
    console.log("UPDATE JOURNAL FILES =>", req.files);

    const {
      voucher_no_auto,
      manual_voucher_no,
      voucher_type,
      voucher_date,
      narration,
      created_by,
      lines,
    } = req.body;

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

      await tx.journal_lines.deleteMany({
        where: { journal_entry_id: Number(id) },
      });

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

    // Attachments (newly uploaded files)
    const files = req.files || (req.file ? [req.file] : []);
    if (files && files.length > 0) {
      const attachments = files.map((f) => {
        const meta = getFileMeta(f);
        return {
          journal_entry_id: Number(id),
          file_name: meta.file_name,
          file_url: meta.file_url,
          file_type: meta.file_type,
          size: meta.size,
          public_id: meta.public_id,
        };
      });
      await prisma.journal_attachments.createMany({ data: attachments });
    }

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
