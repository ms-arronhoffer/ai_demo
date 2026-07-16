import type { ContentBlock } from "@/lib/stages";
import CopyButton from "@/components/CopyButton";

interface AIInteractionProps {
  prompt: string;
  response: ContentBlock[];
}

export default function AIInteraction({ prompt, response }: AIInteractionProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ── Human prompt ── */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-mid">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-navy/60">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Human Prompt
          </span>
          <CopyButton text={prompt} label="Copy prompt" />
        </div>
        <div className="flex-1 bg-white border border-cream-dark rounded-xl p-5 relative shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 border-t-2 border-t-navy/30">
          <pre className="text-sm text-charcoal/90 whitespace-pre-wrap font-sans leading-relaxed">
            {prompt}
          </pre>
          <span className="absolute top-3 right-3 text-[10px] text-slate-mid/50 font-mono">
            → AI
          </span>
        </div>
      </div>

      {/* ── AI response ── */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            AI Response
          </span>
        </div>
        <div className="flex-1 bg-white border border-cream-dark rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 border-t-2 border-t-gold/50">
          <div className="p-5 space-y-4 ai-response">
            {response.map((block, i) => (
              <ContentRenderer key={i} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      if (block.level === 2) {
        return (
          <h2 className="font-serif text-lg font-semibold text-navy">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 className="font-serif text-base font-semibold text-navy/90">
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p className="text-sm text-charcoal/80 leading-relaxed">{block.text}</p>
      );

    case "code":
      return (
        <div className="rounded overflow-hidden border border-navy/20">
          <div className="flex items-center gap-2 bg-navy/90 px-3 py-1.5">
            <span className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </span>
            <span className="text-xs text-white/50 font-mono ml-1">
              {block.language}
            </span>
          </div>
          <pre className="bg-navy text-white/90 text-xs font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case "list":
      return (
        <ul className="space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-charcoal/80">
              <span className="text-gold mt-0.5 shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "checklist":
      return (
        <ul className="space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-charcoal/80">
              <span
                className={`mt-0.5 shrink-0 ${item.checked ? "text-green-600" : "text-gray-300"}`}
              >
                {item.checked ? "✓" : "○"}
              </span>
              <span className={item.checked ? "line-through text-charcoal/40" : ""}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      );

    case "callout": {
      const styles = {
        info: "bg-navy/5 border-navy/30 text-navy/80",
        success: "bg-green-50 border-green-300 text-green-800",
        warning: "bg-amber-50 border-amber-300 text-amber-800",
      };
      const icons = {
        info: "ℹ",
        success: "✓",
        warning: "⚠",
      };
      return (
        <div
          className={`flex gap-3 p-3 rounded border text-sm ${styles[block.variant]}`}
        >
          <span className="shrink-0 font-bold">{icons[block.variant]}</span>
          <p className="leading-relaxed">{block.text}</p>
        </div>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-navy/5">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-2 text-navy font-semibold border border-cream-dark"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-cream/50"}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 text-charcoal/80 border border-cream-dark align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}
