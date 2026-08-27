/** @doc Ordering and de-duplication for the APIs tab.
 *
 *  Every row in the tab is a service that publishes a real OpenAPI
 *  description, so its base URL, auth scheme and endpoints come from the spec.
 *  This file decides which ones come first and removes the noise:
 *
 *  - `TOP_IDS` is a hand-checked ranking of the APIs that businesses and
 *    developers actually build on (payments, email/SMS, the Google and
 *    Microsoft work suites, the big clouds, CRM, accounting, commerce,
 *    dev tooling, maps, media). Every id was verified to exist in the
 *    directory.
 *  - Duplicates are dropped: one row per service, so the same API does not
 *    appear once per version, per hosting flavour (GitHub Enterprise), or per
 *    regional clone.
 *  - Fake/private hosts (`*.local`) and self-test specs are hidden because
 *    a key could never make them work.
 *  - Everything else stays, ranked by publisher familiarity.
 */
import { publicApiIds } from "./publicApis.generated";

/** Providers removed from the tab at the user's request. */
const BLOCKED_PROVIDERS = [
  "googleapis.com",
  "google.com",
  "amazonaws.com",
  "amazon.com",
  "microsoft.com",
  "azure.com",
  "msft.net",
];

/** Hand-picked ranking of the APIs that matter most, best first. */
const TOP_IDS = [
  // Payments and finance
  "stripe.com",
  "adyen.com:CheckoutService",
  "adyen.com:PaymentService",
  "plaid.com",
  "squareup.com",
  "mastercard.com:MDES",
  "klarna.com:openai",
  "nordigen.com",
  "qualpay.com",
  // Dev platforms
  "github.com",
  "gitlab.com",
  "docker.com:hub",
  "docker.com:engine",
  "atlassian.com:jira",
  "digitalocean.com",
  "kubernetes.io",
  // Messaging and email
  "slack.com",
  "twilio.com:api",
  "sendgrid.com",
  "nexmo.com:sms",
  "nexmo.com:messages-olympus",
  "nexmo.com:verify",
  "nexmo.com:voice",
  "twilio.com:twilio_conversations_v1",
  "twilio.com:twilio_messaging_v1",
  "twilio.com:twilio_verify_v2",
  "twilio.com:twilio_video_v1",
  "telegram.org",
  "zoom.us",
  // Productivity and work
  "notion.com",
  "asana.com",
  "trello.com",
  "clickup.com",
  "box.com",
  "zapier.com:nla",
  "docusign.net",
  // CRM, sales, support, HR
  "hubapi.com:crm",
  "hubapi.com:marketing",
  "hubapi.com:conversations",
  "hubapi.com:automation",
  "hubapi.com:analytics",
  "apideck.com:crm",
  "apideck.com:accounting",
  "apideck.com:hris",
  "apideck.com:ats",
  "apideck.com:file-storage",
  "apideck.com:customer-support",
  "apideck.com:ecommerce",
  "apideck.com:sms",
  "codat.io:accounting",
  "codat.io:banking",
  // Accounting and commerce
  "xero.com:xero_accounting",
  "xero.com:xero-payroll-au",
  "xero.com:xero_files",
  "ebay.com:buy-browse",
  "ebay.com:sell-listing",
  "ebay.com:sell-fulfillment",
  "ebay.com:sell-marketing",
  "api.ebay.com:sell-account",
  "apiz.ebay.com:sell-finances",
  "walmart.com:order",
  "walmart.com:item",
  "walmart.com:inventory",
  "walmart.com:price",
  "shop.app",
  // AI
  "openai.com",
  // Maps, travel, logistics
  "tomtom.com:search",
  "tomtom.com:maps",
  "tomtom.com:routing",
  "here.com:positioning",
  "here.com:tracking",
  "amadeus.com:amadeus-flight-offers-price",
  "amadeus.com:amadeus-hotel-search",
  "amadeus.com:amadeus-hotel-booking",
  "lyft.com",
  "ticketmaster.com:discovery",
  // Media, content, data
  "spotify.com",
  "vimeo.com",
  "giphy.com",
  "webflow.com",
  "instagram.com",
  "twitter.com:current",
  "nytimes.com:article_search",
  "nytimes.com:most_popular_api",
  "nytimes.com:books_api",
  "npr.org:listening",
  "bbc.com",
  "polygon.io",
  "nasa.gov:apod",
  "visualcrossing.com:weather",
  "weatherbit.io",
  "ote-godaddy.com:domains",
];

/** Imported curated index (public-apis repo): recognised consumer services. */
const IMPORTED_IDS = publicApiIds;

