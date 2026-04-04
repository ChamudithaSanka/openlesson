import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  amount: "",
  phone: "",
  address: "",
  city: "",
  country: "Sri Lanka",
  message: "",
};

export default function DonateCheckoutPage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type");
  const [donationType, setDonationType] = useState(
    initialType === "monthly" || initialType === "yearly" || initialType === "one-time"
      ? initialType
      : "one-time"
  );
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payloadPreview, setPayloadPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePrefilled, setProfilePrefilled] = useState(false);

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const isDonor = Boolean(token) && userType === "donor";
  const requiresAccount = donationType === "monthly" || donationType === "yearly";

  // Fetch donor profile on mount if logged in as donor
  useEffect(() => {
    if (!isDonor || !token) return;

    const fetchDonorProfile = async () => {
      try {
        setProfileLoading(true);
        setProfilePrefilled(false);

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data?.user;
        const donorProfile = user?.profile;

        if (!user || !donorProfile) {
          return;
        }

        const fullName = donorProfile.fullName || "";
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ");

        setForm((prev) => ({
          ...prev,
          first_name: firstName,
          last_name: lastName,
          email: user.email || "",
          phone: donorProfile.phone || "",
          address: donorProfile.address || "",
          city: donorProfile.city || "",
          country: donorProfile.country || "Sri Lanka",
        }));

        setProfilePrefilled(Boolean(firstName || lastName || user.email || donorProfile.phone));
      } catch (err) {
        console.error("Could not fetch donor profile:", err);
        setProfilePrefilled(false);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchDonorProfile();
  }, [isDonor, token]);

  const paymentModeText = useMemo(() => {
    if (requiresAccount) {
      return "Recurring donations require a donor account so you can manage pause, resume, and cancellation.";
    }

    return "One-time donations are supported for guests and registered donors.";
  }, [requiresAccount]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.country.trim()) return "Country is required.";

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return "Enter a valid donation amount.";

    if (requiresAccount && !isDonor) {
      return "Monthly and yearly donations require a donor account. Please register or login as a donor.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPayloadPreview(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const checkoutPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        amount: Number(form.amount),
        donation_type: donationType,
        message: form.message.trim(),
      };

      const response = await axios.post(
        `${apiBase}/api/payments/payhere/checkout-session`,
        checkoutPayload,
        {
          headers: isDonor && token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      const { actionUrl, fields } = response.data || {};
      if (!actionUrl || !fields) {
        throw new Error("Unable to initialize PayHere checkout.");
      }

      setPayloadPreview(fields);
      setSuccess("Redirecting to PayHere sandbox...");

      const formElement = document.createElement("form");
      formElement.method = "post";
      formElement.action = actionUrl;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value ?? "");
        formElement.appendChild(input);
      });

      document.body.appendChild(formElement);
      formElement.submit();
    } catch (err) {
      setError(err.response?.data?.message || "Could not initialize checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-blue-900">Donate Checkout</h1>
        <p className="mt-2 text-sm text-blue-800">
          Complete your donation details. Currency is fixed to LKR and payment is processed via PayHere sandbox.
        </p>

        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <label htmlFor="donationType" className="mb-2 block text-sm font-semibold text-blue-900">
            Donation Frequency
          </label>
          {profileLoading && isDonor && (
            <div className="mb-3 rounded-lg bg-blue-100 px-3 py-2 text-xs text-blue-900">
              Loading your donor profile...
            </div>
          )}
          <select
            id="donationType"
            value={donationType}
            onChange={(e) => setDonationType(e.target.value)}
            className="block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
          >
            <option value="one-time">One-Time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <p className="mt-3 text-sm text-blue-800">{paymentModeText}</p>

          {requiresAccount && !isDonor ? (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Monthly and yearly donations need a donor account.
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to="/register?role=donor"
                  className="rounded-md bg-blue-900 px-3 py-2 font-semibold text-white hover:bg-blue-800"
                >
                  Register as Donor
                </Link>
                <Link
                  to="/login"
                  className="rounded-md border border-blue-900 px-3 py-2 font-semibold text-blue-900 hover:bg-blue-100"
                >
                  Login
                </Link>
              </div>
            </div>
          ) : null}

          {isDonor && !profileLoading && profilePrefilled && (
            <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900">
              ✓ Your donor profile info is prefilled below. Just enter the donation amount and you're set!
            </div>
          )}
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-blue-900">
              First Name *
            </label>
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-blue-900">
              Last Name *
            </label>
            <input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-blue-900">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-blue-900">
              Amount (LKR) *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={onChange}
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-blue-900">
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={onChange}
              required
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium text-blue-900">
              Country *
            </label>
            <input
              id="country"
              name="country"
              value={form.country}
              onChange={onChange}
              required
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-1 block text-sm font-medium text-blue-900">
              Address *
            </label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={onChange}
              required
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-blue-900">
              City *
            </label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={onChange}
              required
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-blue-900">
              Message (Optional)
            </label>
            <input
              id="message"
              name="message"
              value={form.message}
              onChange={onChange}
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          {success ? <p className="sm:col-span-2 text-sm font-medium text-green-700">{success}</p> : null}
          {error ? <p className="sm:col-span-2 text-sm font-medium text-red-600">{error}</p> : null}

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Initializing..." : "Proceed to PayHere Sandbox"}
            </button>

            <Link
              to="/donate"
              className="rounded-md border border-blue-900 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Back to Donate Page
            </Link>
          </div>
        </form>

        {payloadPreview ? (
          <div className="mt-6 rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            <p className="mb-2 font-semibold">Checkout Payload Preview (for backend PayHere endpoint):</p>
            <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(payloadPreview, null, 2)}</pre>
          </div>
        ) : null}
      </section>
    </main>
  );
}
