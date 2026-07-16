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
        <section className="bg-navy text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gold text-xs font-mono tracking-widest uppercase mb-4">
              Student Demo · AI-Powered SDLC
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
              Building Software{" "}
              <span className="text-gold">with AI</span>{" "}
              at Every Stage
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Follow the journey of building{" "}
              <strong className="text-white font-medium">TaskFlow</strong> — a
              real task management app — and see how AI accelerates every phase
              of the Software Development Life Cycle.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/stages/plan"
                className="px-6 py-3 bg-navy-mid border border-gold/60 text-gold hover:bg-gold/10 rounded font-medium transition-colors"
              >
                Start the Demo →
              </Link>
              <a
                href="#stages"
                className="px-6 py-3 border border-white/20 text-white/80 hover:border-white/40 hover:text-white rounded font-medium transition-colors"
              >
                Explore Stages
              </a>
            </div>
          </div>
        </section>

        {/* ── SDLC Pipeline visual ──────────────────────────────────────── */}
        <section className="bg-cream-dark/50 border-y border-cream-dark py-6 px-6 overflow-x-auto">
          <div className="max-w-5xl mx-auto">
            <ol className="flex items-center justify-center gap-0 min-w-max mx-auto">
              {stages.map((stage, idx) => (
                <li key={stage.slug} className="flex items-center">
                  <Link
                    href={`/stages/${stage.slug}`}
                    className="group flex flex-col items-center gap-1 px-4 py-2 rounded hover:bg-navy/5 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center group-hover:bg-navy-mid transition-colors">
                      {stage.number}
                    </span>
                    <span className="text-xs font-medium text-navy/80 group-hover:text-navy whitespace-nowrap">
                      {stage.name}
                    </span>
                  </Link>
                  {idx < stages.length - 1 && (
                    <span className="text-navy/20 text-lg mx-1">→</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Context ───────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-6 text-center mb-16">
            {[
              { value: "6", label: "SDLC Stages" },
              { value: totalTimeSaved, label: "Estimated Time Saved" },
              { value: "1 App", label: "Built End-to-End" },
            ].map(({ value, label }) => (
              <div key={label} className="py-6 px-4 bg-white rounded-lg border border-cream-dark">
                <p className="font-serif text-3xl font-semibold text-navy">{value}</p>
                <p className="mt-1 text-sm text-slate-mid">{label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="font-serif text-2xl font-semibold text-navy mb-4">
              Why does this matter?
            </h2>
            <p className="text-charcoal/70 leading-relaxed">
              AI doesn&rsquo;t replace software engineers — it removes the friction at
              every stage of the process. From drafting requirements to diagnosing
              production incidents, AI acts as an always-available expert
              collaborator that helps teams ship better software, faster.
            </p>
          </div>
        </section>

        {/* ── Stage cards ───────────────────────────────────────────────── */}
        <section id="stages" className="bg-cream-dark/30 border-t border-cream-dark py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <header className="mb-10 text-center">
              <p className="text-gold text-xs font-mono tracking-widest uppercase mb-2">
                Interactive Walkthrough
              </p>
              <h2 className="font-serif text-3xl font-semibold text-navy">
                Explore Each Stage
              </h2>
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stages.map((stage) => (
                <StageCard key={stage.slug} stage={stage} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
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
              className="inline-block px-8 py-3 border border-gold/60 text-gold hover:bg-gold/10 rounded font-medium transition-colors"
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
