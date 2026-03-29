import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    headline: "Open Doors To Learning For Every Student",
    subtext: "Volunteer-led classes, study materials, and mentorship designed to keep learners moving forward.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80",
    headline: "Teach What You Know, Change A Life",
    subtext: "Join as a verified teacher, host study sessions, and help students build confidence every week.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    headline: "Power Community Impact Through Donations",
    subtext: "Support recurring education programs and give students access to the resources they need most.",
  },
];

const audienceCards = [
  {
    title: "Student",
    description: "Find study materials, join sessions, and access support when you need it.",
    actionLabel: "Explore Learning",
    actionTo: "/register?role=student",
  },
  {
    title: "Teacher",
    description: "Teach, upload your CV, and get approved to mentor learners.",
    actionLabel: "Become A Teacher",
    actionTo: "/register?role=teacher",
  },
  {
    title: "Donor",
    description: "Support students with one-time giving or recurring monthly impact.",
    actionLabel: "Start Donating",
    actionTo: "/register?role=donor",
  },
];

const steps = [
  {
    number: "01",
    title: "Register account",
  },
  {
    number: "02",
    title: "Get matched to your role features",
  },
  {
    number: "03",
    title: "Learn, teach, or support",
  },
];

const impactStats = [
  { value: "1,200+", label: "Students Helped" },
  { value: "95+", label: "Active Teachers" },
  { value: "420+", label: "Sessions Held" },
  { value: "$18K", label: "Funds Raised" },
];

const featuredContent = [
  {
    type: "Announcement",
    title: "Weekend Revision Camp Opens This Saturday",
    meta: "Posted 2 days ago",
  },
  {
    type: "Study Session",
    title: "Grade 10 Mathematics Live Session - Tuesday 6:00 PM",
    meta: "Upcoming",
  },
  {
    type: "Study Material",
    title: "Science Quick Notes: Forces & Motion",
    meta: "Highlighted Resource",
  },
];

const trustPillars = [
  {
    title: "Teacher Verification",
    description: "Every teacher submits a CV and is reviewed through admin approval before teaching.",
  },
  {
    title: "Donation Transparency",
    description: "Contributions are tracked with clear records for accountable and transparent use.",
  },
  {
    title: "Community Moderation",
    description: "Complaint and feedback channels help keep learning spaces respectful and safe.",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const goToPrevious = () => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  return (
    <main>
      <section id="homepage" className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.headline}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
            aria-hidden={index !== activeSlide}
          >
            <div className="absolute inset-0 bg-blue-950/55" />
            <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
              <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                {slide.headline}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">{slide.subtext}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register?role=student"
                  className="rounded-md bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
                >
                  Get Started
                </Link>
                <Link
                  to="/#audience"
                  className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-xl text-white backdrop-blur transition hover:bg-white/35"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-xl text-white backdrop-blur transition hover:bg-white/35"
        >
          ›
        </button>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.headline + "-dot"}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 w-8 rounded-full transition ${
                index === activeSlide ? "bg-yellow-400" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      <section id="audience" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-900">Choose Your Path</h2>
          <p className="mt-2 text-blue-800">One platform built for students, teachers, and donors.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {audienceCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-xl font-bold text-blue-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-blue-800">{card.description}</p>
              <Link
                to={card.actionTo}
                className="mt-5 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                {card.actionLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-blue-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900">How It Works</h2>
            <p className="mt-2 text-blue-800">Fast, simple, and built for action.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-bold tracking-wider text-yellow-500">{step.number}</p>
                <h3 className="mt-3 text-lg font-semibold text-blue-900">{step.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-blue-900">Impact Snapshot</h2>
          <p className="mt-2 text-blue-800">A quick look at community progress.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-blue-900">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-blue-700">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900">Featured Content</h2>
            <p className="mt-2 text-blue-800">Fresh updates from across the platform.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredContent.map((item) => (
              <article key={item.title} className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{item.type}</p>
                <h3 className="mt-3 text-lg font-semibold text-blue-900">{item.title}</h3>
                <p className="mt-2 text-sm text-blue-700">{item.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Trust & Safety</h2>
            <p className="mt-2 text-blue-100">Built-in checks that protect students and strengthen confidence.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {trustPillars.map((pillar) => (
              <article key={pillar.title} className="rounded-2xl border border-blue-700 bg-blue-800/60 p-6">
                <h3 className="text-lg font-semibold text-yellow-300">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-blue-100">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="final-cta" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-10 text-center text-white sm:px-10">
          <h2 className="text-3xl font-bold">Ready To Be Part Of The Mission?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-blue-100">
            Join as a student or teacher, or power change through your donation.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="rounded-md bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
            >
              Join as Student/Teacher
            </Link>
            <Link
              to="/register?role=donor"
              className="rounded-md border border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-900"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
