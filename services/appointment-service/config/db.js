import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Appointment service connected to MongoDB");
  } catch (error) {
    console.error("Appointment service MongoDB connection failed", error);
    process.exit(1);
  }
};
