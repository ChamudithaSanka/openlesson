import React from "react";

export default function DonationDetailsModal({ open, onClose, donation, formatDate, formatLKR, getDonationType }) {
  if (!open || !donation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-blue-900 hover:text-blue-600 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Donation Details</h2>
        <div className="space-y-2 text-sm text-blue-900">
          <p>
            <span className="font-medium">Date:</span> {formatDate(donation.createdAt)}
          </p>
          <p>
            <span className="font-medium">Amount:</span> {formatLKR(donation.amount)}
          </p>
          <p>
            <span className="font-medium">Type:</span> <span className="capitalize">{getDonationType(donation)}</span>
          </p>
          <p>
            <span className="font-medium">Payment Method:</span> {donation.paymentMethod || "-"}
          </p>
          <p>
            <span className="font-medium">Status:</span> {donation.paymentStatus || "Pending"}
          </p>
          <p>
            <span className="font-medium">Message:</span> {donation.message || "No message"}
          </p>
          <p>
            <span className="font-medium">Receipt Ref:</span> {donation._id}
          </p>
        </div>
      </div>
    </div>
  );
}
