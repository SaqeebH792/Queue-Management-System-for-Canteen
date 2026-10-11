import { apiError } from "../utils/apiError.js";
import { ROLES } from "../constants.js";
const authorizeRole = (...ROLES) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new apiError(401, "Unauthorized at roles");
    }
    if (!ROLES.includes(req.user.role)) {
      throw new apiError(403, "Access Denied");
    }

    next();
  };
};
export { authorizeRole };
