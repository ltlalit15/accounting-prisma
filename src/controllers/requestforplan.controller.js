// src/controllers/planRequestController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Utility: Safe number conversion
const toNumber = (val) => {
  if (val == null) return 0;
  return Number(val);
};



// 📌 1. Company Requests a Plan
export const requestPlan = async (req, res) => {
  try {
    const {
      company_name,
      company_email,
      plan_id,
      billing_cycle = "Monthly",
      request_date,
      status
    } = req.body;

    if (!company_name || !company_email || !plan_id) {
      return res.status(400).json({
        success: false,
        message: "company_name, company_email and plan_id are required"
      });
    }

    // Convert incoming date safely
    let formattedDate = undefined;
    if (request_date) {
      const parsed = new Date(request_date);
      formattedDate = isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    const newRequest = await prisma.plan_requests.create({
      data: {
        company_name,
        company_email,
        plan_id: Number(plan_id),
        billing_cycle,
        request_date: formattedDate, // <-- SAFE date
        status
      }
    });

    return res.status(201).json({
      success: true,
      message: "Plan request submitted successfully",
      data: {
        id: newRequest.id,
        company_name: newRequest.company_name,
        company_email: newRequest.company_email,
        plan_id: newRequest.plan_id,
        billing_cycle: newRequest.billing_cycle,
        request_date: newRequest.request_date,
        status: newRequest.status
      }
    });

  } catch (error) {
    console.error("Error requesting plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// 📌 2. Get All Requested Plans (with company & plan names)
// export const getRequestedPlans = async (req, res) => {
//   try {
//     // Step 1: Fetch all plan requests
//     const requests = await prisma.plan_requests.findMany({
//       orderBy: { id: 'desc' },
//     });

//     if (requests.length === 0) {
//       return res.status(404).json({ message: "No requested plans found" });
//     }

//     // Step 2: Extract unique IDs
//     const companyIds = [...new Set(requests.map(r => r.company_id))];
//     const planIds = [...new Set(requests.map(r => r.plan_id))];

//     // Step 3: Fetch companies and plans in parallel
//     const [companies, plans] = await Promise.all([
//       prisma.companies.findMany({
//         where: { id: { in: companyIds } },
//         select: { id: true, name: true, email: true }
//       }),
//       prisma.plans.findMany({
//         where: { id: { in: planIds } },
//         select: { id: true, name: true }
//       })
//     ]);

//     // Step 4: Create lookup maps
//     const companyMap = new Map(companies.map(c => [c.id, c]));
//     const planMap = new Map(plans.map(p => [p.id, p]));

//     // Step 5: Format response
//     const data = requests.map(r => ({
//       id: r.id,
//       company: companyMap.get(r.company_id)?.name || 'Unknown Company',
//       email: companyMap.get(r.company_id)?.email || 'no-email@domain.com',
//       plan: planMap.get(r.plan_id)?.name || 'Unknown Plan',
//       billing_cycle: r.billing_cycle || 'Monthly',
//       request_date: r.request_date,
//       status: r.status || 'Pending',
//     }));

//     return res.status(200).json({
//       message: "Requested plans fetched successfully",
//       data,
//     });
//   } catch (error) {
//     console.error("Error fetching plan requests:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };
export const getRequestedPlans = async (req, res) => {
  try {
    const requests = await prisma.plan_requests.findMany({
      orderBy: { id: "desc" },
    });

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No requested plans found",
        total_requests: 0,
        data: [],
      });
    }

    // Collect unique plan IDs
    const planIds = [...new Set(requests.map((r) => r.plan_id))];

    // Fetch plans
    const plans = await prisma.plans.findMany({
      where: { id: { in: planIds } },
      select: { id: true, plan_name: true },
    });

    const planMap = new Map(plans.map((p) => [p.id, p]));

    // Format response
    const data = requests.map((r) => ({
      id: r.id, // <-- request ID (required)
      company: {
        id: r.id, // <-- same request ID (ONLY ID available for company)
        name: r.company_name,
        email: r.company_email,
      },
      plan: {
        id: r.plan_id,
        plan_name: planMap.get(r.plan_id)?.plan_name || "Unknown Plan",
      },
      billing_cycle: r.billing_cycle,
      request_date: r.request_date,
      status: r.status,
    }));

    return res.status(200).json({
      success: true,
      message: "Requested plans fetched successfully",
      total_requests: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching plan requests:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// 📌 3. Approve / Reject Plan Request
// export const updatePlanRequestStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     // Validate status
//     if (!["Approved", "Rejected"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Status must be either 'Approved' or 'Rejected'",
//       });
//     }

//     const requestId = Number(id);

//     // Check if exists
//     const existing = await prisma.plan_requests.findUnique({
//       where: { id: requestId },
//     });

//     if (!existing) {
//       return res.status(404).json({
//         success: false,
//         message: "Plan request not found",
//       });
//     }

//     // Fetch plan for details
//     const plan = await prisma.plans.findUnique({
//       where: { id: existing.plan_id },
//       select: {
//         id: true,
//         plan_name: true,
//       },
//     });

//     // Update status only
//     const updated = await prisma.plan_requests.update({
//       where: { id: requestId },
//       data: { status },
//     });

//     return res.status(200).json({
//       success: true,
//       message: `Plan request ${status.toLowerCase()} successfully`,
//       data: {
//         id: updated.id,  // ← returning ID
//         company: {
//           id: updated.id,  // ← only ID available for company
//           name: updated.company_name,
//           email: updated.company_email,
//         },
//         plan: {
//           id: plan?.id || null,
//           plan_name: plan?.plan_name || "Unknown Plan",
//         },
//         billing_cycle: updated.billing_cycle,
//         request_date: updated.request_date,
//         status: updated.status,
//       },
//     });

//   } catch (error) {
//     console.error("Error updating plan request:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const updatePlanRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'",
      });
    }

    const requestId = Number(id);

    const existing = await prisma.plan_requests.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Plan request not found",
      });
    }

    // Update only the status
    const updatedRequest = await prisma.plan_requests.update({
      where: { id: requestId },
      data: { status },
    });

    let companyCreated = null;
    let randomPassword = null; // ✅ FIX: declare outside

    // ------------------------
    // ✅ If Approved → Create Company
    // ------------------------
    if (status === "Approved") {
      randomPassword = Math.random().toString(36).slice(-8); // assign value
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      companyCreated = await prisma.users.create({
        data: {
          name: existing.company_name,
          email: existing.company_email,
          password: hashedPassword,
          role: "COMPANY",
          startDate: new Date(),
          expireDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),

          user_plans: {
            create: {
              plan_id: existing.plan_id,
              planType: existing.billing_cycle,
            },
          },
        },
      });

      // Placeholder for future email sending
    }

    // Fetch plan info
    const plan = await prisma.plans.findUnique({
      where: { id: existing.plan_id },
      select: { id: true, plan_name: true },
    });

    return res.status(200).json({
      success: true,
      message: `Plan request ${status.toLowerCase()} successfully`,
      data: {
        plan_request: {
          id: updatedRequest.id,
          billing_cycle: updatedRequest.billing_cycle,
          company_email: updatedRequest.company_email,
          status: updatedRequest.status,
        },
        plan,
        company_created: companyCreated,
        password: randomPassword, // now it will exist (null if rejected)
      },
    });
  } catch (error) {
    console.error("Error updating plan request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 📌 4. Delete Plan Request
export const deletePlanRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requestId = Number(id);

    // Fetch the existing request
    const existing = await prisma.plan_requests.findUnique({
      where: { id: requestId },
      include: {
        plan: {
          select: { id: true, plan_name: true }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Plan request not found"
      });
    }

    // Delete the record
    await prisma.plan_requests.delete({
      where: { id: requestId }
    });

    return res.status(200).json({
      success: true,
      message: "Plan request deleted successfully",
      deleted: {
        id: existing.id,
        company: {
          id: existing.id, // only identifier available
          name: existing.company_name,
          email: existing.company_email
        },
        plan: {
          id: existing.plan?.id || null,
          plan_name: existing.plan?.plan_name || "Unknown Plan"
        },
        billing_cycle: existing.billing_cycle,
        request_date: existing.request_date,
        status: existing.status
      }
    });

  } catch (error) {
    console.error("Error deleting plan request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


// 📌 5. Get Single Plan Request by ID
export const getRequestedPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const reqId = Number(id);

    // Fetch request by ID
    const request = await prisma.plan_requests.findUnique({
      where: { id: reqId },
      include: {
        plan: {
          select: { id: true, plan_name: true }
        }
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Plan request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Requested plan fetched successfully",
      data: {
        id: request.id,
        company: {
          id: request.id, // no company_id in schema → using record id
          name: request.company_name,
          email: request.company_email
        },
        plan: request.plan
          ? {
              id: request.plan.id,
              plan_name: request.plan.plan_name
            }
          : null,
        billing_cycle: request.billing_cycle,
        request_date: request.request_date,
        status: request.status
      }
    });

  } catch (error) {
    console.error("Error fetching request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};