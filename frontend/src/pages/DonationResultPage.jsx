import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";

const statusStyles = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Failed: "bg-red-100 text-red-700 border-red-200",
  Canceled: "bg-slate-100 text-slate-700 border-slate-200",
  ChargedBack: "bg-red-100 text-red-700 border-red-200",
};

export default function DonationResultPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const isCancelPage = location.pathname.includes("cancel");
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const loadStatus = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await axios.get(`${apiBase}/api/payments/payhere/status/${orderId}`);
        setDonation(response.data?.donation || null);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load payment status.");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [orderId]);

  const status = donation?.paymentStatus || (isCancelPage ? "Canceled" : "Pending");

  const statusClass = useMemo(() => {
    return statusStyles[status] || statusStyles.Pending;
  }, [status]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">PayHere Donation</p>
        <h1 className="mt-2 text-2xl font-bold text-blue-900">
          {isCancelPage ? "Donation Canceled" : "Donation Status"}
        </h1>

        {loading ? <p className="mt-4 text-sm text-blue-800">Loading payment status...</p> : null}
        {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="mt-6 space-y-4">
            <div className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusClass}`}>
              {status}
            </div>

            {orderId ? <p className="text-sm text-blue-800">Order ID: {orderId}</p> : null}

            {donation ? (
              <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
                <p>
                  Amount: <span className="font-semibold">LKR {Number(donation.amount || 0).toFixed(2)}</span>
                </p>
                <p>
                  Donation type: <span className="font-semibold">{donation.donationType || "one-time"}</span>
                </p>
                <p>
                  Payment method: <span className="font-semibold">{donation.paymentMethod || "PayHere"}</span>
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/donate"
                className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Back to Donate
              </Link>
              <Link
                to="/"
                className="rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
              >
                Go Home
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}