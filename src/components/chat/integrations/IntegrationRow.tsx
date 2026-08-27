import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Integration } from "@/lib/integrationsData";

/** Ordered logo sources: Simple Icons → Unavatar → Google favicon. */
function logoSources(item: Integration): string[] {
  const out: string[] = [];
  const slug = (item.pipedreamSlug || item.app || item.id)
    .toLowerCase()
    .replace(/[_\s]+/g, "")
    .replace(/[^a-z0-9-]/g, "");
  if (slug) out.push(`https://cdn.simpleicons.org/${slug}`);
  if (item.domain) {
    out.push(`https://unavatar.io/${item.domain}?fallback=false`);
    out.push(`https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`);
  }
  return out;
}

export function IntegrationLogo({ item, size = 40 }: { item: Integration; size?: number }) {
  const sources = useMemo(() => logoSources(item), [item]);
  const [idx, setIdx] = useState(0);
  const src = sources[idx];

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size, background: "transparent" }}
    >
      {src ? (
        <img
          src={src}
          alt={item.name}
          loading="lazy"
          className="object-contain"
          style={{ width: size * 0.68, height: size * 0.68, background: "transparent" }}
          onError={() => setIdx((i) => i + 1)}
        />
      ) : (
        <span className="text-[13px] font-semibold text-foreground/70">{item.name.slice(0, 1)}</span>
      )}
    </span>
  );
}

interface RowProps {
  item: Integration;
  connected: boolean;
  busy: boolean;
  onOpen: () => void;
}

/** Flat connector row — logo button only, no text, no background, no borders. */
export default function IntegrationRow({ item, connected, busy, onOpen }: RowProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-integration-row
      aria-label={item.name}
      aria-pressed={connected}
      className="flex w-full items-center justify-center rounded-[14px] px-2 py-2 transition-transform active:scale-[0.97]"
      style={{ border: 0, background: "transparent", minHeight: 56 }}
    >
      <span className="relative">
        <IntegrationLogo item={item} />
        {connected && (
          <span
            className="absolute -bottom-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
            style={{ border: "2px solid var(--background, #0f172a)" }}
          >
            <Check style={{ width: 10, height: 10 }} />
          </span>
        )}
        {busy && <Loader2 className="absolute -bottom-0.5 -left-0.5 h-4 w-4 animate-spin text-foreground/60" />}
      </span>
    </button>
  );
}
