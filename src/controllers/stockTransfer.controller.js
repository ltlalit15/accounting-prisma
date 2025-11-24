import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

/** ✅ Create Stock Transfer (no relations, no items) */
// export const createTransfer = async (req, res) => {
//   try {
//     const {
//       company_id,
//       voucher_no,
//       manual_voucher_no,
//       transfer_date,
//       destination_warehouse_id,
//       notes,
//     } = req.body;

//     // Validate transfer_date
//     const parsedDate = transfer_date ? new Date(transfer_date) : new Date();
//     if (isNaN(parsedDate)) {
//       return res.status(400).json({ success: false, message: "Invalid transfer date" });
//     }

//     const transfer = await prisma.transfers.create({
//       data: {
//         company_id: parseInt(company_id),
//         voucher_no: voucher_no || null,
//         manual_voucher_no: manual_voucher_no || null,
//         transfer_date: parsedDate,
//         destination_warehouse_id: parseInt(destination_warehouse_id),
//         notes: notes || null,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Transfer created successfully",
//       data: transfer,
//     });
//   } catch (error) {
//     console.error("❌ Error creating transfer:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create transfer",
//       error: error.message,
//     });
//   }
// };


// export const createTransfer = async (req, res) => {
//   try {
//     const {
//       company_id,
//       voucher_no,
//       manual_voucher_no,
//       transfer_date,
//       destination_warehouse_id,
//       notes,
//       items, // array of transfer items
//     } = req.body;

//     // 🧩 Validate inputs
//     if (!company_id || !destination_warehouse_id) {
//       return res.status(400).json({
//         success: false,
//         message: "company_id and destination_warehouse_id are required",
//       });
//     }

//     // 🗓️ Parse date safely
//     const parsedDate = transfer_date ? new Date(transfer_date) : new Date();
//     if (isNaN(parsedDate.getTime())) {
//       return res.status(400).json({ success: false, message: "Invalid transfer date" });
//     }

//     // 🧾 Parse items safely
//     let parsedItems = [];
//     if (items) {
//       parsedItems = typeof items === "string" ? JSON.parse(items) : items;
//     }

//     // 🧮 Transaction — create transfer + items
//     const transfer = await prisma.$transaction(async (tx) => {
//       // Create main transfer record
//       const createdTransfer = await tx.transfers.create({
//         data: {
//           company_id: Number(company_id),
//           voucher_no: voucher_no || null,
//           manual_voucher_no: manual_voucher_no || null,
//           transfer_date: parsedDate,
//           destination_warehouse_id: Number(destination_warehouse_id),
//           notes: notes || null,
//         },
//       });

//       // Create related items (if any)
//       if (parsedItems.length > 0) {
//         const formattedItems = parsedItems.map((item) => ({
//           transfer_id: createdTransfer.id,
//           product_id: Number(item.product_id),
//           source_warehouse_id: Number(item.source_warehouse_id),
//           qty: new Prisma.Decimal(item.qty || 0),
//           rate: new Prisma.Decimal(item.rate || 0),
//           narration: item.narration || null,
//         }));

//         await tx.transfer_items.createMany({ data: formattedItems });
//       }

//       return createdTransfer;
//     });

