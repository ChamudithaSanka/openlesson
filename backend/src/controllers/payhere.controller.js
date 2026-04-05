import { createHash, randomUUID } from "crypto";
import Donation from "../models/donation.model.js";
import Donor from "../models/donor.model.js";
import { verifyToken } from "../utils/jwt.js";

const checkoutUrl = () =>
  process.env.PAYHERE_CHECKOUT_URL ||
  (process.env.PAYHERE_ENV === "live"
    ? "https://www.payhere.lk/pay/checkout"
    : "https://sandbox.payhere.lk/pay/checkout");

const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

const merchantId = () => process.env.PAYHERE_MERCHANT_ID || "";
const merchantSecret = () => process.env.PAYHERE_MERCHANT_SECRET || "";

const md5Upper = (value) => createHash("md5").update(String(value)).digest("hex").toUpperCase();

const buildHash = (merchantIdValue, orderId, amount, currency) => {
  const hashedSecret = md5Upper(merchantSecret());
  return md5Upper(`${merchantIdValue}${orderId}${amount}${currency}${hashedSecret}`);
};

const normalizeAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount.toFixed(2);
};

const buildReturnUrl = (orderId) => `${frontendUrl()}/donate/return?order_id=${encodeURIComponent(orderId)}`;
const buildCancelUrl = (orderId) => `${frontendUrl()}/donate/cancel?order_id=${encodeURIComponent(orderId)}`;

const getRequestedUser = async (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    throw error;
  }

  return decoded;
};

const getStatusFromCode = (statusCode) => {
  switch (Number(statusCode)) {
    case 2:
      return "Completed";
    case 0:
      return "Pending";
    case -1:
      return "Canceled";
    case -2:
      return "Failed";
    case -3:
      return "ChargedBack";
    default:
      return "Pending";
  }
};

const buildDonationLabel = (donationType) => {
  if (donationType === "monthly") return "Monthly Donation";
  if (donationType === "yearly") return "Yearly Donation";
  return "One-Time Donation";
};

const buildRecurringTerms = (donationType) => {
  if (donationType === "monthly") {
    return { recurrence: "1 Month", duration: "Forever" };
  }

  if (donationType === "yearly") {
    return { recurrence: "1 Year", duration: "Forever" };
  }

  return { recurrence: null, duration: null };
};

