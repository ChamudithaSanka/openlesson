import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const [authUser, setAuthUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const syncAuth = () => {
      const storedUser = localStorage.getItem("user");
      const storedUserType = localStorage.getItem("userType");
      if (!storedUser) {
        setAuthUser(null);
        setUserType(null);
        return;
      }

      try {
        setAuthUser(JSON.parse(storedUser));
        setUserType(storedUserType);
      } catch {
        setAuthUser(null);
        setUserType(null);
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, [location.pathname, location.search]);

  const dashboardPath =
    userType === "admin"
      ? "/admin/complaints"
      : userType === "donor"
        ? "/donor/dashboard"
        : userType === "teacher"
          ? "/teacher/dashboard"
          : "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    setAuthUser(null);
    setUserType(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-wide">
          OpenLesson
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {userType !== "admin" && navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition hover:text-yellow-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              <Link
                to={dashboardPath}
                className="hidden rounded-md border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-700 sm:inline"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-md border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-700"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="flex flex-wrap gap-3 border-t border-blue-600 px-4 py-3 md:hidden">
        {userType !== "admin" && navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded bg-white/10 px-2 py-1 text-xs font-medium transition hover:bg-yellow-400 hover:text-blue-900"
          >
            {link.label}
          </a>
        ))}
        {authUser ? (
          <>
            <Link
              to={dashboardPath}
              className="rounded bg-white/10 px-2 py-1 text-xs font-medium transition hover:bg-white hover:text-blue-900"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded bg-yellow-400 px-2 py-1 text-xs font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="rounded bg-white/10 px-2 py-1 text-xs font-medium transition hover:bg-white hover:text-blue-900"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded bg-yellow-400 px-2 py-1 text-xs font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
