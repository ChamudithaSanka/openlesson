import { useState } from "react";
import axios from "axios";

const roleOptions = ["student", "teacher", "donor"];

export default function RegisterPage() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    gradeId: "",
    schoolName: "",
    district: "",
    qualification: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (role === "teacher" && !cvFile) {
      setError("CV file is required for teacher registration.");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("userType", role);
      payload.append("fullName", form.fullName);
      payload.append("email", form.email);
      payload.append("password", form.password);
      payload.append("phone", form.phone);

      if (role === "student") {
        payload.append("gradeId", form.gradeId);
        payload.append("schoolName", form.schoolName);
        payload.append("district", form.district);
      }

      if (role === "teacher") {
        payload.append("qualification", form.qualification);
        payload.append("cv", cvFile);
      }

      await axios.post("http://localhost:5000/api/auth/register", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Registration successful.");
      setForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        gradeId: "",
        schoolName: "",
        district: "",
        qualification: "",
      });
      setCvFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-blue-900">Create Account</h1>
        <p className="mt-2 text-sm text-blue-800">Select your role and fill the required fields.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {roleOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                role === item
                  ? "bg-blue-700 text-white"
                  : "bg-blue-50 text-blue-800 hover:bg-yellow-100"
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input label="Full Name" name="fullName" value={form.fullName} onChange={onChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} required />

          {role === "student" && (
            <>
              <Input label="Grade ID" name="gradeId" value={form.gradeId} onChange={onChange} required />
              <Input label="School Name" name="schoolName" value={form.schoolName} onChange={onChange} />
              <Input label="District" name="district" value={form.district} onChange={onChange} />
            </>
          )}

          {role === "teacher" && (
            <>
              <Input
                label="Qualification"
                name="qualification"
                value={form.qualification}
                onChange={onChange}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">CV File (PDF/DOC/DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 file:mr-3 file:rounded file:border-0 file:bg-yellow-300 file:px-3 file:py-1 file:font-semibold file:text-blue-900"
                  required
                />
              </div>
            </>
          )}

          {message ? <p className="text-sm font-medium text-green-700">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Input({ label, name, value, onChange, required = false, type = "text" }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-blue-900">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2"
      />
    </div>
  );
}
