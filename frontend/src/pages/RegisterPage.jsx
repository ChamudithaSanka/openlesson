import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const roleOptions = ["student", "teacher", "donor"];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const plan = searchParams.get("plan");
  const normalizedPlan = plan === "monthly" || plan === "yearly" ? plan : null;
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState("");
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
    gradeId: "",
    schoolName: "",
    district: "",
  });
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedRole = (searchParams.get("role") || "").toLowerCase();
    if (roleOptions.includes(requestedRole)) {
      setRole(requestedRole);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setGradesLoading(true);
        setGradesError("");
        const response = await axios.get("http://localhost:5000/api/grades");
        setGrades(response.data?.data || []);
      } catch (err) {
        setGrades([]);
        setGradesError(err.response?.data?.message || "Unable to load grades right now.");
      } finally {
        setGradesLoading(false);
      }
    };

    fetchGrades();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);
        setSubjectsError("");
        const response = await axios.get("http://localhost:5000/api/subjects");
        setSubjects(response.data?.data || []);
      } catch (err) {
        setSubjects([]);
        setSubjectsError(err.response?.data?.message || "Unable to load subjects right now.");
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectId) => {
    setTeacherSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleGradeChange = (gradeId) => {
    setTeacherGrades((prev) =>
      prev.includes(gradeId) ? prev.filter((id) => id !== gradeId) : [...prev, gradeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (role === "teacher" && !cvFile) {
      setError("CV file is required for teacher registration.");
      return;
    }

    if (role === "teacher" && teacherSubjects.length === 0) {
      setError("Please select at least one subject.");
      return;
    }

    if (role === "teacher" && teacherGrades.length === 0) {
      setError("Please select at least one grade.");
      return;
    }

    if (role === "student" && !form.gradeId) {
      setError("Please select a grade.");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("userType", role);
      
      // Combine firstName + lastName for fullName
      if (role === "donor") {
        const fullName = `${form.firstName} ${form.lastName}`.trim();
        payload.append("fullName", fullName);
        payload.append("address", form.address);
        payload.append("city", form.city);
        payload.append("country", form.country);
      } else {
        payload.append("fullName", form.fullName);
      }
      
      payload.append("email", form.email);
      payload.append("password", form.password);
      payload.append("phone", form.phone);

      if (role === "student") {
        payload.append("gradeId", form.gradeId);
        payload.append("schoolName", form.schoolName);
        payload.append("district", form.district);
      }

      if (role === "teacher") {
        payload.append("cv", cvFile);
        payload.append("subjectsTheyTeach", JSON.stringify(teacherSubjects));
        payload.append("gradesTheyTeach", JSON.stringify(teacherGrades));
      }

      const response = await axios.post("http://localhost:5000/api/auth/register", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { token, user } = response.data;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userType", user.userType);
        localStorage.setItem("userId", user.id);
      }

      setMessage("Registration successful.");
      
      // Donor flow: with plan -> recurring checkout, without plan -> donor dashboard
      if (role === "donor") {
        setTimeout(() => {
          if (normalizedPlan) {
            navigate(`/donate/checkout?type=${normalizedPlan}`);
            return;
          }

          navigate("/donor/dashboard");
        }, 1500);
      }
      
      setForm({
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        country: "Sri Lanka",
        gradeId: "",
        schoolName: "",
        district: "",
      });
      setCvFile(null);
      setTeacherSubjects([]);
      setTeacherGrades([]);
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
          {role === "donor" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First Name" name="firstName" value={form.firstName} onChange={onChange} required />
                <Input label="Last Name" name="lastName" value={form.lastName} onChange={onChange} required />
              </div>
              <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={onChange} required />
              <Input label="Address" name="address" value={form.address} onChange={onChange} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="City" name="city" value={form.city} onChange={onChange} />
                <Input label="Country" name="country" value={form.country} onChange={onChange} />
              </div>
            </>
          ) : (
            <>
              <Input label="Full Name" name="fullName" value={form.fullName} onChange={onChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
              <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={onChange} required />
            </>
          )}

          {role === "student" && (
            <>
              <div>
                <label htmlFor="gradeId" className="mb-1 block text-sm font-medium text-blue-900">
                  Grade
                </label>
                <select
                  id="gradeId"
                  name="gradeId"
                  value={form.gradeId}
                  onChange={onChange}
                  required
                  disabled={gradesLoading || grades.length === 0}
                  className="block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-900 outline-none ring-blue-600 transition focus:border-blue-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-blue-50"
                >
                  <option value="">{gradesLoading ? "Loading grades..." : "Select grade"}</option>
                  {grades.map((grade) => (
                    <option key={grade._id} value={grade._id}>
                      {grade.gradeName || grade.name || "Unnamed Grade"}
                    </option>
                  ))}
                </select>
                {gradesError ? <p className="mt-1 text-xs text-red-600">{gradesError}</p> : null}
              </div>
              <Input label="School Name" name="schoolName" value={form.schoolName} onChange={onChange} />
              <Input label="District" name="district" value={form.district} onChange={onChange} />
            </>
          )}

          {role === "teacher" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">
                  Subjects You Teach *
                </label>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  {subjectsLoading ? (
                    <p className="text-xs text-blue-600">Loading subjects...</p>
                  ) : subjectsError ? (
                    <p className="text-xs text-red-600">{subjectsError}</p>
                  ) : subjects.length === 0 ? (
                    <p className="text-xs text-gray-600">No subjects available</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {subjects.map((subject) => (
                        <label key={subject._id} className="flex items-center text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teacherSubjects.includes(subject._id)}
                            onChange={() => handleSubjectChange(subject._id)}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-blue-900">{subject.subjectName || subject.name || "Unnamed Subject"}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {teacherSubjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {teacherSubjects.map((subjectId) => {
                      const subject = subjects.find(s => s._id === subjectId);
                      return (
                        <span key={subjectId} className="inline-flex items-center gap-1 rounded-full bg-blue-200 px-3 py-1 text-xs font-medium text-blue-900">
                          {subject?.subjectName || subject?.name || "Unnamed"}
                          <button
                            type="button"
                            onClick={() => handleSubjectChange(subjectId)}
                            className="ml-1 text-blue-700 hover:text-blue-900"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">
                  Grades You Teach *
                </label>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  {gradesLoading ? (
                    <p className="text-xs text-blue-600">Loading grades...</p>
                  ) : gradesError ? (
                    <p className="text-xs text-red-600">{gradesError}</p>
                  ) : grades.length === 0 ? (
                    <p className="text-xs text-gray-600">No grades available</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {grades.map((grade) => (
                        <label key={grade._id} className="flex items-center text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teacherGrades.includes(grade._id)}
                            onChange={() => handleGradeChange(grade._id)}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-blue-900">{grade.gradeName || grade.name || "Unnamed Grade"}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {teacherGrades.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {teacherGrades.map((gradeId) => {
                      const grade = grades.find(g => g._id === gradeId);
                      return (
                        <span key={gradeId} className="inline-flex items-center gap-1 rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-900">
                          {grade?.gradeName || grade?.name || "Unnamed"}
                          <button
                            type="button"
                            onClick={() => handleGradeChange(gradeId)}
                            className="ml-1 text-green-700 hover:text-green-900"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-900">CV File (PDF/DOC/DOCX) *</label>
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
