import mongoose from "mongoose";
import { ActivationRequest } from "../models/requestActivation.model.js";
import { UniversityAdmin } from "../models/universityAdmin.model.js";
import { University } from "../models/university.model.js";
import { SuperAdmin } from "../models/superAdmin.model.js";
import { Student } from "../models/student.model.js";
import { Order } from "../models/order.model.js";
import { Notification } from "../models/notification.model.js";
import { getSocketIO } from "../socket.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import validator from "validator";

const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new apiError(400, "Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email address");
  }

  // Check super admin exists
  const superAdmin = await SuperAdmin.findOne({
    email: normalizedEmail,
  });

  if (!superAdmin) {
    throw new apiError(401, "Invalid email or password");
  }

  const isPasswordValid = await superAdmin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid email or password");
  }
  // Generate Token
  const accessToken = superAdmin.generateAccessToken();

  superAdmin.lastLogin = new Date();
  await superAdmin.save({
    validateBeforeSave: false,
  });

  const loggedInAdmin = superAdmin.toObject();
  delete loggedInAdmin.password;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new apiResponse(
        200,
        { superAdmin: loggedInAdmin, accessToken },
        "Super admin login successful"
      )
    );
});
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUniversities,
    activeUniversities,
    inactiveUniversities,

    totalUniversityAdmins,
    activeUniversityAdmins,
    inactiveUniversityAdmins,

    pendingRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,

    totalStudents,
    totalOrders,
  ] = await Promise.all([
    University.countDocuments(),
    University.countDocuments({ status: "active" }),
    University.countDocuments({ status: "inactive" }),

    UniversityAdmin.countDocuments(),
    UniversityAdmin.countDocuments({ status: "active" }),
    UniversityAdmin.countDocuments({ status: "inactive" }),

    ActivationRequest.countDocuments({ status: "pending" }),
    ActivationRequest.countDocuments({ status: "approved" }),
    ActivationRequest.countDocuments({ status: "rejected" }),
    ActivationRequest.countDocuments({ status: "cancelled" }),

    Student.countDocuments(),
    Order.countDocuments(),
  ]);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        universities: {
          total: totalUniversities,
          active: activeUniversities,
          inactive: inactiveUniversities,
        },

        universityAdmins: {
          total: totalUniversityAdmins,
          active: activeUniversityAdmins,
          inactive: inactiveUniversityAdmins,
        },

        activationRequests: {
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          cancelled: cancelledRequests,
        },

        students: {
          total: totalStudents,
        },

        orders: {
          total: totalOrders,
        },

        generatedAt: new Date(),
      },
      "Dashboard statistics fetched successfully"
    )
  );
});

