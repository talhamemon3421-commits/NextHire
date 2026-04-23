import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Employer from "../modules/users/employer.model.js";
import dotenv from "dotenv";
dotenv.config();

const seedEmployers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const password = await bcrypt.hash("Password123!", 10);

    const employers = [
      {
        name: "Talha Tech Solutions",
        email: "m.talhant666@gmail.com",
        password,
        phone: "03168677314",
        isApproved: true,
        isActive: true,
      },
      {
        name: "Memon Digital Agency",
        email: "talhamemon3421@gmail.com",
        password,
        phone: "03001234567",
        isApproved: true,
        isActive: true,
      },
    ];

    await Employer.insertMany(employers);

    console.log("✅ Employers seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedEmployers();