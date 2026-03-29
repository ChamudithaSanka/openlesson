import { Link } from "react-router-dom";

const workAreas = [
  {
    title: "Live Study Sessions",
    description: "Weekly sessions led by approved volunteer teachers to support core school subjects.",
  },
  {
    title: "Learning Resource Library",
    description: "Curated study notes, worksheets, and quick revision guides for students.",
  },
  {
    title: "Mentorship & Support",
    description: "Practical guidance and follow-up support to help students stay consistent.",
  },
  {
    title: "Community-Funded Programs",
    description: "Donor-backed learning activities for students who need extra academic support.",
  },
];

const highlights = [
  "After-school classes for exam prep",
  "Teacher-led focused revision camps",
  "Progress-oriented subject support",
  "Transparent donation-backed initiatives",
];

export default function WorkPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-300">Our Work</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Practical learning support that turns community effort into student progress.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
            OpenLesson focuses on delivering accessible education through trusted teaching, focused resources, and
            meaningful donor support.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-900">What We Deliver</h2>
          <p className="mt-2 text-blue-800">Four focused streams of impact across the platform.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {workAreas.map((area) => (
            <article key={area.title} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-900">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-blue-800">{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-blue-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <article>
              <h2 className="text-3xl font-bold text-blue-900">Program Highlights</h2>
              <p className="mt-3 text-blue-800">
                Our initiatives are designed to be simple to access, easy to scale, and accountable to the community.
              </p>
              <ul className="mt-5 space-y-3">
                {highlights.map((highlight) => (
                  <li key={highlight} className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-blue-900 shadow-sm">
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl bg-blue-900 p-8 text-white">
              <h3 className="text-2xl font-bold">How You Can Contribute</h3>
              <p className="mt-3 text-blue-100">
                Students can enroll, teachers can volunteer, and donors can fund real educational opportunities.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/register?role=student"
                  className="rounded-md bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
                >
                  Join OpenLesson
                </Link>
                <Link
                  to="/"
                  className="rounded-md border border-white/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
                >
                  Back to Home
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
