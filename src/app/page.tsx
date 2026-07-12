import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Where buyers and sellers connect
        </h1>
        <p className="mt-4 text-brand-100 max-w-xl mx-auto">
          List what you&apos;re selling, browse what others offer, and message each other
          directly — no middleman, no fuss.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/listings" className="btn-accent">
            Browse listings
          </Link>
          <Link href="/register" className="btn-outline !border-white !text-white hover:!bg-white/10">
            Sign up free
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3 mt-12">
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-semibold text-brand-800">Create your account</h3>
          <p className="text-sm text-brand-500 mt-1">
            Sign up as a buyer to shop, or a seller to list your items and services.
          </p>
        </div>
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-semibold text-brand-800">Browse or list</h3>
          <p className="text-sm text-brand-500 mt-1">
            Search by keyword and category, or publish your own listing in minutes.
          </p>
        </div>
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-semibold text-brand-800">Message directly</h3>
          <p className="text-sm text-brand-500 mt-1">
            Connect with the other side in-app to ask questions and close the deal.
          </p>
        </div>
      </section>
    </div>
  );
}
