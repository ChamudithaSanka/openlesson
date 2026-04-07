import { Heart, LayoutDashboard, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const donorLinks = [
  { to: "/donor/dashboard", label: "Dashboard Overview", icon: LayoutDashboard, ready: true },
  { to: "/donor/history", label: "Donation History", icon: Heart, ready: true },
  { to: "/donor/subscription", label: "Subscription Settings", icon: Heart, ready: true },
  { to: "/donor/settings", label: "Profile Settings", icon: UserCog, ready: true },
];

export default function DonorSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-800 p-6 text-white">
      <h1 className="mb-8 text-2xl font-bold">Donor Panel</h1>
      <nav className="space-y-2">
        {donorLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          if (!item.ready) {
            return (
              <button
                key={item.to}
                type="button"
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg p-3 text-left opacity-60"
                title="Coming soon"
                disabled
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg p-3 transition ${
                isActive ? "bg-blue-600" : "hover:bg-slate-700"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}