//     // ✅ Success Response
//     res.status(201).json({
//       success: true,
//       message: "Transfer created successfully",
//       data: transfer,
//     });
//   } catch (error) {
//     console.error("❌ Error creating transfer:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create transfer",
//       error: error.message,
//     });
//   }
// };
export const createTransfer = async (req, res) => {
  try {
    const {
      company_id,
      voucher_no,
      manual_voucher_no,
      transfer_date,
      destination_warehouse_id,
      notes,
      items,
    } = req.body;

    if (!company_id || !destination_warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "company_id and destination_warehouse_id are required",
      });
    }

    const parsedDate = transfer_date ? new Date(transfer_date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid transfer date" });
    }

    let parsedItems = [];
    if (items) parsedItems = typeof items === "string" ? JSON.parse(items) : items;

    // ========================================================================
    // 🚨 STOCK VALIDATION BEFORE TRANSACTION
    // ========================================================================
    for (const item of parsedItems) {
      const productId = Number(item.product_id);
      const sourceWh = Number(item.source_warehouse_id);
      const qty = Number(item.qty);

      const sourceStock = await prisma.product_warehouses.findUnique({
        where: {
          product_id_warehouse_id: { product_id: productId, warehouse_id: sourceWh },
        },
      });

      // ❌ if no record found
      if (!sourceStock) {
        return res.status(400).json({
          success: false,
          message: `No stock found for product_id ${productId} in warehouse ${sourceWh}`,
        });
      }

      // ❌ if stock insufficient
      if (sourceStock.stock_qty < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product_id ${productId} in warehouse ${sourceWh}. Available: ${sourceStock.stock_qty}, Required: ${qty}`,
        });
      }
    }

    // ========================================================================
    // 🧮 TRANSACTION — Create transfer, items, and update stock
    // ========================================================================
    const transfer = await prisma.$transaction(async (tx) => {
      const createdTransfer = await tx.transfers.create({
        data: {
          company_id: Number(company_id),
          voucher_no: voucher_no || null,
          manual_voucher_no: manual_voucher_no || null,
          transfer_date: parsedDate,
          destination_warehouse_id: Number(destination_warehouse_id),
          notes: notes || null,
        },
      });

      for (const item of parsedItems) {
        const productId = Number(item.product_id);
        const sourceWh = Number(item.source_warehouse_id);
        const destWh = Number(destination_warehouse_id);
        const qty = Number(item.qty);

        await tx.transfer_items.create({
          data: {
            transfer_id: createdTransfer.id,
            product_id: productId,
            source_warehouse_id: sourceWh,
            qty,
            rate: item.rate || 0,
            narration: item.narration || null,
          },
        });

        // 1️⃣ Reduce stock from source warehouse
        await tx.product_warehouses.update({
          where: {
            product_id_warehouse_id: { product_id: productId, warehouse_id: sourceWh },
          },
          data: {
            stock_qty: { decrement: qty },
          },
        });

        // 2️⃣ Increase stock in destination warehouse
        const destStock = await tx.product_warehouses.findUnique({
          where: {
            product_id_warehouse_id: { product_id: productId, warehouse_id: destWh },
          },
        });

        if (destStock) {
          await tx.product_warehouses.update({
            where: {
              product_id_warehouse_id: { product_id: productId, warehouse_id: destWh },
            },
            data: { stock_qty: { increment: qty } },
          });
        } else {
          await tx.product_warehouses.create({
            data: {
              product_id: productId,
              warehouse_id: destWh,
              stock_qty: qty,
            },
          });
        }
      }

      return createdTransfer;
    });

    return res.status(201).json({
      success: true,
      message: "Transfer created successfully",
      data: transfer,
    });
  } catch (error) {
    console.error("❌ Error creating transfer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transfer",
      error: error.message,
    });
  }
};



// export const updateTransfer = async (req, res) => {
//   try {
//     const { id } = req.params; // transfer ID
//     const {
//       company_id,
//       voucher_no,
//       manual_voucher_no,
//       transfer_date,
//       destination_warehouse_id,
//       notes,
//       items, // updated array of transfer items
//     } = req.body;

//     // 🧩 Validate
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Transfer ID is required",
//       });
//     }

//     // Check if transfer exists
//     const existingTransfer = await prisma.transfers.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!existingTransfer) {
//       return res.status(404).json({
//         success: false,
//         message: "Transfer not found",
//       });
//     }

//     // 🗓️ Parse date
//     const parsedDate = transfer_date ? new Date(transfer_date) : existingTransfer.transfer_date;
//     if (isNaN(parsedDate.getTime())) {
//       return res.status(400).json({ success: false, message: "Invalid transfer date" });
//     }

//     // 🧾 Parse items safely
//     let parsedItems = [];
//     if (items) {
//       parsedItems = typeof items === "string" ? JSON.parse(items) : items;
//     }

//     // ✅ Run transaction for update consistency
//     const updatedTransfer = await prisma.$transaction(async (tx) => {
//       // Update main transfer
//       const updated = await tx.transfers.update({
//         where: { id: Number(id) },
//         data: {
//           company_id: company_id ? Number(company_id) : existingTransfer.company_id,
//           voucher_no: voucher_no ?? existingTransfer.voucher_no,
//           manual_voucher_no: manual_voucher_no ?? existingTransfer.manual_voucher_no,
//           transfer_date: parsedDate,
//           destination_warehouse_id: destination_warehouse_id
//             ? Number(destination_warehouse_id)
//             : existingTransfer.destination_warehouse_id,
//           notes: notes ?? existingTransfer.notes,
//         },
//       });

//       // ✅ Update items only if provided
//       if (parsedItems.length > 0) {
//         // Delete old transfer items
//         await tx.transfer_items.deleteMany({
//           where: { transfer_id: Number(id) },
//         });

//         // Insert new ones
//         const formattedItems = parsedItems.map((item) => ({
//           transfer_id: Number(id),
//           product_id: Number(item.product_id),
//           source_warehouse_id: Number(item.source_warehouse_id),
//           qty: new Prisma.Decimal(item.qty || 0),
//           rate: new Prisma.Decimal(item.rate || 0),
//           narration: item.narration || null,
//         }));

//         await tx.transfer_items.createMany({ data: formattedItems });
//       }

//       return updated;
//     });

//     // ✅ Return success
//     res.status(200).json({
//       success: true,
//       message: "Transfer updated successfully",
//       data: updatedTransfer,
//     });
//   } catch (error) {
//     console.error("❌ Error updating transfer:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update transfer",
//       error: error.message,
//     });
//   }
// };

export const updateTransfer = async (req, res) => {
  try {
    const { id } = req.params; // transfer ID
    const {
      company_id,
      voucher_no,
      manual_voucher_no,
      transfer_date,
      destination_warehouse_id,
      notes,
      items, // updated array
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transfer ID is required",
      });
    }

    // Fetch old transfer + items
    const oldTransfer = await prisma.transfers.findUnique({
      where: { id: Number(id) },
      include: { transfer_items: true },
    });

    if (!oldTransfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    // Parse items
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === "string" ? JSON.parse(items) : items;
    }

    const parsedDate = transfer_date ? new Date(transfer_date) : oldTransfer.transfer_date;

    // =========================
    // 🔥 MAIN TRANSACTION
    // =========================
    const updatedTransfer = await prisma.$transaction(async (tx) => {
      
      // 1️⃣ REVERSE OLD STOCK MOVEMENTS
      for (const oldItem of oldTransfer.transfer_items) {
        // Increase old source stock
        await tx.product_warehouses.updateMany({
          where: {
            product_id: oldItem.product_id,
            warehouse_id: oldItem.source_warehouse_id,
          },
          data: {
            stock_qty: { increment: Number(oldItem.qty) },
          },
        });

        // Reduce old destination stock (if exists)
        await tx.product_warehouses.updateMany({
          where: {
            product_id: oldItem.product_id,
            warehouse_id: oldTransfer.destination_warehouse_id,
          },
          data: {
            stock_qty: { decrement: Number(oldItem.qty) },
          },
        });
      }

      // 2️⃣ UPDATE TRANSFER MAIN RECORD
      const updated = await tx.transfers.update({
        where: { id: Number(id) },
        data: {
          company_id: company_id ? Number(company_id) : oldTransfer.company_id,
          voucher_no: voucher_no ?? oldTransfer.voucher_no,
          manual_voucher_no: manual_voucher_no ?? oldTransfer.manual_voucher_no,
          transfer_date: parsedDate,
          destination_warehouse_id:
            destination_warehouse_id
              ? Number(destination_warehouse_id)
              : oldTransfer.destination_warehouse_id,
          notes: notes ?? oldTransfer.notes,
        },
      });

      // 3️⃣ DELETE OLD ITEMS
      await tx.transfer_items.deleteMany({
        where: { transfer_id: Number(id) },
      });

      // 4️⃣ PROCESS NEW ITEMS
      for (const item of parsedItems) {
        const qty = Number(item.qty);

        if (qty <= 0)
          throw new Error("Qty must be greater than zero");

        // Check stock availability
        const sourceStock = await tx.product_warehouses.findUnique({
          where: {
            product_id_warehouse_id: {
              product_id: Number(item.product_id),
              warehouse_id: Number(item.source_warehouse_id),
            },
          },
        });

        if (!sourceStock || sourceStock.stock_qty < qty) {
          throw new Error(
            `Insufficient stock for product ID ${item.product_id} in warehouse ${item.source_warehouse_id}`
          );
        }

        // Deduct from source
        await tx.product_warehouses.update({
          where: {
            product_id_warehouse_id: {
              product_id: Number(item.product_id),
              warehouse_id: Number(item.source_warehouse_id),
            },
          },
          data: {
            stock_qty: { decrement: qty },
          },
        });

        // Add to destination (create row if not exists)
        await tx.product_warehouses.upsert({
          where: {
            product_id_warehouse_id: {
              product_id: Number(item.product_id),
              warehouse_id: Number(
                destination_warehouse_id ||
                  oldTransfer.destination_warehouse_id
              ),
            },
          },
          update: {
            stock_qty: { increment: qty },
          },
          create: {
            product_id: Number(item.product_id),
            warehouse_id: Number(
              destination_warehouse_id ||
                oldTransfer.destination_warehouse_id
            ),
            stock_qty: qty,
          },
        });

        // Create new transfer item record
        await tx.transfer_items.create({
          data: {
            transfer_id: Number(id),
            product_id: Number(item.product_id),
            source_warehouse_id: Number(item.source_warehouse_id),
            qty: qty,
            rate: Number(item.rate || 0),
            narration: item.narration || null,
          },
        });
      }

      return updated;
    });

    // ==========================
    // SUCCESS RESPONSE
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: updatedTransfer,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update transfer",
      error: error.message,
    });
  }
};

/** ✅ Get All Transfers (simplified) */
// export const getAllTransfers = async (req, res) => {
//   try {
//     const transfers = await prisma.transfers.findMany({
//       orderBy: { transfer_date: "desc" },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Transfers fetched successfully",
//       data: transfers,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching transfers:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch transfers",
//       error: error.message,
//     });
//   }
// };

// /** ✅ Get Transfers by Company ID (simplified) */
// export const getTransfersByCompanyId = async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const transfers = await prisma.transfers.findMany({
//       where: { company_id: parseInt(companyId) },
//       orderBy: { transfer_date: "desc" },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Transfers fetched successfully",
//       data: transfers,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching transfers by company:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch transfers by company",
//       error: error.message,
//     });
//   }
// };


export const getAllTransfers = async (req, res) => {
  try {
    const transfers = await prisma.transfers.findMany({
      include: {
        transfer_items: {
          include: {
            products: true,
            warehouses: true
          },
        },
      },
      orderBy: { id: "desc" },
    });

    if (transfers.length === 0) {
      return res.status(404).json({ success: false, message: "No transfers found" });
    }

    res.status(200).json({
      success: true,
      message: "All transfers fetched successfully",
      data: transfers,
    });
  } catch (error) {
    console.error("❌ Error fetching all transfers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfers",
      error: error.message,
    });
  }
};

// ✅ Get Transfer by ID
export const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.transfers.findUnique({
      where: { id: Number(id) },
      include: {
        transfer_items: {
          include: {
            products: true,
            warehouses: true,
          },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transfer fetched successfully",
      data: transfer,
    });
  } catch (error) {
    console.error("❌ Error fetching transfer by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer",
      error: error.message,
    });
  }
};

// ✅ Get Transfers by Company ID
export const getTransfersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const transfers = await prisma.transfers.findMany({
      where: { company_id: Number(company_id) },
      include: {
        transfer_items: {
          include: {
            products: true,
            warehouses: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    if (transfers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transfers found for this company",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transfers fetched successfully for the company",
      data: transfers,
    });
  } catch (error) {
    console.error("❌ Error fetching transfers by company:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company transfers",
      error: error.message,
    });
  }
};


 

export const deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTransfer = await prisma.transfers.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTransfer) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.transfer_items.deleteMany({ where: { transfer_id: Number(id) } });
      await tx.transfers.delete({ where: { id: Number(id) } });
    });

    res.status(200).json({
      success: true,
      message: "Transfer deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting transfer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transfer",
      error: error.message,
    });
  }
};
 