import Link from "next/link";
import type { Demo } from "@/lib/demos";
import { demoStartPath, stagePath } from "@/lib/demos";

interface TrackCardProps {
  demo: Demo;
}

export default function TrackCard({ demo }: TrackCardProps) {
  const available = demo.status === "available";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy/25 hover:shadow-xl">
      {/* Gold accent bar reveals on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex flex-1 flex-col gap-5 p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-gold">
            {demo.badge}
          </span>
          {available ? (
            <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-medium text-navy ring-1 ring-navy/10">
              {demo.stages.length} stages
            </span>
          ) : (
            <span className="rounded-full bg-cream-dark px-2.5 py-0.5 text-xs font-medium text-slate-mid ring-1 ring-cream-dark">
              Coming soon
            </span>
          )}
        </div>

        <div>
          <h3 className="font-serif text-2xl font-semibold leading-tight text-navy group-hover:text-navy-mid transition-colors">
            {demo.title}
          </h3>
          <p className="mt-2 text-slate-mid leading-relaxed">{demo.tagline}</p>
        </div>

        <p className="text-sm leading-relaxed text-charcoal/70">
          {demo.description}
        </p>

        {/* Stage pipeline preview */}
        {available && demo.stages.length > 0 && (
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {demo.stages.map((stage, idx) => (
              <li key={stage.slug} className="flex items-center">
                <Link
                  href={stagePath(demo.slug, stage.slug)}
                  className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-navy/70 transition-colors hover:bg-cream-dark/60 hover:text-navy"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">
                    {stage.number}
                  </span>
                  <span className="whitespace-nowrap font-medium">
                    {stage.name}
                  </span>
                </Link>
                {idx < demo.stages.length - 1 && (
                  <span aria-hidden className="mx-0.5 text-navy/25">
                    ·
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}

        {/* Meta */}
        <dl className="mt-auto grid grid-cols-1 gap-3 border-t border-cream-dark pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-mid">Who it&rsquo;s for</dt>
            <dd className="mt-0.5 text-charcoal/80">{demo.audience}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-mid">Outcome</dt>
            <dd className="mt-0.5 font-medium text-navy">{demo.outcome}</dd>
          </div>
        </dl>

        {/* CTA */}
        {available ? (
          <Link
            href={demoStartPath(demo)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded bg-navy px-5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-navy/10 transition-all hover:-translate-y-0.5 hover:bg-navy-mid hover:shadow-md"
          >
            Explore this track →
          </Link>
        ) : (
          <span className="mt-2 inline-flex items-center justify-center gap-2 rounded border border-dashed border-cream-dark px-5 py-2.5 text-sm font-medium text-slate-mid">
            In development
          </span>
        )}
      </div>
    </article>
  );
}
