import mongoose from "mongoose";

export interface AreaDocument {
  id: number;
  name: string;
  iso2: string;
  iso3166_2: string;
  native: string;
  latitude: string;
  longitude: string;
  type: string;
  timezone: string;
  fullName: string;
}

const AreaSchema = new mongoose.Schema<AreaDocument>({
  id: {
    type: Number,
    required: true,
    // unique: true,
    index: true,
  },

  name: String,
  iso2: String,
  iso3166_2: String,
  native: String,
  latitude: String,
  longitude: String,
  type: String,
  timezone: String,
  fullName: String,
});

export const Area = mongoose.model<AreaDocument>("area", AreaSchema);
