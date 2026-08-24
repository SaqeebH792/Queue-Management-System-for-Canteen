const generateAccessAndRefreshToken = async user => {
  try {
    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log(error);

    throw new apiError(500, "Something went wrong while generating tokens");
  }
};

export { generateAccessAndRefreshToken };
