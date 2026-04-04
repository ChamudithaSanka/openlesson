const quickLinks = [
  { label: "Homepage", href: "#homepage" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/work" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Donate", href: "/register?role=donor" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-blue-900 to-slate-950 text-white border-t border-white/10">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="OpenLesson Logo" className="h-12 w-12 rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                OpenLesson
              </span>
            </div>
            <p className="mt-4 text-base leading-7 text-blue-100">
              Building brighter futures through volunteer-led learning and community support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-blue-200 transition-all duration-300 hover:text-yellow-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300"></span>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="text-blue-200 hover:text-white transition-colors duration-300">
                <span className="font-semibold text-white">Email:</span>
                <br />
                hello@openlesson.org
              </li>
              <li className="text-blue-200 hover:text-white transition-colors duration-300">
                <span className="font-semibold text-white">Phone:</span>
                <br />
                +94 77 000 0000
              </li>
              <li className="text-blue-200 hover:text-white transition-colors duration-300">
                <span className="font-semibold text-white">Location:</span>
                <br />
                Colombo, Sri Lanka
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-sm text-blue-200">
            © {new Date().getFullYear()} OpenLesson. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#homepage" className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 transition-colors duration-300 flex items-center gap-2 group">
              Back to top
              <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
