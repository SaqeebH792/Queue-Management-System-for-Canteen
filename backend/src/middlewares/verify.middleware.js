import jwt from "jsonwebtoken";

export const verify = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "universityAdmin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    req.user = decoded;

    return res.status(200).json({
      message: "Verified",
      user: decoded,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};
