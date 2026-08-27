/** The APIs tab: 1,000 maintained Pipedream integrations, ranked by adoption
 * signals and available actions/triggers in the public component registry. */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { generatedIntegrations } from "@/lib/integrationsCatalog.generated";
import type { Integration } from "@/lib/integrationsData";
import { IntegrationLogo } from "./IntegrationRow";

const PAGE_SIZE = 60;

export default function ApiAppsTab({
  query = "",
  connected,
  onOpen,
}: {
  query?: string;
  connected: Record<string, boolean>;
  onOpen: (app: Integration) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? generatedIntegrations.filter(
          (app) =>
            app.name.toLowerCase().includes(q) ||
            app.description.toLowerCase().includes(q) ||
            app.category.toLowerCase().includes(q),
        )
      : generatedIntegrations;

    return [...matches].sort(
      (a, b) => Number(Boolean(connected[b.app])) - Number(Boolean(connected[a.app])),
    );
  }, [connected, query]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [query]);

  const visible = list.slice(0, visibleCount);

  return (
    <div dir="ltr" className="pb-3">
      <div className="flex items-center justify-between px-2 pb-2 pt-2 text-[12px] text-foreground/40">
        <span>Ready-made actions and triggers</span>
        <span>{list.length.toLocaleString()} apps</span>
      </div>

      {visible.map((app) => {
        const isConnected = Boolean(connected[app.app]);
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => onOpen(app)}
            data-api-integration={app.pipedreamSlug}
            className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-opacity active:opacity-60"
            style={{ border: 0, background: "transparent", minHeight: 58 }}
          >
            <IntegrationLogo item={app} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-medium text-foreground">
                {app.name}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] leading-[1.5] text-foreground/40">
                {isConnected ? "Connected" : app.description}
              </span>
            </span>
            {isConnected ? (
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