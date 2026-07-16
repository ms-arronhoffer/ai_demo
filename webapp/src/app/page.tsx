import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StageCard from "@/components/StageCard";
import { stages } from "@/lib/stages";

export default function HomePage() {
  const totalTimeSaved = "~26 hours";

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative bg-navy text-white py-24 px-6 overflow-hidden">
          {/* Layered ambient background */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-dot-grid opacity-70" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(176,133,64,0.28),_transparent_65%)] blur-2xl animate-glow" />
            <div className="absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,_rgba(45,82,130,0.5),_transparent_70%)] blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-gold text-xs font-mono tracking-widest uppercase mb-7">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              Student Demo · AI-Powered SDLC
            </p>
            <h1 className="animate-rise delay-1 font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] mb-6 text-balance">
              Building Software{" "}
              <span className="relative inline-block">
                <span className="text-gold-gradient">with AI</span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent"
                />
              </span>{" "}
              at Every Stage
            </h1>
            <p className="animate-rise delay-2 text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Follow the journey of building{" "}
              <strong className="text-white font-medium">TaskFlow</strong> — a
              real task management app — and see how AI accelerates every phase
              of the Software Development Life Cycle.
            </p>
            <div className="animate-rise delay-3 flex flex-wrap gap-4 justify-center">
              <Link
                href="/stages/plan"
                className="group relative px-6 py-3 bg-navy-light hover:bg-navy-light/90 rounded font-medium shadow-lg shadow-navy/40 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="relative z-10">Start the Demo →</span>
              </Link>
              <a
                href="#stages"
                className="px-6 py-3 border border-white/20 text-white/80 hover:border-gold/50 hover:text-white rounded font-medium transition-colors"
              >
                Explore Stages
              </a>
            </div>
          </div>
        </section>

        {/* ── SDLC Pipeline visual ──────────────────────────────────────── */}
        <section className="relative bg-cream-dark/40 border-y border-cream-dark py-8 px-6 overflow-x-auto">
          <div className="max-w-5xl mx-auto">
            <ol className="flex items-center justify-center gap-0 min-w-max mx-auto">
              {stages.map((stage, idx) => (
                <li key={stage.slug} className="flex items-center">
                  <Link
                    href={`/stages/${stage.slug}`}
                    className="group flex flex-col items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/70 transition-colors"
                  >
                    <span className="relative w-10 h-10 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center shadow-md transition-all group-hover:bg-navy-mid group-hover:-translate-y-0.5 group-hover:shadow-lg ring-2 ring-transparent group-hover:ring-gold/40">
                      {stage.number}
                    </span>
                    <span className="text-xs font-medium text-navy/70 group-hover:text-navy whitespace-nowrap transition-colors">
                      {stage.name}
                    </span>
                  </Link>
                  {idx < stages.length - 1 && (
                    <span
                      aria-hidden
                      className="mx-1 h-px w-8 bg-gradient-to-r from-navy/20 via-navy/30 to-navy/20"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Context ───────────────────────────────────────────────────── */}
        <section className="relative max-w-4xl mx-auto px-6 py-20">
          <div className="grid sm:grid-cols-3 gap-6 text-center mb-20">
            {[
              { value: "6", label: "SDLC Stages" },
              { value: totalTimeSaved, label: "Estimated Time Saved" },
              { value: "1 App", label: "Built End-to-End" },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`reveal delay-${i + 1} group relative py-8 px-4 bg-white rounded-xl border border-cream-dark shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <p className="font-serif text-4xl font-semibold text-navy">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-mid tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="reveal max-w-2xl mx-auto text-center">
            <div aria-hidden className="rule-gold mx-auto mb-6 w-16" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy mb-4">
              Why does this matter?
            </h2>
            <p className="text-charcoal/70 leading-relaxed">
              AI doesn&rsquo;t replace software engineers — it removes the
              friction at every stage of the process. From drafting requirements
              to diagnosing production incidents, AI acts as an always-available
              expert collaborator that helps teams ship better software, faster.
            </p>
          </div>
        </section>

        {/* ── Stage cards ───────────────────────────────────────────────── */}
        <section
          id="stages"
          className="relative bg-cream-dark/30 border-t border-cream-dark py-20 px-6 overflow-hidden"
        >
          <div aria-hidden className="absolute inset-0 bg-blueprint opacity-60" />
          <div className="relative max-w-5xl mx-auto">
            <header className="mb-12 text-center">
              <p className="text-gold text-xs font-mono tracking-widest uppercase mb-2">
                Interactive Walkthrough
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-navy">
                Explore Each Stage
              </h2>
              <div aria-hidden className="rule-gold mx-auto mt-5 w-16" />
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stages.map((stage, i) => (
                <div key={stage.slug} className={`reveal delay-${(i % 3) + 1}`}>
                  <StageCard stage={stage} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────────── */}
        <section className="relative bg-navy text-white py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-dot-grid opacity-60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(176,133,64,0.18),_transparent_65%)] blur-2xl animate-glow" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4">
              Ready to explore?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Each stage takes about 5 minutes to read. By the end, you&rsquo;ll
              have a clear picture of how AI fits into professional software
              development.
            </p>
            <Link
              href="/stages/plan"
              className="inline-block px-8 py-3 bg-navy-light hover:bg-navy-light/90 rounded font-medium shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Begin with Stage 01 — Plan →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
