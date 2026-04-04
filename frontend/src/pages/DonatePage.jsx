import { Link } from "react-router-dom";

const givingOptions = [
  {
    title: "One-Time Donation",
    description: "Make an immediate contribution to support current student needs and active programs.",
    points: ["Quick checkout", "Use for urgent needs", "Instant impact"],
  },
  {
    title: "Monthly Support",
    description: "Create steady support that helps us plan teacher sessions and student resources long-term.",
    points: ["Predictable support", "Sustained learning impact", "Flexible amount"],
  },
  {
    title: "Yearly Commitment",
    description: "Back annual education plans and strengthen continuity across the full learning cycle.",
    points: ["Long-term planning", "Program-level support", "Higher annual impact"],
  },
];

const impactUse = [
  "Study material preparation and distribution",
  "Volunteer session logistics and scheduling support",
  "Student-focused revision and mentoring activities",
  "Platform maintenance and community moderation",
];

const trustPoints = [
  "Donation records are tracked in the system",
  "Admin oversight on disbursement and program support",
  "Feedback and complaint channels for accountability",
];

const workflowSteps = [
  {
    title: "Guest One-Time Donation",
    detail:
      "Guest users can donate one-time by selecting amount and type in checkout, then paying through PayHere sandbox.",
  },
  {
    title: "Registered Donation",
    detail:
      "Logged-in donors use the same checkout flow, and donations are linked directly to their donor dashboard.",
  },
  {
    title: "Recurring (Monthly/Yearly)",
    detail:
      "Monthly and yearly plans require an account so donors can pause, resume, cancel, and update subscriptions.",
  },
  {
    title: "After Payment",
    detail:
      "Users land on success page, while backend confirms final payment status from notify callback before marking success.",
  },
];

export default function DonatePage() {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const isLoggedIn = Boolean(token);
  const isDonor = isLoggedIn && userType === "donor";

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-300">Donate</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Help students learn better by funding practical education support.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
            Your donation helps power study sessions, materials, and safe learning support for students who need it most.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/donate/checkout"
              className="rounded-md bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Donate Now
            </Link>
            {!isLoggedIn ? (
              <Link
                to="/register?role=donor"
                className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
              >
                Create Donor Account
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-900">Choose How You Give</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-900">One-Time Donation</h3>
            <p className="mt-3 text-sm text-blue-800">Quick, immediate impact for urgent student needs.</p>
            <div className="mt-6">
              <Link
                to="/donate/checkout?type=one-time"
                className="inline-block rounded-md bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Donate as Guest
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-900">Recurring Giving</h3>
            <p className="mt-3 text-sm text-blue-800">Monthly or yearly support for sustained learning impact.</p>
            {!isLoggedIn ? (
              <div className="mt-6 flex gap-3">
                <Link
                  to="/register?role=donor&plan=monthly"
                  className="inline-block rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  Monthly
                </Link>
                <Link
                  to="/register?role=donor&plan=yearly"
                  className="inline-block rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  Yearly
                </Link>
              </div>
            ) : isDonor ? (
              <div className="mt-6 flex gap-3">
                <Link
                  to="/donate/checkout?type=monthly"
                  className="inline-block rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  Monthly
                </Link>
                <Link
                  to="/donate/checkout?type=yearly"
                  className="inline-block rounded-md border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                >
                  Yearly
                </Link>
              </div>
            ) : (
              <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Recurring plans are available only for donor accounts. You can continue with one-time donation.
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900">How Donations Work</h2>
            <p className="mt-2 text-blue-800">Simple flow for guest, registered, and recurring donations.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {workflowSteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h3 className="text-lg font-semibold text-blue-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-blue-800">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <article>
              <h2 className="text-3xl font-bold text-blue-900">Where Your Support Goes</h2>
              <ul className="mt-5 space-y-3">
                {impactUse.map((item) => (
                  <li key={item} className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-blue-900 shadow-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl bg-blue-900 p-8 text-white">
              <h3 className="text-2xl font-bold">Trust, Transparency, and Checkout Data</h3>
              <ul className="mt-4 space-y-3 text-sm text-blue-100">
                {trustPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-blue-100">
                <p className="font-semibold text-white">You enter in checkout:</p>
                <p className="mt-1">First name, last name, email, amount (required)</p>
                <p>Phone, address, city, country (optional)</p>
                <p className="mt-3 font-semibold text-white">Set by backend:</p>
                <p>Currency (LKR), items, merchant ID, URLs, order ID, and hash</p>
              </div>
              <div className="mt-6">
                <Link
                  to="/donate/checkout"
                  className="inline-block rounded-md bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
                >
                  Continue to Checkout
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-3xl font-bold">Every Contribution Creates Opportunity</h2>
          <p className="mx-auto mt-3 max-w-2xl text-blue-100">
            Join our donor community and keep student learning active, supported, and sustainable.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/donate/checkout"
              className="rounded-md bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Start Donation
            </Link>
            {!isLoggedIn ? (
              <Link
                to="/register?role=donor"
                className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
              >
                Register for Recurring Giving
              </Link>
            ) : isDonor ? (
              <Link
                to="/donate/checkout?type=monthly"
                className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
              >
                Start Monthly Giving
              </Link>
            ) : null}
            <Link
              to="/"
              className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
