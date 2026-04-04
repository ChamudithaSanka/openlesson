import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  AlertCircle,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  { label: "My Profile", icon: User, to: "/student/profile" },
  { label: "My Teachers", icon: Users, to: "/student/teachers" },
  { label: "Complaints", icon: AlertCircle, to: "/student/complaints" },
  { label: "Feedbacks", icon: MessageSquare, to: "/student/feedbacks" },
  { label: "Notifications", icon: Bell, to: "/student/notifications" },
];

function StudentSidebar({ open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white flex flex-col z-30 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <Link to="/" className="text-xl font-bold text-white tracking-wide">
            OpenLesson
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-1">
            Student Panel
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.to)
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    complaints: 0,
    openComplaints: 0,
    feedbacks: 0,
    notifications: 0,
  });

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "student") {
      window.location.href = "/login";
    }

    const fetchData = async () => {
      try {
        const [profileRes, complaintsRes] = await Promise.all([
          fetch(`${API_URL}/api/students/my-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/complaints/my-complaints`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setStudent(data.student);
        }

        if (complaintsRes.ok) {
          const complaints = await complaintsRes.json();
          const open = complaints.filter((c) => c.status === "Open").length;
          setStats((prev) => ({
            ...prev,
            complaints: complaints.length,
            openComplaints: open,
          }));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, [token]);

  const displayName = student?.fullName || "Student";

  const quickStats = [
    {
      label: "Total Complaints",
      value: stats.complaints,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
      labelColor: "text-blue-600",
    },
    {
      label: "Open Complaints",
      value: stats.openComplaints,
      color: "bg-red-50 border-red-200",
      textColor: "text-red-900",
      labelColor: "text-red-600",
    },
    {
      label: "Feedbacks Given",
      value: stats.feedbacks,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-900",
      labelColor: "text-green-600",
    },
    {
      label: "Notifications",
      value: stats.notifications,
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-900",
      labelColor: "text-yellow-600",
    },
  ];

  const quickLinks = [
    { label: "View My Profile", to: "/student/profile", desc: "Update your personal details and password", icon: User, color: "text-blue-600" },
    { label: "My Teachers", to: "/student/teachers", desc: "See all teachers assigned to your grade", icon: Users, color: "text-green-600" },
    { label: "Submit a Complaint", to: "/student/complaints", desc: "Report an issue or track existing ones", icon: AlertCircle, color: "text-red-600" },
    { label: "Give Feedback", to: "/student/feedbacks", desc: "Rate and review your teachers", icon: MessageSquare, color: "text-purple-600" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Welcome back, {displayName}!</h1>
              <p className="text-xs text-gray-500">Student Dashboard</p>
            </div>
          </div>
          <Link
            to="/student/notifications"
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Bell size={20} />
          </Link>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl border p-5 ${stat.color}`}
              >
                <p className={`text-sm font-medium ${stat.labelColor}`}>{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Access */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4"
                >
                  <div className={`mt-0.5 ${link.color}`}>
                    <link.icon size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{link.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Profile snapshot */}
          {student && (
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold">{displayName}</p>
                  <p className="text-blue-200 text-sm">{student.userId?.email || ""}</p>
                  {student.gradeId && (
                    <p className="text-yellow-300 text-sm font-medium mt-0.5">
                      Grade: {student.gradeId?.gradeName || "Enrolled"}
                    </p>
                  )}
                </div>
                <Link
                  to="/student/profile"
                  className="ml-auto bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}