// @desc    Create PayHere checkout session
// @route   POST /api/payments/payhere/checkout-session
// @access  Public
export const createPayHereCheckoutSession = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      amount,
      donation_type = "one-time",
      message = "",
    } = req.body;

    const normalizedAmount = normalizeAmount(amount);
    if (!first_name || !last_name || !email || !phone || !address || !city || !country || !normalizedAmount) {
      return res.status(400).json({
        success: false,
        message: "first_name, last_name, email, phone, address, city, country, and amount are required",
      });
    }

    if (!["one-time", "monthly", "yearly"].includes(donation_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation type",
      });
    }

    if (donation_type !== "one-time" && !req.headers.authorization?.startsWith("Bearer ")) {
      return res.status(403).json({
        success: false,
        message: "Recurring donations require a donor account",
      });
    }

    if (!merchantId() || !merchantSecret()) {
      return res.status(500).json({
        success: false,
        message: "PayHere merchant configuration is missing",
      });
    }

    const requestedUser = await getRequestedUser(req).catch((error) => {
      throw error;
    });

    let donorId = null;
    if (requestedUser) {
      if (requestedUser.userType !== "donor") {
        return res.status(403).json({
          success: false,
          message: "Only donor accounts can use authenticated checkout",
        });
      }

      const donor = await Donor.findOne({ userId: requestedUser.id });
      if (!donor) {
        return res.status(404).json({ success: false, message: "Donor profile not found" });
      }

      donorId = donor._id;
    }

    const orderId = `DON-${Date.now()}-${randomUUID().split("-")[0].toUpperCase()}`;
    const items = buildDonationLabel(donation_type);
    const currency = "LKR";
    const hash = buildHash(merchantId(), orderId, normalizedAmount, currency);
    const recurringTerms = buildRecurringTerms(donation_type);
    const isRecurring = donation_type !== "one-time";

    const donation = await Donation.create({
      donorId,
      guest: donorId
        ? undefined
        : {
            firstName: String(first_name).trim(),
            lastName: String(last_name).trim(),
            email: String(email).trim(),
            phone: String(phone).trim(),
            address: String(address).trim(),
            city: String(city).trim(),
            country: String(country).trim(),
          },
      orderId,
      donationType: donation_type,
      recurrence: recurringTerms.recurrence || undefined,
      duration: recurringTerms.duration || undefined,
      amount: Number(normalizedAmount),
      currency,
      paymentMethod: "PayHere Checkout",
      paymentStatus: "Pending",
      paymentGateway: "PayHere",
      message: message ? String(message).trim() : undefined,
      payhereAmount: Number(normalizedAmount),
      payhereCurrency: currency,
      statusCode: 0,
      recurring: isRecurring,
    });

    return res.status(201).json({
      success: true,
      donationId: donation._id,
      orderId,
      actionUrl: checkoutUrl(),
      fields: {
        merchant_id: merchantId(),
        return_url: buildReturnUrl(orderId),
        cancel_url: buildCancelUrl(orderId),
        notify_url:
          process.env.PAYHERE_NOTIFY_URL ||
          `${process.env.BACKEND_PUBLIC_URL || process.env.API_PUBLIC_URL || "http://localhost:5000"}/api/payments/payhere/notify`,
        first_name: String(first_name).trim(),
        last_name: String(last_name).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        country: String(country).trim(),
        order_id: orderId,
        items,
        currency,
        ...(recurringTerms.recurrence ? { recurrence: recurringTerms.recurrence } : {}),
        ...(recurringTerms.duration ? { duration: recurringTerms.duration } : {}),
        amount: normalizedAmount,
        hash,
        custom_1: String(donation._id),
        custom_2: donation_type,
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

// @desc    PayHere notify callback
// @route   POST /api/payments/payhere/notify
// @access  Public
export const handlePayHereNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      subscription_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      status_message,
      recurring,
      message_type,
      item_recurrence,
      item_duration,
      item_rec_status,
      item_rec_date_next,
      item_rec_install_paid,
    } = req.body;

    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || status_code === undefined || !md5sig) {
      return res.status(400).json({ success: false, message: "Missing payment notification fields" });
    }

    const localMd5sig = md5Upper(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${md5Upper(merchantSecret())}`
    );

    if (localMd5sig !== String(md5sig).toUpperCase()) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const donation = await Donation.findOne({ orderId: order_id });
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    const nextStatus = getStatusFromCode(status_code);
    const wasCompleted = donation.paymentStatus === "Completed";

    donation.payherePaymentId = payment_id || donation.payherePaymentId;
    donation.subscriptionId = subscription_id || donation.subscriptionId;
    donation.payhereAmount = Number(payhere_amount);
    donation.payhereCurrency = payhere_currency;
    donation.statusCode = Number(status_code);
    donation.md5sig = md5sig;
    donation.paymentStatus = nextStatus;
    donation.paymentMethod = method ? `PayHere (${method})` : donation.paymentMethod;
    donation.paymentGateway = "PayHere";
    donation.recurring = recurring === "1" || recurring === 1 || recurring === true || donation.recurring;
    donation.messageType = message_type || donation.messageType;
    donation.itemRecurrence = item_recurrence || donation.itemRecurrence;
    donation.itemDuration = item_duration || donation.itemDuration;
    donation.itemRecStatus = item_rec_status !== undefined ? Number(item_rec_status) : donation.itemRecStatus;
    donation.itemRecDateNext = item_rec_date_next || donation.itemRecDateNext;
    donation.itemRecInstallPaid =
      item_rec_install_paid !== undefined ? Number(item_rec_install_paid) : donation.itemRecInstallPaid;

    await donation.save();

    if (!wasCompleted && nextStatus === "Completed" && donation.donorId) {
      const donor = await Donor.findById(donation.donorId);
      if (donor) {
        donor.totalDonated = Number(donor.totalDonated || 0) + Number(payhere_amount || 0);
        if (donation.donationType === "monthly" || donation.donationType === "yearly") {
          donor.recurringPlan = donation.donationType;
          donor.recurringAmount = Number(payhere_amount || 0);
          donor.isSubscriptionEnabled = true;
        }
        await donor.save();
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get PayHere donation status by order ID
// @route   GET /api/payments/payhere/status/:orderId
// @access  Public
export const getPayHereDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findOne({ orderId: req.params.orderId }).populate("donorId", "fullName phone address city country");

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    return res.json({ success: true, donation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};