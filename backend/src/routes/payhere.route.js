import express from "express";
import {
  createPayHereCheckoutSession,
  handlePayHereNotify,
  getPayHereDonationStatus,
} from "../controllers/payhere.controller.js";

const router = express.Router();

router.post("/checkout-session", createPayHereCheckoutSession);
router.post("/notify", handlePayHereNotify);
router.get("/status/:orderId", getPayHereDonationStatus);

export default router;