import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Clinic SaaS</p>
        <h1 className="mt-3 text-2xl font-semibold">Login</h1>
        <form className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Email
            <input className={inputClassName} placeholder="doctor@clinic.test" type="email" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Password
            <input className={inputClassName} placeholder="Password" type="password" />
          </label>
          <Link className="mt-2 rounded-lg bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-800" href="/dashboard">
            Login
          </Link>
        </form>
      </section>
    </main>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";
