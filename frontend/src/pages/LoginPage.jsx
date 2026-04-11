import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const safeReturnTo = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "email" ? value.trimStart().toLowerCase() : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      const { token, user } = response.data;
      setSession({ token, user });

      setMessage("Login successful. Redirecting...");
      
      // Redirect by role.
      if (user.userType === "admin") {
        setTimeout(() => navigate("/admin/announcements"), 600);
      } else if (user.userType === "donor" && safeReturnTo) {
        setTimeout(() => navigate(safeReturnTo), 600);
      } else if (user.userType === "donor") {
        setTimeout(() => navigate("/donor/dashboard"), 600);
      } else if (user.userType === "teacher") {
        setTimeout(() => navigate("/teacher/dashboard"), 600);
      } else if (user.userType === "student") {
        setTimeout(() => navigate("/student/dashboard"), 600);
      } else {
        setTimeout(() => navigate("/"), 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-blue-900">Login</h1>
        <p className="mt-2 text-sm text-blue-800">Access your account to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-blue-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-blue-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
            />
          </div>

          {message ? <p className="text-sm font-medium text-green-700">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-blue-800">
          No account yet?{" "}
          <Link to="/register" className="font-semibold text-blue-700 hover:text-yellow-500">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
