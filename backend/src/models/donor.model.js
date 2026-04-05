import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
    },
    methodType: {
      type: String,
      enum: ["card", "bank", "wallet"],
      default: "card",
    },
    provider: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    last4: {
      type: String,
      match: /^\d{4}$/,
    },
    expMonth: {
      type: Number,
      min: 1,
      max: 12,
    },
    expYear: {
      type: Number,
      min: 2020,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

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
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
      default: "Sri Lanka",
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
    paymentMethods: {
      type: [paymentMethodSchema],
      default: [],
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
