import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async localFilePath => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: "canteen/products",
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
        },

        {
          quality: "auto",
        },

        {
          fetch_format: "auto",
        },
      ],
    });

    await fs.unlink(localFilePath);

    return response;
  } catch (error) {
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch (fsError) {
        console.error("File cleanup failed", fsError);
      }
    }

    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

export { uploadOnCloudinary };
