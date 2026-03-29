const quickLinks = [
  { label: "Homepage", href: "#homepage" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/work" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Donate", href: "/donate" },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-blue-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-lg font-bold">OpenLesson</h3>
          <p className="mt-3 text-sm text-blue-100">
            Building brighter futures through volunteer-led learning and community support.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-yellow-300">Quick Links</h4>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-blue-100 transition hover:text-yellow-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-yellow-300">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-blue-100">
            <li>Email: hello@openlesson.org</li>
            <li>Phone: +94 77 000 0000</li>
            <li>District: Colombo, Sri Lanka</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-blue-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-blue-200 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} OpenLesson. All rights reserved.</p>
          <a href="#homepage" className="font-medium text-yellow-300 transition hover:text-yellow-200">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
