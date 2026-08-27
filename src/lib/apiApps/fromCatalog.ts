/** @doc Turns the generated integrations catalog into bring-your-own-key API apps.
 *
 *  The APIs tab is key-based: the user pastes that service's own API key and it
 *  becomes usable from chat. Each entry keeps the service's real docs/keys page
 *  so the user can grab a key in one tap.
 */
import { generatedIntegrations } from "@/lib/integrationsCatalog.generated";
import type { ApiApp, ApiAppCategory } from "./types";

const CATEGORY_MAP: Record<string, ApiAppCategory> = {
  AI: "ai",
  Communication: "comms",
  "Sales & CRM": "data",
  "Payments & Finance": "finance",
  Finance: "finance",
  Development: "dev",
  Marketing: "data",
  Analytics: "data",
  Data: "data",
  Media: "media",
  Productivity: "data",
  Search: "search",
};

function toCategory(category: string): ApiAppCategory {
  return CATEGORY_MAP[category] ?? "data";
}

function docsUrl(domain?: string): string {
  return domain ? `https://${domain}` : "https://apis.guru";
}

function keyUrl(domain?: string): string {
  return domain
    ? `https://www.google.com/search?q=${encodeURIComponent(`${domain} API key developer docs`)}`
    : "https://apis.guru";
}

/** Every catalog app exposed as a key-based API app (`api:<slug>` ids). */
export const KEY_API_APPS: ApiApp[] = generatedIntegrations.map((item) => ({
  id: `api:${item.pipedreamSlug || item.app}`,
  name: item.name,
  category: toCategory(item.category),
  description: `Use the ${item.name} API with your own key`,
  docsUrl: docsUrl(item.domain),
  keyUrl: keyUrl(item.domain),
  baseUrl: item.domain ? `https://api.${item.domain}` : "",
  auth: { type: "header", name: "Authorization", prefix: "Bearer " },
  logo: item.domain
    ? `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`
    : `https://cdn.simpleicons.org/${(item.pipedreamSlug || item.app)
        .toLowerCase()
        .replace(/[_\s]+/g, "")}`,
  tools: [],
}));

export function findKeyApiApp(id: string): ApiApp | undefined {
  return KEY_API_APPS.find((app) => app.id === id);
}
