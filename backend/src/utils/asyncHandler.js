const asyncHandler = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const response = {
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
      data: null,
    };
    return res.status(error.statusCode || 500).json(response);
  }
};

export { asyncHandler };
