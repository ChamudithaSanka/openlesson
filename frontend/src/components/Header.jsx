import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navLinks = [
  { label: "Homepage", href: "/#homepage" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/work" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Donate", href: "/donate" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, userType, logout } = useAuth();

  const dashboardPath =
    userType === "admin"
      ? "/admin/announcements"
      : userType === "donor"
        ? "/donor/dashboard"
        : userType === "teacher"
          ? "/teacher/dashboard"
          : "/";

  const isTeacherRoute = location.pathname.startsWith("/teacher");
  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-950 text-white shadow-xl border-b border-blue-800/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity">
          <div className="relative">
            <img src="/logo.png" alt="OpenLesson Logo" className="h-10 w-10" />
          </div>
          <span className="text-2xl font-bold tracking-tight hidden sm:inline bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            OpenLesson
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {userType !== "admin" && !isTeacherRoute && !isAdminRoute && navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm font-semibold text-white/90 transition-colors hover:text-white group"
            >
              {link.label}
              <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </a>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              <Link
                to={dashboardPath}
                className="hidden sm:inline rounded-lg bg-white/15 backdrop-blur px-4 py-2 text-sm font-semibold text-white/90 border border-white/20 hover:bg-white/25 transition-all duration-200"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-blue-900 transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400 hover:shadow-lg hover:shadow-yellow-400/30 transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-lg border-2 border-white/60 bg-transparent px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:shadow-lg"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-blue-900 transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400 hover:shadow-lg hover:shadow-yellow-400/30 transform hover:-translate-y-0.5"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 md:hidden bg-slate-900/60 backdrop-blur">
        {userType !== "admin" && navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded-lg bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white"
          >
            {link.label}
          </a>
        ))}
        {authUser ? (
          <>
            <Link
              to={dashboardPath}
              className="rounded-lg bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white/90 border border-white/20 hover:bg-white/25 transition-all duration-200"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1.5 text-xs font-semibold text-blue-900 transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="rounded-lg border border-white/40 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-white/15"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1.5 text-xs font-semibold text-blue-900 transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400"
            >
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
