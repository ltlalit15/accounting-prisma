import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const toNumber = (val) => {
  if (val == null) return null;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Get All Unit Details (with UOM & Company names — manually joined)
// export const getAllUnitDetails = async (req, res) => {
//   try {
//     const unitDetails = await prisma.unit_details.findMany({
//       orderBy: { id: 'desc' },
//     });

//     const uomIds = [...new Set(unitDetails.map(ud => ud.uom_id).filter(id => id !== null))];
//     const companyIds = [...new Set(unitDetails.map(ud => ud.company_id).filter(id => id !== null))];

//     const [uoms, companies] = await Promise.all([
//       uomIds.length > 0 
//         ? prisma.uoms.findMany({ 
//             where: { id: { in: uomIds } },
//             select: { id: true, unit_name: true }
//           })
//         : Promise.resolve([]),
//       companyIds.length > 0
//         ? prisma.companies.findMany({
//             where: { id: { in: companyIds } },
//             select: { id: true, name: true }
//           })
//         : Promise.resolve([])
//     ]);

//     const uomMap = new Map(uoms.map(u => [u.id, u.unit_name]));
//     const companyMap = new Map(companies.map(c => [c.id, c.name]));

//     const formattedData = unitDetails.map(ud => ({
//       id: toNumber(ud.id),
//       company_id: ud.company_id ? toNumber(ud.company_id) : null,
//       uom_id: ud.uom_id ? toNumber(ud.uom_id) : null,
//       weight_per_unit: ud.weight_per_unit,
//       created_at: ud.created_at,
//       uom_name: ud.uom_id ? uomMap.get(ud.uom_id) || null : null,
//       company_name: ud.company_id ? companyMap.get(ud.company_id) || null : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "All Unit Details fetched successfully",
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error("Error fetching Unit Details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Unit Details",
//       error: error.message,
//     });
//   }
// };
// export const getAllUnitDetails = async (req, res) => {
//   try {
//     const unitDetails = await prisma.unit_details.findMany({  // Changed here
//       orderBy: { id: 'desc' },
//     });

//     const uomIds = [...new Set(unitDetails.map(ud => ud.uom_id).filter(id => id !== null))];
//     const companyIds = [...new Set(unitDetails.map(ud => ud.company_id).filter(id => id !== null))];

//     const [uoms, companies] = await Promise.all([
//       uomIds.length > 0 
//         ? prisma.uom.findMany({  // Changed here
//             where: { id: { in: uomIds } },
//             select: { id: true, unit_name: true }
//           })
//         : Promise.resolve([]),
//       companyIds.length > 0
//         ? prisma.company.findMany({  // Changed here
//             where: { id: { in: companyIds } },
//             select: { id: true, name: true }
//           })
//         : Promise.resolve([]),
//     ]);

//     const uomMap = new Map(uoms.map(u => [u.id, u.unit_name]));
//     const companyMap = new Map(companies.map(c => [c.id, c.name]));

//     const formattedData = unitDetails.map(ud => ({
//       id: Number(ud.id),
//       company_id: ud.company_id ? Number(ud.company_id) : null,
//       uom_id: ud.uom_id ? Number(ud.uom_id) : null,
//       weight_per_unit: ud.weight_per_unit,
//       created_at: ud.created_at,
//       uom_name: ud.uom_id ? uomMap.get(ud.uom_id) || null : null,
//       company_name: ud.company_id ? companyMap.get(ud.company_id) || null : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "All Unit Details fetched successfully",
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error("Error fetching Unit Details:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Unit Details",
//       error: error.message,
//     });
//   }
// };


// ✅ Get Unit Detail By ID
// export const getUnitDetailById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const unitDetailId = parseInt(id, 10);

//     if (!unitDetailId || isNaN(unitDetailId)) {
//       return res.status(400).json({ success: false, message: "Valid Unit Detail ID required" });
//     }

//     const unitDetail = await prisma.unit_details.findUnique({
//       where: { id: unitDetailId },
//     });

//     if (!unitDetail) {
//       return res.status(404).json({ success: false, message: "Unit Detail not found" });
//     }

//     const promises = [];
//     if (unitDetail.uom_id) {
//       promises.push(prisma.uoms.findUnique({
//         where: { id: unitDetail.uom_id },
//         select: { unit_name: true }
//       }));
//     } else {
//       promises.push(Promise.resolve(null));
//     }

//     if (unitDetail.company_id) {
//       promises.push(prisma.users.findUnique({
//         where: { id: unitDetail.company_id },
//         select: { name: true }
//       }));
//     } else {
//       promises.push(Promise.resolve(null));
//     }

//     const [uom, company] = await Promise.all(promises);

//     return res.status(200).json({
//       success: true,
//       message: "Unit Detail fetched successfully",
//       data: {
//         id: toNumber(unitDetail.id),
//         company_id: unitDetail.company_id ? toNumber(unitDetail.company_id) : null,
//         uom_id: unitDetail.uom_id ? toNumber(unitDetail.uom_id) : null,
//         weight_per_unit: unitDetail.weight_per_unit,
//         created_at: unitDetail.created_at,
//         uom_name: uom?.unit_name || null,
//         company_name: company?.name || null,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching Unit Detail by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Unit Detail",
//       error: error.message,
//     });
//   }
// };
// export const getUnitDetailById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const unitDetailId = parseInt(id, 10);

//     if (!unitDetailId || isNaN(unitDetailId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid Unit Detail ID required",
//       });
//     }

//     const unitDetail = await prisma.unit_details.findUnique({
//       where: { id: unitDetailId },
//     });

//     if (!unitDetail) {
//       return res.status(404).json({
//         success: false,
//         message: "Unit Detail not found",
//       });
//     }

//     const [uom, company] = await Promise.all([
//       unitDetail.uom_id
//         ? prisma.uoms.findUnique({
//             where: { id: unitDetail.uom_id },
//             select: { unit_name: true },
//           })
//         : null,

//       unitDetail.company_id
//         ? prisma.company.findUnique({
//             where: { id: unitDetail.company_id },
//             select: { name: true },
//           })
//         : null,
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Unit Detail fetched successfully",
//       data: {
//         id: Number(unitDetail.id),
//         company_id: unitDetail.company_id ? Number(unitDetail.company_id) : null,
//         uom_id: unitDetail.uom_id ? Number(unitDetail.uom_id) : null,
//         category: unitDetail.category,
//         weight_per_unit: unitDetail.weight_per_unit,
//         created_at: unitDetail.created_at,

//         // fetched relation values
//         uom_name: uom?.unit_name || null,
//         company_name: company?.name || null,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching Unit Detail by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Unit Detail",
//       error: error.message,
//     });
//   }
// };




// ✅ Get Unit Details By Company ID
// export const getUnitDetailsByCompanyId = async (req, res) => {
//   try {
//     const { company_id } = req.params;
//     const companyId = parseInt(company_id, 10);

//     if (!companyId || isNaN(companyId)) {
//       return res.status(400).json({ success: false, message: "Valid Company ID required" });
//     }

//     const unitDetails = await prisma.unit_details.findMany({
//       where: { company_id: companyId },
//       orderBy: { id: 'desc' },
//     });

//     const uomIds = [...new Set(unitDetails.map(ud => ud.uom_id).filter(id => id !== null))];
//     let uomMap = new Map();
//     if (uomIds.length > 0) {
//       const uoms = await prisma.uoms.findMany({
//         where: { id: { in: uomIds } },
//         select: { id: true, unit_name: true }
//       });
//       uomMap = new Map(uoms.map(u => [u.id, u.unit_name]));
//     }

//     const formattedData = unitDetails.map(ud => ({
//       id: toNumber(ud.id),
//       company_id: toNumber(ud.company_id),
//       uom_id: ud.uom_id ? toNumber(ud.uom_id) : null,
//       weight_per_unit: ud.weight_per_unit,
//       created_at: ud.created_at,
//       uom_name: ud.uom_id ? uomMap.get(ud.uom_id) || null : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Unit Details for Company fetched successfully",
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error("Error fetching Unit Details by Company ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Unit Details",
//       error: error.message,
//     });
//   }
// };
// export const getUnitDetailsByCompanyId = async (req, res) => {
//   try {
//     const { company_id } = req.params;
//     const companyId = parseInt(company_id, 10);

//     if (!companyId || isNaN(companyId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid Company ID required",
//       });
//     }

//     const unitDetails = await prisma.unit_details.findMany({
//       where: { company_id: companyId },
//       orderBy: { id: "desc" },
//     });

//     const uomIds = [...new Set(unitDetails.map(u => u.uom_id).filter(Boolean))];

//     let uomMap = new Map();
//     if (uomIds.length > 0) {
//       const uoms = await prisma.uoms.findMany({
//         where: { id: { in: uomIds } },
//         select: { id: true, unit_name: true },
//       });
//       uomMap = new Map(uoms.map(u => [u.id, u.unit_name]));
//     }

//     const formattedData = unitDetails.map(u => ({
//       id: Number(u.id),
//       company_id: Number(u.company_id),
//       uom_id: u.uom_id ? Number(u.uom_id) : null,
//       category: u.category,
//       weight_per_unit: u.weight_per_unit,
//       created_at: u.created_at,

//       uom_name: u.uom_id ? uomMap.get(u.uom_id) || null : null,
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Unit Details for Company fetched successfully",
//       data: formattedData,
//     });
//   } catch (error) {
//     console.error("Error fetching Unit Details by Company ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Unit Details",
//       error: error.message,
//     });
//   }
// };



// ✅ Create Unit Detail — WITH VALIDATION
// export const createUnitDetail = async (req, res) => {
//   try {
//     const { company_id, uom_id, weight_per_unit } = req.body;

//     // Basic presence check
//     if (company_id == null || uom_id == null || weight_per_unit == null) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID, UOM ID, and Weight Per Unit are required",
//       });
//     }

//     const companyIdNum = toNumber(company_id);
//     const uomIdNum = toNumber(uom_id);

//     // Validate company exists
//     const companyExists = await prisma.users.findUnique({
//       where: { id: companyIdNum },
//       select: { id: true }
//     });

//     if (!companyExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Company not found"
//       });
//     }

//     // Validate UOM exists and belongs to the same company
//     const uom = await prisma.uoms.findUnique({
//       where: { id: uomIdNum },
//       select: { id: true, company_id: true }
//     });

//     if (!uom) {
//       return res.status(400).json({
//         success: false,
//         message: "UOM not found"
//       });
//     }

//     if (toNumber(uom.company_id) !== companyIdNum) {
//       return res.status(400).json({
//         success: false,
//         message: "UOM does not belong to the specified company"
//       });
//     }

//     // Create unit detail
//     const newUnitDetail = await prisma.unit_details.create({
//       data: {
//         company_id: companyIdNum,
//         uom_id: uomIdNum,
//         weight_per_unit: Number(weight_per_unit),
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Unit Detail created successfully",
//       data: {
//         id: toNumber(newUnitDetail.id),
//         company_id: toNumber(newUnitDetail.company_id),
//         uom_id: toNumber(newUnitDetail.uom_id),
//         weight_per_unit: newUnitDetail.weight_per_unit,
//         created_at: newUnitDetail.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating Unit Detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create Unit Detail",
//       error: error.message,
//     });
//   }
// };
// export const createUnitDetail = async (req, res) => {
//   try {
//     const { company_id, uom_id, category, weight_per_unit } = req.body;

//     // Enhanced validation
//     if (company_id == null || uom_id == null || category == null || weight_per_unit == null) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID, UOM ID, Category, and Weight Per Unit are required",
//       });
//     }

//     // Validate category is non-empty string
//     if (typeof category !== 'string' || category.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         message: "Category must be a non-empty string",
//       });
//     }

//     // Validate weight is positive number
//     const weightValue = Number(weight_per_unit);
//     if (isNaN(weightValue) || weightValue <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Weight per unit must be a positive number",
//       });
//     }

//     const companyIdNum = toNumber(company_id);
//     const uomIdNum = toNumber(uom_id);

//     // Validate company exists
//     const companyExists = await prisma.users.findUnique({
//       where: { id: companyIdNum },
//       select: { id: true }
//     });

//     if (!companyExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Company not found"
//       });
//     }

//     // Validate UOM exists and belongs to the same company
//     const uom = await prisma.uoms.findUnique({
//       where: { id: uomIdNum },
//       select: { id: true, company_id: true }
//     });

//     if (!uom) {
//       return res.status(400).json({
//         success: false,
//         message: "UOM not found"
//       });
//     }

//     if (toNumber(uom.company_id) !== companyIdNum) {
//       return res.status(400).json({
//         success: false,
//         message: "UOM does not belong to the specified company"
//       });
//     }

//     // Create unit detail with new category field
//     const newUnitDetail = await prisma.unit_details.create({
//       data: {
//         company_id: companyIdNum,
//         uom_id: uomIdNum,
//         category: category.trim(), // Trim whitespace
//         weight_per_unit: weightValue,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Unit Detail created successfully",
//       data: {
//         id: toNumber(newUnitDetail.id),
//         company_id: toNumber(newUnitDetail.company_id),
//         uom_id: toNumber(newUnitDetail.uom_id),
//         category: newUnitDetail.category, // Include in response
//         weight_per_unit: newUnitDetail.weight_per_unit,
//         created_at: newUnitDetail.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating Unit Detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create Unit Detail",
//       error: error.message,
//     });
//   }
// };

// ✅ Update Unit Detail
// export const updateUnitDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { uom_id, weight_per_unit } = req.body;
//     const unitDetailId = parseInt(id, 10);

//     if (!unitDetailId || isNaN(unitDetailId)) {
//       return res.status(400).json({ success: false, message: "Unit Detail ID is required" });
//     }

//     const existing = await prisma.unit_details.findUnique({ where: { id: unitDetailId } });
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Unit Detail not found" });
//     }

//     // If uom_id is being updated, validate it
//     if (uom_id !== undefined) {
//       const uomIdNum = toNumber(uom_id);
//       const uom = await prisma.uoms.findUnique({
//         where: { id: uomIdNum },
//         select: { company_id: true }
//       });

//       if (!uom) {
//         return res.status(400).json({ success: false, message: "UOM not found" });
//       }

//       if (toNumber(uom.company_id) !== existing.company_id) {
//         return res.status(400).json({
//           success: false,
//           message: "UOM must belong to the same company as the Unit Detail"
//         });
//       }
//     }

//     const updated = await prisma.unit_details.update({
//       where: { id: unitDetailId },
//       data: {
//         uom_id: uom_id !== undefined ? toNumber(uom_id) : undefined,
//         weight_per_unit: weight_per_unit !== undefined ? Number(weight_per_unit) : undefined,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Unit Detail updated successfully",
//       data: {
//         id: toNumber(updated.id),
//         company_id: toNumber(updated.company_id),
//         uom_id: toNumber(updated.uom_id),
//         weight_per_unit: updated.weight_per_unit,
//         created_at: updated.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating Unit Detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update Unit Detail",
//       error: error.message,
//     });
//   }
// };
// export const updateUnitDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { uom_id, category, weight_per_unit } = req.body;
//     const unitDetailId = parseInt(id, 10);

//     if (!unitDetailId || isNaN(unitDetailId)) {
//       return res.status(400).json({ success: false, message: "Unit Detail ID is required" });
//     }

//     // Check if unit detail exists
//     const existing = await prisma.unit_details.findUnique({ 
//       where: { id: unitDetailId },
//       include: {
//         uom: true // Include UOM details
//       }
//     });
    
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Unit Detail not found" });
//     }

//     // Validate category if provided
//     if (category !== undefined) {
//       if (typeof category !== 'string' || category.trim() === '') {
//         return res.status(400).json({
//           success: false,
//           message: "Category must be a non-empty string"
//         });
//       }
//     }

//     // Validate weight if provided
//     if (weight_per_unit !== undefined) {
//       const weightValue = Number(weight_per_unit);
//       if (isNaN(weightValue) || weightValue <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Weight per unit must be a positive number"
//         });
//       }
//     }

//     // Validate UOM if provided
//     let uomDetails = existing.uom;
//     if (uom_id !== undefined) {
//       const uomIdNum = toNumber(uom_id);
//       uomDetails = await prisma.uoms.findUnique({
//         where: { id: uomIdNum },
//         select: { 
//           id: true, 
//           company_id: true,
//           unit_name: true
//         }
//       });

//       if (!uomDetails) {
//         return res.status(400).json({ success: false, message: "UOM not found" });
//       }

//       if (toNumber(uomDetails.company_id) !== existing.company_id) {
//         return res.status(400).json({
//           success: false,
//           message: "UOM must belong to the same company as the Unit Detail"
//         });
//       }
//     }

//     // Update unit detail
//     const updated = await prisma.unit_details.update({
//       where: { id: unitDetailId },
//       data: {
//         uom_id: uom_id !== undefined ? toNumber(uom_id) : undefined,
//         category: category !== undefined ? category.trim() : undefined,
//         weight_per_unit: weight_per_unit !== undefined ? Number(weight_per_unit) : undefined,
//       },
//     });

//     // Get updated UOM details if UOM was changed
//     if (uom_id !== undefined) {
//       uomDetails = await prisma.uoms.findUnique({
//         where: { id: updated.uom_id },
//         select: { 
//           id: true, 
//           company_id: true,
//           unit_name: true
//         }
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Unit Detail updated successfully",
//       data: {
//         id: toNumber(updated.id),
//         company_id: toNumber(updated.company_id),
//         uom_id: toNumber(updated.uom_id),
//         uom: {
//           id: uomDetails.id,
//           name: uomDetails.unit_name
//         },
//         category: updated.category,
//         weight_per_unit: updated.weight_per_unit,
//         created_at: updated.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating Unit Detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update Unit Detail",
//       error: error.message,
//     });
//   }
// };


export const getAllUnitDetails = async (req, res) => {
  try {
    // Fetch all unit details using raw SQL to handle potential null values
    const unitDetails = await prisma.$queryRaw`
      SELECT 
        id, 
        company_id, 
        uom_name, 
        category, 
        weight_per_unit, 
        created_at 
      FROM unit_details
      ORDER BY id DESC
    `;

    // Get unique company IDs
    const companyIds = [...new Set(unitDetails.map(u => u.company_id).filter(Boolean))];

    // Fetch company details
    const companies = companyIds.length > 0
      ? await prisma.users.findMany({
          where: { id: { in: companyIds } },
          select: { id: true, name: true }
        })
      : [];

    // Create a map for quick lookup
    const companyMap = new Map(companies.map(c => [c.id, c.name]));

    // Format the response data
    const formattedData = unitDetails.map(u => ({
      id: Number(u.id),
      company_id: u.company_id ? Number(u.company_id) : null,
      uom_name: u.uom_name,
      category: u.category, // This can be null now
      weight_per_unit: u.weight_per_unit,
      created_at: u.created_at,
      company_name: u.company_id ? companyMap.get(Number(u.company_id)) || null : null
    }));

    return res.status(200).json({
      success: true,
      message: "All Unit Details fetched successfully",
      data: formattedData
    });

  } catch (error) {
    console.error("Error fetching Unit Details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Unit Details",
      error: error.message
    });
  }
};

export const getUnitDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const unitDetailId = parseInt(id, 10);

    if (!unitDetailId || isNaN(unitDetailId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Unit Detail ID required",
      });
    }

    // Fetch unit detail using raw SQL
    const result = await prisma.$queryRaw`
      SELECT 
        id, 
        company_id, 
        uom_name, 
        category, 
        weight_per_unit, 
        created_at 
      FROM unit_details 
      WHERE id = ${unitDetailId} 
      LIMIT 1
    `;

    const unitDetail = result[0];

    if (!unitDetail) {
      return res.status(404).json({
        success: false,
        message: "Unit Detail not found",
      });
    }

    // Fetch company details if company_id exists
    const company = unitDetail.company_id
      ? await prisma.users.findUnique({
          where: { id: Number(unitDetail.company_id) },
          select: { name: true },
        })
      : null;

    return res.status(200).json({
      success: true,
      message: "Unit Detail fetched successfully",
      data: {
        id: Number(unitDetail.id),
        company_id: unitDetail.company_id ? Number(unitDetail.company_id) : null,
        uom_name: unitDetail.uom_name,
        category: unitDetail.category, // This can be null
        weight_per_unit: unitDetail.weight_per_unit,
        created_at: unitDetail.created_at,
        company_name: company?.name || null,
      },
    });

  } catch (error) {
    console.error("Error fetching Unit Detail by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Unit Detail",
      error: error.message,
    });
  }
};

