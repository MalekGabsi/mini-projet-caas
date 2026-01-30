import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("User service connected to MongoDB");
  } catch (error) {
    console.error("User service MongoDB connection failed", error);
    process.exit(1);
  }
};
