import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Availability service connected to MongoDB");
  } catch (error) {
    console.error("Availability service MongoDB connection failed", error);
    process.exit(1);
  }
};
