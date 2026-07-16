import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIInteraction from "@/components/AIInteraction";
import { stages, getStage, getAdjacentStages } from "@/lib/stages";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return stages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stage = getStage(slug);
  if (!stage) return {};
  return {
    title: `Stage ${stage.number}: ${stage.name} | AI-Powered SDLC`,
    description: stage.summary,
  };
}

export default async function StagePage({ params }: Props) {
  const { slug } = await params;
  const stage = getStage(slug);
  if (!stage) notFound();

  const { prev, next } = getAdjacentStages(slug);

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* ── Stage hero ────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-14 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-xs text-white/50">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Overview
                  </Link>
                </li>
                <li aria-hidden>→</li>
                <li className="text-white/80">{stage.name}</li>
              </ol>
            </nav>

            {/* Stage badge + heading */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center">
                <span className="font-mono text-gold font-bold">
                  {String(stage.number).padStart(2, "0")}
                </span>
              </div>
              <div>
                <p className="text-gold text-xs font-mono tracking-widest uppercase mb-1">
                  Stage {stage.number} of {stages.length}
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight">
                  {stage.name}
                </h1>
                <p className="mt-2 text-white/70 text-lg max-w-2xl">
                  {stage.tagline}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-8 flex items-center gap-2">
              {stages.map((s) => (
                <Link key={s.slug} href={`/stages/${s.slug}`} aria-label={s.name}>
                  <span
                    className={`block h-1 w-10 rounded-full transition-colors ${
                      s.slug === slug
                        ? "bg-gold"
                        : s.number < stage.number
                        ? "bg-white/40"
                        : "bg-white/15"
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Context banner ────────────────────────────────────────────── */}
        <section className="border-b border-cream-dark bg-cream-dark/40">
          <div className="max-w-5xl mx-auto px-6 py-8 grid sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <p className="text-xs font-mono text-gold uppercase tracking-widest mb-2">
                Context
              </p>
              <p className="text-charcoal/80 leading-relaxed">{stage.summary}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-white rounded-lg border border-cream-dark">
                <p className="text-xs text-slate-mid mb-1">Impact</p>
                <p className="text-sm font-medium text-navy">{stage.impact}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-cream-dark">
                <p className="text-xs text-slate-mid mb-1">Time saved</p>
                <p className="text-sm font-semibold text-navy">{stage.timeSaved}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Challenge ─────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex gap-3 p-5 rounded-lg bg-navy/5 border border-navy/10">
            <span className="text-navy/60 text-xl shrink-0 mt-0.5">🎯</span>
            <div>
              <p className="text-xs font-semibold text-navy/50 uppercase tracking-widest mb-1">
                The Challenge
              </p>
              <p className="text-charcoal/80 leading-relaxed">{stage.challenge}</p>
            </div>
          </div>
        </section>

        {/* ── AI Interaction ────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <header className="mb-6">
            <p className="text-xs font-mono text-gold uppercase tracking-widest mb-2">
              AI in Action
            </p>
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Prompt → Response
            </h2>
          </header>

          <AIInteraction
            prompt={stage.humanPrompt}
            response={stage.aiResponse}
          />
        </section>

        {/* ── Key takeaway ──────────────────────────────────────────────── */}
        <section className="bg-cream-dark/30 border-t border-cream-dark py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-mono text-gold uppercase tracking-widest mb-3">
              Key Insight
            </p>
            <p className="font-serif text-xl text-navy leading-relaxed">
              AI doesn&rsquo;t replace the {stage.name.toLowerCase()} phase —
              it compresses the time-to-quality by acting as an expert
              collaborator at your side throughout.
            </p>
          </div>
        </section>

        {/* ── Stage navigation ──────────────────────────────────────────── */}
        <nav
          aria-label="Stage navigation"
          className="max-w-5xl mx-auto px-6 py-10 flex justify-between gap-4"
        >
          {prev ? (
            <Link
              href={`/stages/${prev.slug}`}
              className="flex items-center gap-3 group p-4 rounded-lg border border-cream-dark bg-white hover:border-navy/30 hover:shadow-sm transition-all"
            >
              <span className="text-navy/40 group-hover:text-navy transition-colors text-lg">
                ←
              </span>
              <div>
                <p className="text-xs text-slate-mid">Previous</p>
                <p className="font-medium text-navy">
                  {prev.number}. {prev.name}
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 group p-4 rounded-lg border border-cream-dark bg-white hover:border-navy/30 hover:shadow-sm transition-all"
            >
              <span className="text-navy/40 group-hover:text-navy transition-colors text-lg">
                ←
              </span>
              <div>
                <p className="text-xs text-slate-mid">Back to</p>
                <p className="font-medium text-navy">Overview</p>
              </div>
            </Link>
          )}

          {next ? (
            <Link
              href={`/stages/${next.slug}`}
              className="flex items-center gap-3 group p-4 rounded-lg border border-cream-dark bg-white hover:border-navy/30 hover:shadow-sm transition-all text-right ml-auto"
            >
              <div>
                <p className="text-xs text-slate-mid">Next</p>
                <p className="font-medium text-navy">
                  {next.number}. {next.name}
                </p>
              </div>
              <span className="text-navy/40 group-hover:text-navy transition-colors text-lg">
                →
              </span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 group p-4 rounded-lg border border-cream-dark bg-white hover:border-navy/30 hover:shadow-sm transition-all text-right ml-auto"
            >
              <div>
                <p className="text-xs text-slate-mid">You&rsquo;ve finished!</p>
                <p className="font-medium text-navy">Back to Overview</p>
              </div>
              <span className="text-navy/40 group-hover:text-navy transition-colors text-lg">
                ↑
              </span>
            </Link>
          )}
        </nav>
      </main>

      <SiteFooter />
    </>
  );
}