export const getUnitDetailsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const companyId = Number(company_id);

    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Company ID required",
      });
    }

    // Fetch unit details for the specified company using raw SQL
    const unitDetails = await prisma.$queryRaw`
      SELECT 
        id, 
        company_id, 
        uom_name, 
        category, 
        weight_per_unit, 
        created_at 
      FROM unit_details 
      WHERE company_id = ${companyId} 
      ORDER BY id DESC
    `;

    const formattedData = unitDetails.map(u => ({
      id: Number(u.id),
      company_id: Number(u.company_id),
      uom_name: u.uom_name,
      category: u.category, // This can be null
      weight_per_unit: u.weight_per_unit,
      created_at: u.created_at,
    }));

    return res.status(200).json({
      success: true,
      message: "Unit Details for Company fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching Unit Details by Company ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Unit Details",
      error: error.message,
    });
  }
};

export const createUnitDetail = async (req, res) => {
  try {
    const { company_id, uom_name, category, weight_per_unit } = req.body;

    // Enhanced validation
    if (company_id == null || uom_name == null || category == null || weight_per_unit == null) {
      return res.status(400).json({
        success: false,
        message: "Company ID, UOM Name, Category, and Weight Per Unit are required",
      });
    }

    // Validate category is non-empty string
    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Category must be a non-empty string",
      });
    }

    // Validate uom_name is non-empty string
    if (typeof uom_name !== 'string' || uom_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "UOM Name must be a non-empty string",
      });
    }

    // Validate weight is positive number
    const weightValue = Number(weight_per_unit);
    if (isNaN(weightValue) || weightValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Weight per unit must be a positive number",
      });
    }

    const companyIdNum = Number(company_id);

    // Validate company exists
    const companyExists = await prisma.users.findUnique({
      where: { id: companyIdNum },
      select: { id: true }
    });

    if (!companyExists) {
      return res.status(400).json({
        success: false,
        message: "Company not found"
      });
    }

    // Create unit detail with the provided data
    const newUnitDetail = await prisma.unit_details.create({
      data: {
        company_id: companyIdNum,
        uom_name: uom_name.trim(),
        category: category.trim(),
        weight_per_unit: weightValue,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Unit Detail created successfully",
      data: {
        id: Number(newUnitDetail.id),
        company_id: Number(newUnitDetail.company_id),
        uom_name: newUnitDetail.uom_name,
        category: newUnitDetail.category,
        weight_per_unit: newUnitDetail.weight_per_unit,
        created_at: newUnitDetail.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating Unit Detail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Unit Detail",
      error: error.message,
    });
  }
};

