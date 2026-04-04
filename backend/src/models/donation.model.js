import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      default: null,
    },
    guest: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: "Sri Lanka",
      },
    },
    orderId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    donationType: {
      type: String,
      enum: ["one-time", "monthly", "yearly"],
      default: "one-time",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "LKR",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Canceled", "ChargedBack"],
      default: "Pending",
    },
    paymentGateway: {
      type: String,
      default: "PayHere",
    },
    payherePaymentId: {
      type: String,
      trim: true,
    },
    payhereAmount: {
      type: Number,
    },
    payhereCurrency: {
      type: String,
      trim: true,
    },
    statusCode: {
      type: Number,
    },
    md5sig: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
