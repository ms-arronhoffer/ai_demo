import Link from "next/link";
import { stages } from "@/lib/stages";

export default function SiteHeader() {
  return (
    <header className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="text-gold font-bold text-xl tracking-wide leading-none">
            AI
          </span>
          <span className="text-white/80 text-sm font-medium leading-tight hidden sm:block">
            SDLC
            <br />
            <span className="text-white/50 text-xs font-normal">Demo</span>
          </span>
        </Link>

        {/* Stage nav */}
        <nav aria-label="SDLC stages" className="hidden md:block">
          <ol className="flex items-center gap-1">
            {stages.map((stage) => (
              <li key={stage.slug}>
                <Link
                  href={`/stages/${stage.slug}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="text-gold/70 text-xs font-mono">
                    {String(stage.number).padStart(2, "0")}
                  </span>
                  {stage.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {/* CTA */}
        <Link
          href="/stages/plan"
          className="shrink-0 text-sm px-4 py-2 rounded border border-gold/60 text-gold hover:bg-gold/10 transition-colors font-medium"
        >
          Start Demo →
        </Link>
      </div>
    </header>
  );
}
