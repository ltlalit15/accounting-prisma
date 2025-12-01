// passwordChangeController.js

import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
/**
 * @desc    Create a new password change request
 * @route   POST /api/password/request
 * @access  Public (or Company, depending on your auth middleware)
 */
// export const createPasswordChangeRequest = async (req, res) => {
//   try {
//     const { company_id, reason } = req.body;

//     // 1. Validate input
//     if (!company_id || !reason) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID and reason are required.",
//       });
//     }

//     // 2. Check if the company (user) exists
//     const company = await prisma.users.findUnique({
//       where: { id: company_id },
//     });

//     if (!company) {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found.",
//       });
//     }

//     // 3. Check if there's already a PENDING request for this company
//     const existingRequest = await prisma.password_change_requests.findFirst({
//       where: {
//         company_id,
//         status: "Pending",
//       },
//     });

//     if (existingRequest) {
//       return res.status(409).json({
//         // 409 Conflict is appropriate here
//         success: false,
//         message:
//           "A password change request is already pending for this company.",
//       });
//     }

//     // 4. Create the new password change request
//     const passwordChangeRequest = await prisma.password_change_requests.create({
//       data: {
//         company_id,
//         reason,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Password change request submitted successfully.",
//       data: passwordChangeRequest,
//     });
//   } catch (error) {
//     console.error("Error creating password change request:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

export const createPasswordChangeRequest = async (req, res) => {
  try {
    const { company_id, reason } = req.body;

    // 1. Validate input
    if (!company_id || !reason) {
      return res.status(400).json({
        success: false,
        message: "Company ID and reason are required.",
      });
    }

    // Parse company_id to integer
    const companyIdInt = parseInt(company_id);

    // 2. Check if the company (user) exists
    const company = await prisma.users.findUnique({
      where: { id: companyIdInt },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    // 3. Check if there's already a PENDING request for this company
    const existingRequest = await prisma.password_change_requests.findFirst({
      where: {
        company_id: companyIdInt,
        status: "Pending",
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        // 409 Conflict is appropriate here
        success: false,
        message:
          "A password change request is already pending for this company.",
      });
    }

    // 4. Create the new password change request
    const passwordChangeRequest = await prisma.password_change_requests.create({
      data: {
        company_id: companyIdInt,
        reason,
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Password change request submitted successfully.",
      data: passwordChangeRequest,
    });
  } catch (error) {
    console.error("Error creating password change request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
/**
 * @desc    Get all password change requests for the admin
 * @route   GET /api/password/requests
 * @access  SuperAdmin
 */
export const getAllPasswordChangeRequests = async (req, res) => {
  try {
    // Find all requests and include the related user's details
    const requests = await prisma.password_change_requests.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true, // This is the company's name
            email: true,
            // company_name: true, // <-- REMOVE THIS LINE
          },
        },
      },
      orderBy: {
        created_at: "desc", // Show newest requests first
      },
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching password change requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Approve a password change request and set a new password
 * @route   PUT /api/password/requests/:requestId/approve
 * @access  SuperAdmin
 */
export const approvePasswordChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { new_password } = req.body;

    // 1. Validate input
    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: "New password is required for approval.",
      });
    }

    // 2. Find the request
    const request = await prisma.password_change_requests.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Password change request not found.",
      });
    }

    // 3. Check if the request is still pending
    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}.`,
      });
    }

    // 4. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // 5. Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Update the user's password in the 'users' table
      await tx.users.update({
        where: { id: request.company_id },
        data: { password: hashedPassword },
      });

      // Update the request's status to 'Changed'
      await tx.password_change_requests.update({
        where: { id: parseInt(requestId) },
        data: { status: "Changed", email_sent: true }, // Using 'Changed' as seen in your UI image
      });
    });

    res.status(200).json({
      success: true,
      message:
        "Password change request approved. The password has been updated.",
    });
  } catch (error) {
    console.error("Error approving password change request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Reject a password change request
 * @route   PUT /api/password/requests/:requestId/reject
 * @access  SuperAdmin
 */
export const rejectPasswordChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // 1. Find the request
    const request = await prisma.password_change_requests.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Password change request not found.",
      });
    }

    // 2. Check if the request is still pending
    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}.`,
      });
    }

    // 3. Update the request's status to 'Rejected'
    await prisma.password_change_requests.update({
      where: { id: parseInt(requestId) },
      data: { status: "Rejected" },
    });

    res.status(200).json({
      success: true,
      message: "Password change request has been rejected.",
    });
  } catch (error) {
    console.error("Error rejecting password change request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPasswordChangeRequestsByCompanyId = async (req, res) => {
  try {
    // 1. Get the company ID from the URL parameters
    const { companyId } = req.params;

    // 4. If authorized, find all requests for the specified company
    const requests = await prisma.password_change_requests.findMany({
      where: {
        company_id: parseInt(companyId),
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error(
      "Error fetching password change requests by company ID:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
