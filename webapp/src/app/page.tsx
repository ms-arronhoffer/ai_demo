import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StageCard from "@/components/StageCard";
import TrackCard from "@/components/TrackCard";
import { demos, availableDemos, demoStartPath } from "@/lib/demos";

export default function HomePage() {
  const totalStages = availableDemos.reduce(
    (sum, d) => sum + d.stages.length,
    0,
  );
  const featured = availableDemos[0];

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
              Interactive Demo Catalog
            </p>
            <h1 className="animate-rise delay-1 font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] mb-6 text-balance">
              Building &amp; Shipping Software{" "}
              <span className="relative inline-block">
                <span className="text-gold-gradient">with AI</span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent"
                />
              </span>
            </h1>
            <p className="animate-rise delay-2 text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              A growing library of hands-on tracks. Each one follows a real
              example app and shows how AI accelerates the work — from writing
              code to deploying the infrastructure and AI resources behind it.
            </p>
            <div className="animate-rise delay-3 flex flex-wrap gap-4 justify-center">
              <a
                href="#tracks"
                className="group relative px-6 py-3 bg-navy-light hover:bg-navy-light/90 rounded font-medium shadow-lg shadow-navy/40 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="relative z-10">Browse the Demos →</span>
              </a>
              {featured && (
                <Link
                  href={demoStartPath(featured)}
                  className="px-6 py-3 border border-white/20 text-white/80 hover:border-gold/50 hover:text-white rounded font-medium transition-colors"
                >
                  Start with {featured.title}
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <section className="relative bg-cream-dark/40 border-y border-cream-dark py-10 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
            {[
              { value: String(availableDemos.length), label: "Demo Tracks" },
              { value: String(totalStages), label: "Guided Stages" },
              { value: "Growing", label: "More on the Way" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-navy">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-mid tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tracks ────────────────────────────────────────────────────── */}
        <section
          id="tracks"
          className="relative max-w-5xl mx-auto px-6 py-20 scroll-mt-20"
        >
          <header className="mb-12 text-center">
            <p className="text-gold text-xs font-mono tracking-widest uppercase mb-2">
              Choose a Track
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-navy">
              Two Tracks, One Journey
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-charcoal/70 leading-relaxed">
              Learn how AI helps you <strong>build</strong> software, then how
              to <strong>deploy</strong> it — including the infrastructure and
              AI resources it depends on. New tracks are added over time.
            </p>
            <div aria-hidden className="rule-gold mx-auto mt-5 w-16" />
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            {demos.map((demo, i) => (
              <div key={demo.slug} className={`reveal delay-${(i % 3) + 1}`}>
                <TrackCard demo={demo} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured track stages ─────────────────────────────────────── */}
        {featured && (
          <section className="relative bg-cream-dark/30 border-t border-cream-dark py-20 px-6 overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-blueprint opacity-60" />
            <div className="relative max-w-5xl mx-auto">
              <header className="mb-12 text-center">
                <p className="text-gold text-xs font-mono tracking-widest uppercase mb-2">
                  Featured Track · {featured.title}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-navy">
                  Explore Each Stage
                </h2>
                <div aria-hidden className="rule-gold mx-auto mt-5 w-16" />
              </header>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.stages.map((stage, i) => (
                  <div key={stage.slug} className={`reveal delay-${(i % 3) + 1}`}>
                    <StageCard stage={stage} demoSlug={featured.slug} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
              Each stage takes about 5 minutes to read. Pick a track and see how
              AI fits into professional software development and delivery.
            </p>
            {featured && (
              <Link
                href={demoStartPath(featured)}
                className="inline-block px-8 py-3 bg-navy-light hover:bg-navy-light/90 rounded font-medium shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Begin with {featured.title} →
              </Link>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
