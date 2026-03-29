import { Link } from "react-router-dom";

const values = [
  {
    title: "Access First",
    description: "We build simple paths for students to find quality learning support regardless of background.",
  },
  {
    title: "Verified Teaching",
    description: "Teachers submit CVs and are approved by admins to keep learning safe and reliable.",
  },
  {
    title: "Transparent Impact",
    description: "Donations are managed responsibly so contributors can trust how support is used.",
  },
];

const milestones = [
  { label: "Students Supported", value: "1,200+" },
  { label: "Active Volunteer Teachers", value: "95+" },
  { label: "Study Sessions Hosted", value: "420+" },
  { label: "Community Donations", value: "$18K" },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-300">About OpenLesson</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Building a community where every learner has a fair chance to grow.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
            OpenLesson connects students, volunteer teachers, and donors through one platform focused on practical, safe,
            and measurable education support.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <article>
            <h2 className="text-3xl font-bold text-blue-900">Our Mission</h2>
            <p className="mt-4 text-blue-800">
              We help students access better learning opportunities by combining volunteer-led teaching, accessible study
              resources, and community-funded support.
            </p>
            <p className="mt-3 text-blue-800">
              We believe meaningful education can happen when trusted people and the right tools come together in one
              place.
            </p>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-7">
            <h3 className="text-xl font-bold text-blue-900">How We Work</h3>
            <ul className="mt-4 space-y-3 text-sm text-blue-800">
              <li>Students register and access sessions, materials, and support channels.</li>
              <li>Teachers apply, upload CVs, and get approved before contributing.</li>
              <li>Donors fund programs through one-time or recurring contributions.</li>
              <li>Admins oversee quality, moderation, and fair distribution of support.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-blue-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-blue-900">Our Core Values</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-blue-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-6 text-blue-800">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-blue-900">Impact So Far</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {milestones.map((item) => (
            <article key={item.label} className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-blue-900">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-blue-700">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-3xl font-bold">Join the OpenLesson Mission</h2>
          <p className="mx-auto mt-3 max-w-2xl text-blue-100">
            Whether you are learning, teaching, or donating, your contribution helps build stronger futures.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register?role=student"
              className="rounded-md bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Get Started
            </Link>
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
