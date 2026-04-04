import { useState } from "react";
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <Link to="/" className="text-xl font-bold text-white tracking-wide">
            OpenLesson
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 border-b border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">Student Panel</p>
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

export default function StudentLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div>
            {title && <h1 className="text-lg font-bold text-gray-800">{title}</h1>}
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}