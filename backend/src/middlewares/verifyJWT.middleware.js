import { model } from "mongoose";
// Models
import { UniversityAdmin } from "../models/universityAdmin.model.js";
import { CanteenAdmin } from "../models/CanteenAdmin.model.js";
import { Student } from "../models/student.model.js";
import { SuperAdmin } from "../models/superAdmin.model.js";
// Utils
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// Others
import { ROLES } from "../constants.js";
import jwt from "jsonwebtoken";

const getModelByRole = role => {
  switch (role) {
    case ROLES.UNIVERSITY_ADMIN:
      return UniversityAdmin;

    case ROLES.CANTEEN_ADMIN:
      return CanteenAdmin;

    case ROLES.STUDENT:
      return Student;
    case ROLES.SUPER_ADMIN:
      return SuperAdmin;
    default:
      return null;
  }
};

// Middleware for Protected Routes
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new apiError(401, "Unauthorized at jwt");
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const Model = getModelByRole(decoded.role);

  if (!Model) {
    throw new apiError(401, "Invalid role");
  }

  const user = await Model.findById(decoded._id).select("-password");

  if (!user) {
    throw new apiError(401, "User not found");
  }

  req.user = user;
  req.user.role = decoded.role;
  req.Model = Model;

  next();
});

// Middleware for Optional Authentication
const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const Model = getModelByRole(decoded.role);

    if (!Model) {
      return next();
    }

    const user = await Model.findById(decoded._id).select("-password");

    if (user) {
      req.user = user;
      req.user.role = decoded.role;
      req.Model = Model;
    }

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    next();
  }
});

export { verifyJWT, optionalVerifyJWT };
