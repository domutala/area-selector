import mongoose from "mongoose";

export async function useMongo() {
  const config = useRuntimeConfig();

  try {
    return await mongoose.connect(config.databaseUrl);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
