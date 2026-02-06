import mongoose from "mongoose";

const areaSheama = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },
});

export const Area = mongoose.models.User || mongoose.model("area", areaSheama);
