/** @doc Square logo for a ready-made API app, with a letter fallback. */
import { useState } from "react";
import type { ApiApp } from "@/lib/apiApps/types";

/** Favicon of the service's own domain: works for any app whose logo 404s. */
function favicon(app: ApiApp): string | null {
  const source = app.baseUrl || app.docsUrl || "";
  try {
    const host = new URL(source).hostname.replace(/^(api|www|app)\./, "");
    return `https://icons.duckduckgo.com/ip3/${host}.ico`;
  } catch {
    return null;
  }
}

export default function ApiAppLogo({ app, size = 38 }: { app: ApiApp; size?: number }) {
  const [step, setStep] = useState(0);
  const sources = [app.logo, favicon(app)].filter(Boolean) as string[];
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
