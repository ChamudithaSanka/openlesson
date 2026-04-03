import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DonorLayout from "../../components/donor/DonorLayout";

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const methodTypeOptions = ["card", "bank", "wallet"];

const getMaskedLabel = (method) => {
  const brand = method.brand || method.provider || "Method";
  const last4 = method.last4 || "----";
  return `${brand} **** ${last4}`;
};

export default function PaymentMethodsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [donorProfile, setDonorProfile] = useState(null);
  const [methods, setMethods] = useState([]);

  const [newMethod, setNewMethod] = useState({
    label: "",
    methodType: "card",
    provider: "",
    brand: "",
    last4: "",
    expMonth: "",
    expYear: "",
  });

  const activeRecurring =
    donorProfile?.isSubscriptionEnabled && donorProfile?.recurringPlan !== "none";

  const defaultMethod = useMemo(() => methods.find((item) => item.isDefault), [methods]);

  const resolveDonorId = async (headers) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.profile?._id) {
      return user.profile._id;
    }

    const meRes = await axios.get(`${getApiBase()}/api/auth/me`, { headers });
    return meRes.data?.user?.profile?._id || "";
  };

  const loadPaymentMethods = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Donor session not found. Please log in again.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const donorId = await resolveDonorId(headers);

      if (!donorId) {
        setError("Donor profile not found. Please log in again.");
        setLoading(false);
        return;
      }

      const [profileRes, methodsRes] = await Promise.all([
        axios.get(`${getApiBase()}/api/donors/profile/${donorId}`, { headers }),
        axios.get(`${getApiBase()}/api/donors/payment-methods/${donorId}`, { headers }),
      ]);

      setDonorProfile(profileRes.data?.donor || null);
      setMethods(methodsRes.data?.paymentMethods || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payment methods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleInputChange = (field, value) => {
    setNewMethod((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMethod = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const donorId = await resolveDonorId(headers);

      await axios.post(`${getApiBase()}/api/donors/payment-methods/${donorId}`, {
        ...newMethod,
        expMonth: newMethod.expMonth ? Number(newMethod.expMonth) : undefined,
        expYear: newMethod.expYear ? Number(newMethod.expYear) : undefined,
      }, { headers });

      setNewMethod({
        label: "",
        methodType: "card",
        provider: "",
        brand: "",
        last4: "",
        expMonth: "",
        expYear: "",
      });

      setMessage("Payment method added.");
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add payment method.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      setMessage("");
      setError("");
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const donorId = await resolveDonorId(headers);

      await axios.patch(
        `${getApiBase()}/api/donors/payment-methods/${donorId}/${methodId}/default`,
        {},
        { headers }
      );

      setMessage("Default payment method updated.");
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update default payment method.");
    }
  };

  const handleDelete = async (methodId) => {
    try {
      setMessage("");
      setError("");
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const donorId = await resolveDonorId(headers);

      await axios.delete(`${getApiBase()}/api/donors/payment-methods/${donorId}/${methodId}`, {
        headers,
      });

      setMessage("Payment method deleted.");
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete payment method.");
    }
  };

  if (loading) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm text-slate-600">Loading payment methods...</div>
      </DonorLayout>
    );
  }

  if (error && !methods.length) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm font-medium text-red-600">{error}</div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <section className="space-y-6 p-6">
        <header className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-900">Payment Methods</h1>
          <p className="mt-1 text-sm text-blue-700">
            Manage your saved payment methods for one-time and recurring donations.
          </p>
        </header>

        {message ? <p className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">{message}</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-blue-900">Saved Methods</h2>
              <span className="text-xs text-blue-700">{methods.length} method(s)</span>
            </div>

            <div className="space-y-3">
              {methods.map((method) => (
                <article
                  key={method._id}
                  className="rounded-lg border border-blue-100 bg-blue-50/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-blue-900">{method.label || getMaskedLabel(method)}</p>
                      <p className="text-sm text-blue-800">
                        {method.methodType.toUpperCase()} • {getMaskedLabel(method)}
                      </p>
                      <p className="text-xs text-blue-700">
                        Exp: {method.expMonth || "--"}/{method.expYear || "----"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(method._id)}
                          className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800 hover:border-blue-400"
                        >
                          Set Default
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(method._id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:border-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!methods.length && (
                <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                  No saved methods yet. Add one below.
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-blue-900">Subscription Dependency</h2>
              <p className="mt-2 text-sm text-blue-800">
                Active recurring: {activeRecurring ? "Yes" : "No"}
              </p>
              <p className="text-sm text-blue-800">Plan: {donorProfile?.recurringPlan || "none"}</p>
              <p className="text-sm text-blue-800">
                Amount: LKR {Number(donorProfile?.recurringAmount || 0).toLocaleString("en-LK")}
              </p>
              {activeRecurring && methods.length <= 1 ? (
                <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs font-medium text-amber-700">
                  Keep at least one method while recurring subscription is active.
                </p>
              ) : null}
            </article>

            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-blue-900">Default Method</h2>
              <p className="mt-2 text-sm text-blue-800">
                {defaultMethod ? getMaskedLabel(defaultMethod) : "No default method selected."}
              </p>
            </article>
          </aside>
        </div>

        <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900">Add New Method</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleAddMethod}>
            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Label</span>
              <input
                type="text"
                value={newMethod.label}
                onChange={(e) => handleInputChange("label", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                placeholder="Personal Visa"
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Method Type</span>
              <select
                value={newMethod.methodType}
                onChange={(e) => handleInputChange("methodType", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
              >
                {methodTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Provider</span>
              <input
                type="text"
                value={newMethod.provider}
                onChange={(e) => handleInputChange("provider", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                placeholder="Stripe"
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Brand</span>
              <input
                type="text"
                value={newMethod.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                placeholder="Visa"
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Last 4 digits</span>
              <input
                type="text"
                value={newMethod.last4}
                onChange={(e) => handleInputChange("last4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                placeholder="1234"
                required
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Exp Month</span>
              <input
                type="number"
                min="1"
                max="12"
                value={newMethod.expMonth}
                onChange={(e) => handleInputChange("expMonth", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                placeholder="12"
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Exp Year</span>
              <input
                type="number"
                min="2020"
                value={newMethod.expYear}
                onChange={(e) => handleInputChange("expYear", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                placeholder="2028"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Saving..." : "Add Method"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </DonorLayout>
  );
}
