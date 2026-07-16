import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-white/60 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p>
          Interactive demos exploring{" "}
          <span className="text-gold">AI across the software lifecycle</span>.
        </p>
        <nav aria-label="Footer links" className="flex gap-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/#tracks" className="hover:text-white transition-colors">
            Browse Demos
          </Link>
          <a
            href="https://github.com/ms-arronhoffer/ai_demo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
