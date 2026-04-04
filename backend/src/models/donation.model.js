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
    recurrence: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
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
    subscriptionId: {
      type: String,
      trim: true,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      trim: true,
    },
    itemRecurrence: {
      type: String,
      trim: true,
    },
    itemDuration: {
      type: String,
      trim: true,
    },
    itemRecStatus: {
      type: Number,
    },
    itemRecDateNext: {
      type: String,
      trim: true,
    },
    itemRecInstallPaid: {
      type: Number,
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
