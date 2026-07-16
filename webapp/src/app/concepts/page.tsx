import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { conceptLayers } from "@/lib/concepts";
import { getDemo, demoStartPath } from "@/lib/demos";

export const metadata: Metadata = {
  title: "AI & Agentic Building Blocks | AI Demos",
  description:
    "A layered reference map of the components behind modern AI and agentic deployments — RAG, MCP, skills, tools, tasks, agents, deployment, and governance — each with a concrete example and a demo that shows it in action.",
};

const LAYER_ACCENTS = [
  "from-navy/[0.07]",
  "from-navy-light/[0.08]",
  "from-gold/[0.08]",
  "from-navy/[0.07]",
  "from-navy-light/[0.08]",
  "from-gold/[0.08]",
];

/** Builds the concept → demo matrix, grouped by the demo that demonstrates each concept. */
function demoMatrix() {
  const byDemo = new Map<string, string[]>();
  for (const layer of conceptLayers) {
    for (const c of layer.concepts) {
      if (!c.demoSlug) continue;
      const list = byDemo.get(c.demoSlug) ?? [];
      list.push(c.term);
      byDemo.set(c.demoSlug, list);
    }
  }
  return Array.from(byDemo.entries())
    .map(([slug, terms]) => ({ demo: getDemo(slug), terms }))
    .filter(
      (row): row is {
        demo: NonNullable<ReturnType<typeof getDemo>>;
        terms: string[];
      } => !!row.demo,
    );
}

export default function ConceptsPage() {
  const matrix = demoMatrix();

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative bg-navy text-white py-20 px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-dot-grid opacity-70" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[380px] w-[680px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(176,133,64,0.24),_transparent_65%)] blur-2xl animate-glow" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-gold text-xs font-mono tracking-widest uppercase mb-6">
              Reference Map
            </p>
            <h1 className="animate-rise delay-1 font-serif text-4xl sm:text-5xl font-semibold leading-[1.08] mb-5 text-balance">
              AI &amp; Agentic Building Blocks
            </h1>
            <p className="animate-rise delay-2 text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              The components behind modern AI and agentic deployments — from the
              model layer up to operations. Each concept has a plain-English
              definition, a concrete TaskFlow example, and a link to the demo
              that shows it in action.
            </p>
          </div>
        </section>

        {/* ── Layer navigation ── */}
        <section className="border-y border-cream-dark bg-cream-dark/40">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-2">
            {conceptLayers.map((layer) => (
              <a
                key={layer.id}
                href={`#${layer.id}`}
                className="rounded-full border border-cream-dark bg-white px-3 py-1.5 text-xs font-medium text-navy/80 transition-colors hover:border-navy/30 hover:text-navy"
              >
                <span className="font-mono text-gold">
                  {String(layer.number).padStart(2, "0")}
                </span>{" "}
                {layer.title}
              </a>
            ))}
          </div>
        </section>

        {/* ── Layers ── */}
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
          {conceptLayers.map((layer, i) => (
            <section key={layer.id} id={layer.id} className="scroll-mt-24">
              <header className="mb-6 flex items-baseline gap-4">
                <span className="font-mono text-3xl font-semibold text-gold/60">
                  {String(layer.number).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy">
                    {layer.title}
                  </h2>
                  <p className="text-sm text-slate-mid">{layer.subtitle}</p>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                {layer.concepts.map((c) => {
                  const demo = c.demoSlug ? getDemo(c.demoSlug) : undefined;
                  return (
                    <article
                      key={c.term}
                      className={`reveal flex h-full flex-col rounded-xl border border-cream-dark bg-gradient-to-br ${LAYER_ACCENTS[i % LAYER_ACCENTS.length]} to-transparent p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
                    >
                      <h3 className="font-serif text-lg font-semibold text-navy">
                        {c.term}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-charcoal/80">
                        {c.definition}
                      </p>
                      <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs leading-relaxed text-charcoal/70 ring-1 ring-cream-dark">
                        <span className="font-semibold text-gold">
                          Example:{" "}
                        </span>
                        {c.example}
                      </p>
                      {demo && (
                        <Link
                          href={demoStartPath(demo)}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy/70 transition-colors hover:text-navy"
                        >
                          See it in {demo.title} →
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* ── Concept → demo matrix ── */}
        <section className="relative bg-cream-dark/30 border-t border-cream-dark py-16 px-6 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-blueprint opacity-60" />
          <div className="relative max-w-4xl mx-auto">
            <header className="mb-8 text-center">
              <p className="text-gold text-xs font-mono tracking-widest uppercase mb-2">
                From concept to demo
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy">
                Where to See Each Building Block
              </h2>
              <div aria-hidden className="rule-gold mx-auto mt-5 w-16" />
            </header>

            <div className="space-y-3">
              {matrix.map(({ demo, terms }) => (
                <div
                  key={demo.slug}
                  className="flex flex-col gap-3 rounded-xl border border-cream-dark bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-gold">
                        {demo.badge}
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-navy">
                        {demo.title}
                      </h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {terms.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-navy/5 px-2 py-0.5 text-xs text-navy/80 ring-1 ring-navy/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={demoStartPath(demo)}
                    className="shrink-0 inline-flex items-center justify-center rounded bg-navy px-4 py-2 text-sm font-medium text-white ring-1 ring-navy/10 transition-all hover:-translate-y-0.5 hover:bg-navy-mid"
                  >
                    Explore →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
