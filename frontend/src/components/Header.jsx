import { Link } from "react-router-dom";

const navLinks = [
  { label: "Homepage", href: "/#homepage" },
  { label: "About Us", href: "/#about" },
  { label: "Our Work", href: "/#work" },
  { label: "Volunteer", href: "/#volunteer" },
  { label: "Donate", href: "/#donate" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-wide">
          OpenLesson
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
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
        </div>
      </div>

      <nav className="flex flex-wrap gap-3 border-t border-blue-600 px-4 py-3 md:hidden">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded bg-white/10 px-2 py-1 text-xs font-medium transition hover:bg-yellow-400 hover:text-blue-900"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
