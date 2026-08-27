/** @doc Square logo for a ready-made API app, with a letter fallback. */
import { useState } from "react";
import type { ApiApp } from "@/lib/apiApps/types";

/** The service's own domain, used to look its brand mark up. */
function domain(app: ApiApp): string | null {
  const source =
    [app.baseUrl, app.docsUrl, app.keyUrl].find((url) => url && !url.includes("${")) || "";
  try {
    return new URL(source).hostname.replace(/^(api|api-m|www|app|console|dashboard|graph|open)\./, "");
  } catch {
    return null;
  }
}

/** Logo candidates, best first: the registry mark, then the brand's own logo. */
function sourcesFor(app: ApiApp): string[] {
  const host = domain(app);
  return [
    app.logo,
    host ? `https://icons.duckduckgo.com/ip3/${host}.ico` : null,
  ].filter(Boolean) as string[];
}

export default function ApiAppLogo({ app, size = 38 }: { app: ApiApp; size?: number }) {
  const [step, setStep] = useState(0);
  const sources = sourcesFor(app);
  const src = sources[step];
  const failed = !src;
  const radius = Math.round(size * 0.28);

  if (failed || !sources.length) {
    return (
      <span
        className="flex shrink-0 items-center justify-center bg-foreground/[0.06] font-semibold text-foreground/70"
        style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.42 }}
      >
        {app.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden bg-foreground/[0.04]"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <img
        src={src}
        alt={app.name}
        loading="lazy"
        onError={() => setStep((current) => current + 1)}
        style={{ width: size * 0.62, height: size * 0.62, objectFit: "contain" }}
      />
    </span>
  );
}