export const updateUnitDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { uom_name, category, weight_per_unit } = req.body;

    const unitDetailId = Number(id);

    if (!unitDetailId || isNaN(unitDetailId)) {
      return res.status(400).json({ success: false, message: "Unit Detail ID is required" });
    }

    // Fetch existing unit detail using raw SQL
    const result = await prisma.$queryRaw`
      SELECT * FROM unit_details WHERE id = ${unitDetailId} LIMIT 1
    `;

    const existing = result[0];

    if (!existing) {
      return res.status(404).json({ success: false, message: "Unit Detail not found" });
    }

    // Validate uom_name
    if (uom_name !== undefined) {
      if (typeof uom_name !== "string" || uom_name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "UOM Name must be a non-empty string",
        });
      }
    }

    // Validate category
    if (category !== undefined) {
      if (typeof category !== "string" || category.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Category must be a non-empty string",
        });
      }
    }

    // Validate weight
    if (weight_per_unit !== undefined) {
      const w = Number(weight_per_unit);
      if (isNaN(w) || w <= 0) {
        return res.status(400).json({
          success: false,
          message: "Weight per unit must be a positive number",
        });
      }
    }

    // Update unit detail
    const updated = await prisma.unit_details.update({
      where: { id: unitDetailId },
      data: {
        uom_name: uom_name !== undefined ? uom_name.trim() : undefined,
        category: category !== undefined ? category.trim() : undefined,
        weight_per_unit: weight_per_unit !== undefined ? Number(weight_per_unit) : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Unit Detail updated successfully",
      data: {
        id: Number(updated.id),
        company_id: Number(updated.company_id),
        uom_name: updated.uom_name,
        category: updated.category,
        weight_per_unit: updated.weight_per_unit,
        created_at: updated.created_at,
      },
    });

  } catch (error) {
    console.error("Error updating Unit Detail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Unit Detail",
      error: error.message,
    });
  }
};

// ✅ Delete Unit Detail
export const deleteUnitDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const unitDetailId = parseInt(id, 10);

    if (!unitDetailId || isNaN(unitDetailId)) {
      return res.status(400).json({ success: false, message: "Unit Detail ID is required" });
    }

    // Check if record exists using raw SQL
    const existing = await prisma.$queryRaw`
      SELECT id FROM unit_details WHERE id = ${unitDetailId} LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "Unit Detail not found" });
    }

    // Delete record using raw SQL
    await prisma.$queryRaw`
      DELETE FROM unit_details WHERE id = ${unitDetailId}
    `;

    return res.status(200).json({
      success: true,
      message: "Unit Detail deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Unit Detail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Unit Detail",
      error: error.message,
    });
  }
};