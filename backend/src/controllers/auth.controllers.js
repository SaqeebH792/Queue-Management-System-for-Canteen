import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
const verifyAdmin = asyncHandler(async (req, res) => {
  res.status(200).json(
    new apiResponse(
      200,
      {
        user: req.user,
        role: req.user.role,
      },
      "User verified successfully"
    )
  );
});

export { verifyAdmin };
