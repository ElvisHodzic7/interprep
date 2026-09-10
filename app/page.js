// app/page.jsx
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Neon background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Subtilna mreža preko pozadine */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
          <Sparkles className="h-3 w-3" />
          InterPrep
        </div>

        {/* Hero heading */}
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-tight text-white">
          AI intervjui, munjevito.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Kreiraj pitanja, dijeli link i prati kandidate — sve u čistom, neon-futurističkom interfejsu.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth"
            className="group inline-flex items-center justify-center rounded-xl
                       bg-gradient-to-r from-cyan-500 to-indigo-500
                       hover:from-cyan-400 hover:to-indigo-400
                       px-6 py-3 font-semibold text-white
                       shadow-lg shadow-cyan-500/30 border-0"
          >
            Započni besplatno
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl
                       border border-white/15 bg-white/5 hover:bg-white/10
                       px-6 py-3 font-semibold text-slate-100"
          >
            Uđi na Dashboard
          </Link>
        </div>

        {/* Mini feature bullets (opcionalno) */}
        <ul className="mt-10 grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
          <li className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            ⚡ Generisanje pitanja po opisu posla
          </li>
          <li className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            🔗 Jednostavno dijeljenje linka kandidatu
          </li>
          <li className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            📊 Povratna informacija i ocjena intervjua
          </li>
        </ul>
      </div>

      {/* Donji radijalni “glow” */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[38vh] bg-[radial-gradient(50%_40%_at_50%_110%,rgba(56,189,248,0.18),transparent)]" />
    </main>
  );
}
