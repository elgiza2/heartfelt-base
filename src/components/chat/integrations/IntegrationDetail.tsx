import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Globe,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import type { Integration } from "@/lib/integrationsData";
import { IntegrationLogo } from "./IntegrationRow";

interface Props {
  item: Integration;
  connected: boolean;
  busy: boolean;
  onBack: () => void;
  onToggle: () => void;
  children?: ReactNode;
}

/** Level 2 — connector detail. Scrolling is owned by the sheet container. */
export default function IntegrationDetail({ item, connected, busy, onBack, onToggle, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const site = item.domain ? `https://${item.domain}` : undefined;

  return (
    <div className="flex min-h-full flex-col">
      {/* Slim chrome — only navigation lives here */}
      <div className="relative flex shrink-0 items-center justify-between pb-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-foreground/60 transition-opacity active:opacity-60"
          style={{ border: 0 }}
        >
          <ChevronRight className="h-[19px] w-[19px]" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Options"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-foreground/60 transition-opacity active:opacity-60"
            style={{ border: 0 }}
          >
            <MoreHorizontal className="h-[19px] w-[19px]" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-10 z-20 w-52 overflow-hidden rounded-[18px] bg-card p-1.5 shadow-2xl ring-1 ring-foreground/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (site) window.open(site, "_blank", "noopener");
                }}
                className="flex w-full items-center justify-between gap-2 rounded-[13px] bg-transparent px-3 py-2.5 text-[14px] text-foreground"
                style={{ border: 0 }}
              >
                <span>Configure</span>
                <SlidersHorizontal className="h-[17px] w-[17px] text-foreground/50" />
              </button>
              <button
                type="button"
                disabled={!connected}
                onClick={() => {
                  setMenuOpen(false);
                  onToggle();
                }}
                className="flex w-full items-center justify-between gap-2 rounded-[13px] bg-transparent px-3 py-2.5 text-[14px] text-destructive disabled:opacity-40"
                style={{ border: 0 }}
              >
                <span>Disconnect</span>
                <Trash2 className="h-[17px] w-[17px]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Identity — logo, name, one honest line, live status */}
      <div dir="ltr" className="flex flex-col items-center pt-3 text-center">
        <IntegrationLogo item={item} size={76} />

        <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {item.name}
        </h3>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`h-[6px] w-[6px] rounded-full ${connected ? "bg-primary" : "bg-foreground/25"}`}
          />
          <span className="text-[12px] font-medium tracking-wide text-foreground/45">
            {connected ? "Connected" : "Not connected"}
          </span>
          <span className="text-foreground/20">·</span>
          <span className="text-[12px] font-medium tracking-wide text-foreground/45">
            {typeLabel(item.type)}
          </span>
        </div>

        <p className="mt-3.5 max-w-[32ch] text-[13.5px] leading-[1.65] text-foreground/45">
          {`Connect your ${item.name} account to run tasks from chat, securely.`}
        </p>
      </div>

      {/* Primary action sits right under the identity — no hunting for it */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          className={`inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] text-[15px] font-semibold transition-all active:scale-[0.985] disabled:opacity-60 ${
            connected
              ? "bg-foreground/[0.07] text-foreground"
              : "bg-foreground text-background"
          }`}
          style={{ border: 0 }}
        >
          {busy ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : connected ? (
            "Try it in chat"
          ) : (
            "Connect"
          )}
        </button>

        {connected && site && (
          <p dir="ltr" className="mt-2.5 text-center text-[11.5px] text-foreground/35">
            Linked to {site.replace(/^https:\/\//, "")}
          </p>
        )}
      </div>

      {children}

      {/* Resources — quiet, icon-led, no label/value table */}
      <div className="mt-7 overflow-hidden rounded-[20px] bg-card/60 ring-1 ring-foreground/[0.05]">
        <ResourceRow icon={Globe} label="Website" href={site} />
        <ResourceRow icon={BookOpen} label="Documentation" href={site ? `${site}/docs` : undefined} />
        <ResourceRow
          icon={ShieldCheck}
          label="Privacy policy"
          href={site ? `${site}/privacy` : undefined}
        />
        <ResourceRow
          icon={MessageSquare}
          label="Send feedback"
          href="mailto:support@example.com"
          last
        />
      </div>

      <div className="pb-2" />
    </div>
  );
}

function typeLabel(t: Integration["type"]) {
  switch (t) {
    case "oauth":
      return "OAuth";
    case "notification":
      return "Notifications";
    case "service":
      return "MCP";
    default:
      return "App";
  }
}

function ResourceRow({
  icon: Icon,
  label,
  href,
  last,
}: {
  icon: typeof Globe;
  label: string;
  href?: string;
  last?: boolean;
}) {
  return (
    <button
      dir="ltr"
      type="button"
      disabled={!href}
      onClick={() => href && window.open(href, "_blank", "noopener")}
      className="flex w-full items-center gap-3 bg-transparent px-4 py-3.5 text-left transition-opacity active:opacity-60 disabled:opacity-30"
      style={{
        border: 0,
        ...(last ? {} : { boxShadow: "inset 0 -1px 0 hsl(var(--foreground) / 0.05)" }),
      }}
    >
      <Icon className="h-[17px] w-[17px] shrink-0 text-foreground/40" />
      <span className="flex-1 text-[14px] text-foreground/85">{label}</span>
      <ArrowUpRight className="h-[16px] w-[16px] shrink-0 text-foreground/30" />
    </button>
  );
}
