import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    companyName: {
      type: String,
    },
    totalDonated: {
      type: Number,
      default: 0,
    },
    recurringPlan: {
      type: String,
      enum: ["none", "monthly", "yearly"],
      default: "none",
    },
    recurringAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isSubscriptionEnabled: {
      type: Boolean,
      default: false,
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