// View all activation requests
const getActivationRequests = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search = "", status } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const pipeline = [
    // University
    {
      $lookup: {
        from: "universities",
        localField: "universityId",
        foreignField: "_id",
        as: "university",
      },
    },
    {
      $unwind: "$university",
    },

    // Requested By (University Admin)
    {
      $lookup: {
        from: "universityadmins",
        localField: "requestedBy",
        foreignField: "_id",
        as: "requestedBy",
      },
    },
    {
      $unwind: "$requestedBy",
    },

    // Reviewed By (Super Admin)
    {
      $lookup: {
        from: "superadmins",
        localField: "reviewedBy",
        foreignField: "_id",
        as: "reviewedBy",
      },
    },
    {
      $unwind: {
        path: "$reviewedBy",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // Status Filter
  if (status) {
    pipeline.push({
      $match: {
        status,
      },
    });
  }

  // Search
  if (search.trim()) {
    pipeline.push({
      $match: {
        $or: [
          {
            "university.name": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "university.email": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "requestedBy.fullName": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "requestedBy.email": {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  pipeline.push(
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        status: 1,
        createdAt: 1,
        reviewedAt: 1,
        rejectionReason: 1,

        university: {
          _id: "$university._id",
          name: "$university.name",
          email: "$university.email",
          status: "$university.status",
        },

        requestedBy: {
          _id: "$requestedBy._id",
          fullName: "$requestedBy.fullName",
          email: "$requestedBy.email",
        },

        reviewedBy: {
          _id: "$reviewedBy._id",
          fullName: "$reviewedBy.fullName",
          email: "$reviewedBy.email",
        },
      },
    },
    {
      $facet: {
        requests: [
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],
        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    }
  );

  const result = await ActivationRequest.aggregate(pipeline);

  const requests = result[0].requests;
  const totalRequests = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalRequests / limit);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        requests,
        pagination: {
          currentPage: page,
          totalPages,
          totalRequests,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Activation requests fetched successfully"
    )
  );
});
// Approve / Reject request
const updateActivationRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new apiError(400, "Invalid activation request ID");
  }

  if (!["approved", "rejected"].includes(status)) {
    throw new apiError(400, "Status must be either 'approved' or 'rejected'");
  }

  if (status === "rejected" && rejectionReason?.length > 500) {
    throw new apiError(400, "Rejection reason cannot exceed 500 characters");
  }

  const session = await mongoose.startSession();

  let updatedRequest;
  let notification;

  try {
    session.startTransaction();

    const request = await ActivationRequest.findOne({
      _id: requestId,
      status: "pending",
    }).session(session);

    if (!request) {
      throw new apiError(404, "Pending activation request not found or already processed");
    }

    // Approve request
    if (status === "approved") {
      await University.findByIdAndUpdate(
        request.universityId,
        {
          status: "active",
        },
        {
          session,
        }
      );

      await UniversityAdmin.findByIdAndUpdate(
        request.requestedBy,
        {
          status: "active",
        },
        {
          session,
        }
      );
    }

    // Reject request
    if (status === "rejected") {
      request.rejectionReason = rejectionReason?.trim() || "";
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save({
      session,
    });

    /*
      Create Notification inside transaction
    */

    const notificationPayload = {
      sender: req.user._id,
      senderModel: "SuperAdmin",

      recipient: request.requestedBy,
      recipientModel: "UniversityAdmin",

      activationRequestId: request._id,

      title: status === "approved" ? "Activation Approved" : "Activation Rejected",

      message:
        status === "approved"
          ? "Your university activation request has been approved. Your account is now active."
          : `Your activation request has been rejected.${
              request.rejectionReason ? ` Reason: ${request.rejectionReason}` : ""
            }`,

      type: status === "approved" ? "ActivationApproved" : "ActivationRejected",

      link: `/activation-requests/${request._id}`,
    };

    const createdNotification = await Notification.create([notificationPayload], {
      session,
    });

    notification = createdNotification[0];

    await session.commitTransaction();

    updatedRequest = await ActivationRequest.findById(request._id)
      .populate("universityId", "name email status")
      .populate("requestedBy", "fullName email status")
      .populate("reviewedBy", "fullName email");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  try {
    const io = getSocketIO();

    io.to(updatedRequest.requestedBy._id.toString()).emit("newNotification", notification);
  } catch (socketError) {
    console.error("Socket notification failed:", socketError.message);
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedRequest, `Activation request ${status} successfully`));
});
// Manually deactivate university admin
const deactivateUniversityAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new apiError(400, "Invalid university admin ID");
  }

  const session = await mongoose.startSession();

  let notification;
  let updatedAdmin;

  try {
    session.startTransaction();

    const admin = await UniversityAdmin.findById(adminId).session(session);

    if (!admin) {
      throw new apiError(404, "University admin not found");
    }

    if (admin.status === "inactive") {
      throw new apiError(400, "University admin is already inactive");
    }

    // Deactivate University Admin
    admin.status = "inactive";
    await admin.save({ session });

    // Optional: Deactivate the university as well
    /*
    await University.findByIdAndUpdate(
      admin.universityId,
      { status: "inactive" },
      { session }
    );
    */

    // Create Notification
    const notificationPayload = {
      sender: req.user._id,
      senderModel: "SuperAdmin",

      recipient: admin._id,
      recipientModel: "UniversityAdmin",

      title: "Account Deactivated",

      message: "Your university administrator account has been deactivated by the Super Admin.",

      type: "System",

      link: "/dashboard",
    };

    const createdNotification = await Notification.create([notificationPayload], {
      session,
    });

    notification = createdNotification[0];

    await session.commitTransaction();

    updatedAdmin = await UniversityAdmin.findById(admin._id).populate(
      "universityId",
      "name email status"
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // Send real-time notification
  try {
    const io = getSocketIO();

    io.to(updatedAdmin._id.toString()).emit("newNotification", notification);
  } catch (socketError) {
    console.error("Socket notification failed:", socketError.message);
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedAdmin, "University admin deactivated successfully"));
});

const getUniversityAdmins = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search = "", status } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const pipeline = [
    {
      $lookup: {
        from: "universities",
        localField: "universityId",
        foreignField: "_id",
        as: "university",
      },
    },

    {
      $unwind: "$university",
    },
  ];

  if (status) {
    pipeline.push({
      $match: {
        status,
      },
    });
  }

  if (search.trim()) {
    pipeline.push({
      $match: {
        $or: [
          {
            fullName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            "university.name": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "university.email": {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  pipeline.push(
    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $project: {
        fullName: 1,
        email: 1,
        status: 1,
        createdAt: 1,

        university: {
          _id: "$university._id",
          name: "$university.name",
          email: "$university.email",
          status: "$university.status",
        },
      },
    },

    {
      $facet: {
        admins: [
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],

        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    }
  );

  const result = await UniversityAdmin.aggregate(pipeline);

  const admins = result[0].admins;

  const totalAdmins = result[0].totalCount[0]?.count || 0;

  const totalPages = Math.ceil(totalAdmins / limit);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        admins,

        pagination: {
          currentPage: page,
          totalPages,
          totalAdmins,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "University admins fetched successfully"
    )
  );
});
export {
  loginSuperAdmin,
  getDashboardStats,
  getActivationRequests,
  updateActivationRequest,
  deactivateUniversityAdmin,
  getUniversityAdmins,
};
