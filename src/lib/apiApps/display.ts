/** @doc Human-readable names, descriptions and categories for API entries.
 *
 *  Raw OpenAPI titles are written for machines ("OData Service for namespace
 *  microsoft.graph", "StorageManagementClient", "Twilio - Api"). This module
 *  turns a directory id into the name a person recognises, and pulls the
 *  friendly description/category from the imported public-apis index whenever
 *  that list covers the same service.
 */
import { publicApis } from "./publicApis.generated";

const BRAND_LABELS: Record<string, string> = {
  "googleapis.com": "Google",
  "microsoft.com": "Microsoft",
  "azure.com": "Azure",
  "amazonaws.com": "AWS",
  "twilio.com": "Twilio",
  "nexmo.com": "Vonage",
  "vonage.com": "Vonage",
  "hubapi.com": "HubSpot",
  "apideck.com": "Apideck",
  "codat.io": "Codat",
  "xero.com": "Xero",
  "adyen.com": "Adyen",
  "mastercard.com": "Mastercard",
  "ebay.com": "eBay",
  "api.ebay.com": "eBay",
  "apiz.ebay.com": "eBay",
  "walmart.com": "Walmart",
  "amadeus.com": "Amadeus",
  "tomtom.com": "TomTom",
  "here.com": "HERE",
  "nytimes.com": "New York Times",
  "npr.org": "NPR",
  "ticketmaster.com": "Ticketmaster",
  "docker.com": "Docker",
  "atlassian.com": "Atlassian",
  "github.com": "GitHub",
  "gitlab.com": "GitLab",
  "getpostman.com": "Postman",
  "ote-godaddy.com": "GoDaddy",
  "squareup.com": "Square",
  "klarna.com": "Klarna",
  "openai.com": "OpenAI",
  "spotify.com": "Spotify",
  "zoom.us": "Zoom",
  "notion.com": "Notion",
  "slack.com": "Slack",
  "stripe.com": "Stripe",
  "plaid.com": "Plaid",
  "digitalocean.com": "DigitalOcean",
  "sendgrid.com": "SendGrid",
  "telegram.org": "Telegram",
  "kubernetes.io": "Kubernetes",
};

/** Words that only describe the shape of the file, not the service. */
const NOISE = [
  /^odata service for namespace\s+/i,
  /\bclient$/i,
  /\bmanagementclient\b/i,
  /\bswagger spec\b/i,
  /\bopenapi (definition|spec(ification)?)\b/i,
  /\brest api\b/i,
  /\bweb api\b/i,
];

function bareKey(id: string): string {
  return id.replace(/^dir:/, "");
}

function provider(id: string): string {
  const k = bareKey(id);
  return (k.split(":")[0] ?? k).toLowerCase();
}

function titleCase(text: string): string {
  return text
    .replace(/[-_]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Friendly description + category from the imported public-apis index. */
const CURATED = new Map(
  publicApis
    .filter((entry) => entry.id)
    .map((entry) => [entry.id as string, entry] as const),
);

export function curatedEntry(id: string) {
  return CURATED.get(id);
}

/** The name a person recognises for one directory entry. */
export function displayName(id: string, rawTitle: string): string {
  const curated = CURATED.get(id);
  if (curated) return curated.name;

  const key = bareKey(id);
  const brand = BRAND_LABELS[provider(id)];
  const service = key.includes(":") ? key.slice(key.indexOf(":") + 1) : "";

  let title = rawTitle.trim();
  for (const pattern of NOISE) title = title.replace(pattern, " ");
  title = title.replace(/\s+/g, " ").trim();

  if (!brand) return title || titleCase(service || key);

  // "Twilio - Api" / "Azure ... " → brand + the service part of the id.
  const dashed = title.replace(new RegExp(`^${brand}\\s*[-–:]\\s*`, "i"), "").trim();
  const label = dashed && dashed.toLowerCase() !== brand.toLowerCase()
    ? dashed
    : titleCase(service);
  const cleaned = titleCase(label || service);

  return cleaned.toLowerCase().startsWith(brand.toLowerCase())
    ? cleaned
    : `${brand} ${cleaned}`.trim();
}

/** A short, plain description for one directory entry. */
export function displayDescription(id: string, rawDescription: string): string {
  const curated = CURATED.get(id);
  if (curated?.description) return curated.description;
  return rawDescription;
}
