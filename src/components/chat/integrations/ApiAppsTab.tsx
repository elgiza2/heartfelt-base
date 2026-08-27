/** The APIs tab: real REST services you connect with your own API key.
 *
 *  Every row is backed by a published OpenAPI description (curated apps first,
 *  then the live APIs.guru directory), so opening one reads its real base URL,
 *  auth scheme and endpoints. The moment the user pastes their key the endpoints
 *  become callable from chat — nothing here is a placeholder entry.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { MANUS_APPS } from "@/lib/apiApps/manus";
import { listApiApps } from "@/lib/apiApps/client";
import type { ApiApp } from "@/lib/apiApps/types";
import ApiAppLogo from "./ApiAppLogo";

const PAGE_SIZE = 60;

type Row = {
  id: string;
  name: string;
  description: string;
  logo: string;
  app?: ApiApp;
};

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
  const [opening] = useState<string | null>(null);
  const loading = false;

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

  const rows = useMemo<Row[]>(
    () =>
      MANUS_APPS.map((app) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        logo: app.logo,
        app,
      })),
    [],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? rows.filter(
          (row) =>
            row.name.toLowerCase().includes(q) ||
            row.description.toLowerCase().includes(q) ||
            row.id.toLowerCase().includes(q),
        )
      : rows;
    return [...matches].sort(
      (a, b) => Number(Boolean(saved[b.id])) - Number(Boolean(saved[a.id])),
    );
  }, [rows, query, saved]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [query]);

  const open = (row: Row) => {
    if (row.app) onOpen(row.app);
  };

  const visible = list.slice(0, visibleCount);

  return (
    <div dir="ltr" className="pb-3">
      <div className="flex items-center justify-between px-2 pb-2 pt-2 text-[12px] text-foreground/40">
        <span>Paste your API key and it works right away</span>
        <span>{loading ? "Loading…" : `${list.length.toLocaleString()} APIs`}</span>
      </div>

      {visible.map((row, index) => {
        const hasKey = Boolean(saved[row.id]);
        const divider = false;
        return (
          <div key={row.id}>
          {divider && (
            <p key="divider" className="px-2 pb-1 pt-4 text-[12px] text-foreground/35">
              More APIs
            </p>
          )}
          <button

            type="button"
            onClick={() => open(row)}
            data-api-integration={row.id}
            className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-opacity active:opacity-60"
            style={{ border: 0, background: "transparent", minHeight: 58 }}
          >
            <ApiAppLogo app={{ name: row.name, logo: row.logo } as ApiApp} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-medium text-foreground">
                {row.name}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] leading-[1.5] text-foreground/40">
                {hasKey ? "API key saved" : row.description}
              </span>
            </span>
            {opening === row.id ? (
              <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-foreground/45" />
            ) : hasKey ? (
              <Check className="h-[18px] w-[18px] shrink-0 text-primary" />
            ) : (
              <ChevronLeft className="h-[18px] w-[18px] shrink-0 text-foreground/35" />
            )}
          </button>
          </div>
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

      {!loading && list.length === 0 && (
        <p className="py-8 text-center text-[13px] text-foreground/40">No results</p>
      )}
    </div>
  );
}
