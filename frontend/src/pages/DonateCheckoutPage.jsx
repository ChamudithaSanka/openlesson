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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{9,15}$/;
const LETTERS_ONLY_REGEX = /^[A-Za-z]+$/;
const LETTERS_SPACES_REGEX = /^[A-Za-z ]+$/;
const MIN_DONATION = 100;
const MAX_MESSAGE_LENGTH = 500;

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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilePrefilled, setProfilePrefilled] = useState(false);

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const isDonor = Boolean(token) && userType === "donor";
  const requiresAccount = donationType === "monthly" || donationType === "yearly";
  const canShowForm = !requiresAccount || isDonor;

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
    let nextValue = value;

    if (name === "first_name" || name === "last_name") {
      nextValue = value.replace(/[^A-Za-z]/g, "");
    }

    if (name === "email") {
      nextValue = value.trimStart().toLowerCase();
    }

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 15);
    }

    if (name === "city" || name === "country") {
      nextValue = value.replace(/[^A-Za-z ]/g, "");
    }

    if (name === "amount") {
      nextValue = value.replace(/[^\d]/g, "");
    }

    if (name === "message") {
      nextValue = value.slice(0, MAX_MESSAGE_LENGTH);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const validate = () => {
    if (!LETTERS_ONLY_REGEX.test(form.first_name.trim())) return "First name must contain letters only.";
    if (!LETTERS_ONLY_REGEX.test(form.last_name.trim())) return "Last name must contain letters only.";
    if (!form.email.trim()) return "Email is required.";
    if (!EMAIL_REGEX.test(form.email)) return "Enter a valid email address.";
    if (!PHONE_REGEX.test(form.phone.trim())) return "Phone must contain 9 to 15 digits.";
    if (!form.address.trim() || form.address.trim().length < 5) return "Address must be at least 5 characters.";
    if (!LETTERS_SPACES_REGEX.test(form.city.trim())) return "City must contain letters and spaces only.";
    if (!form.country.trim()) return "Country is required.";

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < MIN_DONATION) return `Donation amount must be at least LKR ${MIN_DONATION}.`;

    if (form.message.length > MAX_MESSAGE_LENGTH) return `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;

    if (requiresAccount && !isDonor) {
      return "Monthly and yearly donations require a donor account. Please register or login as a donor.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

      setSuccess("Redirecting to payment gateway...");

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
          Complete your donation details. Currency is fixed to LKR and payment is processed securely via PayHere.
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

        {!canShowForm ? null : (
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
              min={MIN_DONATION}
              step="1"
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
              maxLength={MAX_MESSAGE_LENGTH}
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
              {loading ? "Initializing..." : "Proceed to Payment"}
            </button>

            <Link
              to="/donate"
              className="rounded-md border border-blue-900 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Back to Donate Page
            </Link>
          </div>
          </form>
        )}

      </section>
    </main>
  );
}
