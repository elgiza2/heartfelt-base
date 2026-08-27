/** The APIs tab: 1,000 services you connect with your own API key.
 *
 *  Nothing here uses OAuth — each row opens a key field, the user pastes the
 *  service's API key once and the app becomes usable from chat.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { KEY_API_APPS } from "@/lib/apiApps/fromCatalog";
import type { ApiApp } from "@/lib/apiApps/types";
import { listApiApps } from "@/lib/apiApps/client";
import ApiAppLogo from "./ApiAppLogo";

const PAGE_SIZE = 60;

export default function ApiAppsTab({
  query = "",
  reloadKey = 0,
  onOpen,
}: {
  query?: string;
  reloadKey?: number;
  onOpen: (app: ApiApp) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    void listApiApps()
      .then((rows) => {
        if (!alive) return;
        const map: Record<string, boolean> = {};
        for (const row of rows) map[row.app_id] = true;
        setSaved(map);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? KEY_API_APPS.filter(
          (app) =>
            app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q),
        )
      : KEY_API_APPS;

    return [...matches].sort(
      (a, b) => Number(Boolean(saved[b.id])) - Number(Boolean(saved[a.id])),
    );
  }, [query, saved]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [query]);

  const visible = list.slice(0, visibleCount);

  return (
    <div dir="ltr" className="pb-3">
      <div className="flex items-center justify-between px-2 pb-2 pt-2 text-[12px] text-foreground/40">
        <span>Connect with your own API key</span>
        <span>{list.length.toLocaleString()} APIs</span>
      </div>

      {visible.map((app) => {
        const hasKey = Boolean(saved[app.id]);
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => onOpen(app)}
            data-api-integration={app.id}
            className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-opacity active:opacity-60"
            style={{ border: 0, background: "transparent", minHeight: 58 }}
          >
            <ApiAppLogo app={app} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-medium text-foreground">
                {app.name}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] leading-[1.5] text-foreground/40">
                {hasKey ? "API key saved" : app.description}
              </span>
            </span>
            {hasKey ? (
              <Check className="h-[18px] w-[18px] shrink-0 text-primary" />
            ) : (
              <ChevronLeft className="h-[18px] w-[18px] shrink-0 text-foreground/35" />
            )}
          </button>
        );
      })}

      {visibleCount < list.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          className="mt-2 h-11 w-full rounded-[14px] bg-foreground/[0.05] text-[13px] font-medium text-foreground transition-colors active:bg-foreground/[0.09]"
          style={{ border: 0 }}
        >
          Show more ({(list.length - visibleCount).toLocaleString()} left)
        </button>
      )}

      {list.length === 0 && (
        <p className="py-8 text-center text-[13px] text-foreground/40">No results</p>
      )}
    </div>
  );
}
