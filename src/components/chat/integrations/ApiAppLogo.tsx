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

/** Prefer the service favicon because registry artwork often includes a baked-in tile. */
function sourcesFor(app: ApiApp): string[] {
  const host = domain(app);
  return [
    host ? `https://icons.duckduckgo.com/ip3/${host}.ico` : null,
    app.logo,
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
        className="flex shrink-0 items-center justify-center font-semibold text-foreground/70"
        style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.42 }}
      >
        {app.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius, background: "transparent" }}
    >
      <img
        src={src}
        alt={app.name}
        loading="lazy"
        onError={() => setStep((current) => current + 1)}
        style={{ width: size * 0.68, height: size * 0.68, objectFit: "contain", background: "transparent" }}
      />
    </span>
  );
}
