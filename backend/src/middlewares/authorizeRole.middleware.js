import { apiError } from "../utils/apiError.js";
import { ROLES } from "../constants.js";
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!req.user) {
      throw new apiError(401, "Unauthorized at roles");
    }
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      throw new apiError(403, "Access Denied");
    }

    next();
  };
};
export { authorizeRole };
