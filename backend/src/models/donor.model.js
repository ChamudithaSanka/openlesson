import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    totalDonated: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "donor",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Donor = mongoose.model("Donor", donorSchema);

export default Donor;
