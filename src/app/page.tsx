import Link from "next/link";

export default function Home() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
      <p className="mb-3 inline-flex rounded-full bg-paraspect-lilac/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-paraspect-navy">
        Build magical personalized books in minutes
      </p>
      <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
        Turn your child into the hero of a beautiful AI storybook.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
        Mobile-first story creation, consistent characters, secure checkout, and print-ready pages.
      </p>
      <div className="mt-8">
        <Link
          href="/create"
          className="inline-flex items-center rounded-full bg-paraspect-teal px-6 py-3 text-sm font-semibold text-white shadow hover:bg-teal-600"
        >
          Start Story
        </Link>
      </div>
    </section>
  );
}
