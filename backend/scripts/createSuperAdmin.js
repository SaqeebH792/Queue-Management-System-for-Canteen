import mongoose from "mongoose";
import dotenv from "dotenv";
import { SuperAdmin } from "../src/models/superAdmin.model.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);

    console.log("Connected to MongoDB");

    const existingSuperAdmin = await SuperAdmin.findOne();

    if (existingSuperAdmin) {
      console.log("A Super Admin already exists.");
      console.log(`Email: ${existingSuperAdmin.email}`);

      await mongoose.disconnect();
      process.exit(0);
    }

    const superAdmin = await SuperAdmin.create({
      name: "System Administrator",
      email: "saqeebhassan792@gmail.com",
      password: "Admin@123456",
      role: "Super Admin",
      isActive: true,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to create Super Admin:");
    console.error(error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

createSuperAdmin();