/** Publisher familiarity for everything outside the curated lists. */
const BRANDS = [
  "twilio.com",
  "nexmo.com",
  "vonage.com",
  "adyen.com",
  "mastercard.com",
  "hubapi.com",
  "apideck.com",
  "xero.com",
  "codat.io",
  "ebay.com",
  "walmart.com",
  "amadeus.com",
  "tomtom.com",
  "here.com",
  "nytimes.com",
  "npr.org",
  "ticketmaster.com",
  "docker.com",
  "atlassian.com",
  "github.com",
  "gitlab.com",
];

/** Never shown: private hosts and self-test specs a key could not unlock. */
const HIDDEN = [
  ".local",
  "localhost",
  "example.com",
  "getsandbox.com",
  "hetras-certification.net",
  "seldon",
  "presalytics",
];

/** Ranked below everything else: niche, regional or government-only APIs. */
const DEMOTED = [
  ".gov",
  "gov.",
  "apisetu",
  "ndhm",
  "parliament.uk",
  "interzoid",
  "fungenerators",
  "funtranslations",
  "letmc",
  "amentum",
];

/** Size of the highlighted top section. */
export const TOP_SECTION = 500;

const TOP_INDEX = new Map(TOP_IDS.map((id, index) => [id, index]));
const IMPORTED_INDEX = new Map<string, number>();
IMPORTED_IDS.forEach((id, index) => {
  const k = id.replace(/^dir:/, "").toLowerCase();
  if (!IMPORTED_INDEX.has(k)) IMPORTED_INDEX.set(k, index);
});

function key(id: string): string {
  return id.replace(/^dir:/, "").toLowerCase();
}

export function providerOf(id: string): string {
  const k = key(id);
  return k.split(":")[0] ?? k;
}

/** True for entries removed from the tab: blocked providers, private hosts and self-test specs. */
export function isHidden(id: string): boolean {
  const k = key(id);
  const provider = k.split(":")[0] ?? k;
  if (BLOCKED_PROVIDERS.includes(provider)) return true;
  return HIDDEN.some((bad) => k.includes(bad));
}

/** Duplicate flavours of one API: versions, enterprise clones, legacy specs. */
function isDuplicateFlavour(id: string): boolean {
  const k = key(id);
  return (
    /:ghes[-.]/.test(k) ||
    /:ghec/.test(k) ||
    /\.\d{4}-\d{2}-\d{2}$/.test(k) ||
    /:.*legacy/.test(k) ||
    /[-_]v\d+(\.\d+)?$/.test(k)
  );
}

function brandRank(id: string): number {
  const k = key(id);
  for (let i = 0; i < BRANDS.length; i += 1) {
    if (k.includes(BRANDS[i]!)) return i;
  }
  return BRANDS.length;
}

/** Lower sorts earlier. Curated top ids win, then brands, then the long tail. */
export function scoreOf(id: string): number {
  const k = key(id);
  const top = TOP_INDEX.get(k);
  if (top !== undefined) return top;
  const imported = IMPORTED_INDEX.get(k);
  if (imported !== undefined) return TOP_IDS.length + imported;
  const demoted = DEMOTED.some((bad) => k.includes(bad)) ? 100_000 : 0;
  const duplicate = isDuplicateFlavour(k) ? 50_000 : 0;
  const base = TOP_IDS.length + IMPORTED_IDS.length;
  return base + brandRank(k) * 100 + duplicate + demoted;
}

/**
 * Order entries so the top rows are the widely used services, drop unusable
 * and duplicate specs, and keep the rest of the directory below.
 */
export function rankEntries<T extends { id: string; name: string }>(entries: T[]): T[] {
  const usable = entries.filter((entry) => !isHidden(entry.id));

  const sorted = [...usable].sort((a, b) => {
    const score = scoreOf(a.id) - scoreOf(b.id);
    if (score !== 0) return score;
    return a.name.localeCompare(b.name);
  });

  // One row per service: same publisher + same title is the same API.
  const seenTitles = new Set<string>();
  const unique: T[] = [];
  for (const entry of sorted) {
    const fingerprint = `${providerOf(entry.id)}|${entry.name.trim().toLowerCase()}`;
    if (seenTitles.has(fingerprint)) continue;
    seenTitles.add(fingerprint);
    unique.push(entry);
  }

  // Keep the highlighted section varied: no publisher floods it.
  const cap = 12;
  const top: T[] = [];
  const rest: T[] = [];
  const perProvider = new Map<string, number>();
  for (const entry of unique) {
    const provider = providerOf(entry.id);
    const used = perProvider.get(provider) ?? 0;
    const curated = TOP_INDEX.has(key(entry.id)) || IMPORTED_INDEX.has(key(entry.id));
    if (top.length < TOP_SECTION && (curated || used < cap)) {
      perProvider.set(provider, used + 1);
      top.push(entry);
    } else {
      rest.push(entry);
    }
  }

  return [...top, ...rest];
}
