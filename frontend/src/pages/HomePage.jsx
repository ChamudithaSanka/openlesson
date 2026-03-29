export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section id="homepage" className="rounded-lg bg-blue-50 p-8">
        <h1 className="text-3xl font-bold text-blue-900">Welcome to OpenLesson</h1>
        <p className="mt-3 text-blue-800">
          Use the navigation to explore and register based on your role.
        </p>
      </section>

      <section id="about" className="mt-10 rounded-lg border border-blue-100 bg-white p-8">
        <h2 className="text-2xl font-bold text-blue-900">About Us</h2>
        <p className="mt-2 text-blue-800">Supporting learners through volunteer-led education.</p>
      </section>

      <section id="work" className="mt-10 rounded-lg border border-blue-100 bg-white p-8">
        <h2 className="text-2xl font-bold text-blue-900">Our Work</h2>
        <p className="mt-2 text-blue-800">Study materials, sessions, mentoring, and donation support.</p>
      </section>

      <section id="volunteer" className="mt-10 rounded-lg border border-blue-100 bg-white p-8">
        <h2 className="text-2xl font-bold text-blue-900">Volunteer</h2>
        <p className="mt-2 text-blue-800">Join as a teacher and submit your profile for review.</p>
      </section>

      <section id="donate" className="mt-10 rounded-lg border border-blue-100 bg-white p-8">
        <h2 className="text-2xl font-bold text-blue-900">Donate</h2>
        <p className="mt-2 text-blue-800">Help us expand access to education resources.</p>
      </section>
    </main>
  );
}
