import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authPlugin = (schema, options = {}) => {
  const saltRounds = options.saltRounds || 10;

  schema.pre("save", async function () {
    if (!this.isModified("password")) {
      return;
    }

    try {
      this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (err) {
      throw err;
    }
  });

  schema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  schema.methods.generateAccessToken = function () {
    const payload = {
      _id: this._id,
    };

    if (options.tokenFields && Array.isArray(options.tokenFields)) {
      options.tokenFields.forEach(field => {
        if (this[field] !== undefined) {
          payload[field] = this[field];
        }
      });
    }

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,

      issuer: "university-system",
    });
  };

  schema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,

        issuer: "university-system",
      }
    );
  };
};

export { authPlugin };
