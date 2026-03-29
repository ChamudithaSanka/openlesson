import { Link } from "react-router-dom";

const benefits = [
  {
    title: "Real Classroom Impact",
    description: "Teach focused subjects and support students who need guided learning.",
  },
  {
    title: "Flexible Contribution",
    description: "Volunteer based on your availability with structured session planning.",
  },
  {
    title: "Trusted Platform",
    description: "Work in a moderated environment with admin support and quality checks.",
  },
];

const processSteps = [
  {
    step: "1",
    title: "Register as Teacher",
    description: "Create your account and select the teacher role.",
  },
  {
    step: "2",
    title: "Upload Your CV",
    description: "Submit your qualification details and CV document.",
  },
  {
    step: "3",
    title: "Admin Approval",
    description: "Your profile is reviewed before teaching access is enabled.",
  },
  {
    step: "4",
    title: "Start Teaching",
    description: "Create sessions, share materials, and mentor students.",
  },
];

const requirements = [
  "Strong knowledge in one or more school subjects",
  "Clear communication and student-friendly teaching style",
  "Valid qualifications or relevant teaching experience",
  "Commitment to safe and respectful learning spaces",
];

export default function VolunteerPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-300">Volunteer As Teacher</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            Share your knowledge and help students unlock their potential.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
            OpenLesson welcomes passionate teachers who want to make practical impact through guided sessions,
            structured materials, and long-term mentorship.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-md bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Register as Teacher
            </Link>
            <Link
              to="/work"
              className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
            >
              See Our Work
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-900">Why Teachers Join</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((item) => (
            <article key={item.title} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-blue-800">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-blue-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900">How Teacher Onboarding Works</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item) => (
              <article key={item.step} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-bold tracking-widest text-yellow-500">STEP {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-blue-900">{item.title}</h3>
                <p className="mt-2 text-sm text-blue-800">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <article>
            <h2 className="text-3xl font-bold text-blue-900">Teacher Requirements</h2>
            <ul className="mt-5 space-y-3">
              {requirements.map((requirement) => (
                <li key={requirement} className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-blue-900">
                  {requirement}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl bg-blue-900 p-8 text-white">
            <h3 className="text-2xl font-bold">Ready To Volunteer?</h3>
            <p className="mt-3 text-blue-100">
              Join our teacher community and help students with practical, high-impact guidance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-md bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
              >
                Start Application
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
      </section>
    </main>
  );
}
