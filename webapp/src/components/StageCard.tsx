import Link from "next/link";
import type { Stage } from "@/lib/stages";

const STAGE_ICONS: Record<string, React.ReactNode> = {
  plan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  test: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  deploy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  operate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
};

interface StageCardProps {
  stage: Stage;
}

export default function StageCard({ stage }: StageCardProps) {
  return (
    <Link
      href={`/stages/${stage.slug}`}
      className="group relative flex h-full flex-col gap-4 p-6 bg-white rounded-xl border border-cream-dark shadow-sm hover:border-navy/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Gold accent bar reveals on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Number + icon medallion */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono text-gold font-semibold tracking-widest uppercase">
          Stage {String(stage.number).padStart(2, "0")}
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy/40 ring-1 ring-navy/5 transition-all duration-300 group-hover:bg-navy group-hover:text-gold-light group-hover:ring-navy/20">
          {STAGE_ICONS[stage.slug]}
        </span>
      </div>

      {/* Name + tagline */}
      <div>
        <h3 className="font-serif text-xl font-semibold text-navy leading-tight group-hover:text-navy-mid transition-colors">
          {stage.name}
        </h3>
        <p className="mt-1.5 text-sm text-slate-mid leading-relaxed">
          {stage.tagline}
        </p>
      </div>

      {/* Time saved badge */}
      <div className="mt-auto pt-3 border-t border-cream-dark flex items-center justify-between">
        <span className="text-xs text-slate-mid">Time saved</span>
        <span className="text-xs font-semibold text-navy bg-cream px-2 py-0.5 rounded ring-1 ring-cream-dark">
          {stage.timeSaved}
        </span>
      </div>

      {/* Read-more affordance */}
      <span className="text-xs font-medium text-navy/50 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        Explore stage →
      </span>
    </Link>
  );
}
