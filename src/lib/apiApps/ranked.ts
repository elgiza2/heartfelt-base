/** @doc Ranking for the APIs tab.
 *
 *  Every entry in the tab is a service that publishes a real OpenAPI
 *  description, so its base URL, auth scheme and endpoints come from the spec
 *  itself. This file only decides the order: the first ~500 rows are the
 *  services people and companies actually use every day, and the rest of the
 *  directory follows so nothing is lost.
 */

/** Brands ordered by real-world adoption. Matched against the entry id. */
const BRANDS = [
  "googleapis.com",
  "microsoft.com",
  "azure.com",
  "amazonaws.com",
  "stripe.com",
  "github.com",
  "slack.com",
  "shopify",
  "twilio.com",
  "sendgrid.com",
  "hubapi.com",
  "hubspot",
  "salesforce",
  "zoom.us",
  "atlassian.com",
  "jira",
  "notion",
  "asana.com",
  "trello",
  "dropbox.com",
  "box.com",
  "openai.com",
  "mailchimp.com",
  "sentry.io",
  "digitalocean.com",
  "cloudflare.com",
  "docker.com",
  "gitlab.com",
  "bitbucket.org",
  "circleci.com",
  "netlify.com",
  "vercel.com",
  "heroku.com",
  "paypal.com",
  "adyen.com",
  "square",
  "mastercard.com",
  "visa",
  "plaid.com",
  "xero.com",
  "quickbooks",
  "intuit",
  "docusign",
  "zendesk.com",
  "intercom.com",
  "pipedrive.com",
  "mailgun",
  "postmark",
  "twitter.com",
  "instagram.com",
  "linkedin.com",
  "youtube",
  "spotify.com",
  "apple.com",
  "meta.com",
  "facebook",
  "tiktok",
  "pinterest",
  "reddit",
  "discord",
  "telegram",
  "whatsapp",
  "nexmo.com",
  "vonage.com",
  "ebay.com",
  "walmart.com",
  "amazon.com",
  "bigcommerce",
  "vtex",
  "magento",
  "woocommerce",
  "klarna",
  "airtable",
  "monday.com",
  "clickup",
  "calendly",
  "hellosign",
  "surveymonkey",
  "typeform",
  "zapier",
  "segment",
  "mixpanel",
  "amplitude",
  "datadog",
  "newrelic",
  "pagerduty",
  "statuspage",
  "okta",
  "auth0",
  "onelogin",
  "duo",
  "cloudinary",
  "imgix",
  "unsplash",
  "giphy",
  "openweathermap.org",
  "weatherapi",
  "tomtom.com",
  "here.com",
  "mapbox",
  "uber",
  "lyft",
  "doordash",
  "booking",
  "expedia",
  "amadeus.com",
  "ticketmaster.com",
  "nytimes.com",
  "npr.org",
  "bbc",
  "guardian",
  "coinbase",
  "binance",
  "kraken",
  "coinmarketcap",
  "alphavantage",
  "polygon.io",
  "twelvedata",
  "iexcloud",
  "fedex",
  "ups.com",
  "dhl",
  "shippo",
  "easypost",
  "sendinblue",
  "brevo",
  "klaviyo",
  "activecampaign",
  "constantcontact",
  "freshdesk",
  "servicenow",
  "workday",
  "bamboohr",
  "greenhouse",
  "lever",
  "gusto",
  "adp",
  "netsuite",
  "sap",
  "oracle",
  "ibm.com",
  "redhat",
  "elastic",
  "mongodb",
  "snowflake",
  "databricks",
  "supabase",
  "firebase",
  "algolia",
  "meilisearch",
  "twitch",
  "vimeo",
  "wistia",
  "zoominfo",
  "clearbit",
  "apollo.io",
  "crunchbase",
  "figma",
  "canva",
  "miro",
  "webflow",
  "wordpress",
  "wix",
  "squarespace",
  "godaddy",
  "namecheap",
  "apideck.com",
  "codat.io",
  "rapidapi.com",
];

/** Clearly niche or regional publishers: kept in the tab, ranked below brands. */
const DEMOTED = [
  ".local",
  ".gov",
  "gov.",
  "apisetu",
  "ndhm",
  "parliament.uk",
  "interzoid",
  "fungenerators",
  "funtranslations",
  "letmc",
  "hetras",
  "presalytics",
  "seldon",
  "amentum",
  "certification",
  "sandbox",
  "test",
  "staging",
];

/** How many APIs one publisher may place in the highlighted top section. */
const PER_BRAND_CAP = 6;
/** Size of the highlighted top section. */
export const TOP_SECTION = 500;

function key(id: string): string {
  return id.replace(/^dir:/, "").toLowerCase();
}

export function providerOf(id: string): string {
  return key(id).split(":")[0] ?? key(id);
}

/** Lower is better. Unknown brands rank after every known brand. */
export function brandRank(id: string): number {
  const k = key(id);
  for (let i = 0; i < BRANDS.length; i += 1) {
    if (k.includes(BRANDS[i]!)) return i;
  }
  const demoted = DEMOTED.some((bad) => k.includes(bad));
  return BRANDS.length + (demoted ? 1000 : 0);
}

/** Within one publisher, its flagship API (shortest, unversioned key) first. */
function flagshipScore(id: string): number {
  const k = key(id);
  const parts = k.split(":");
  return (parts.length > 1 ? 1 : 0) + Math.min(9, Math.floor(k.length / 20));
}

/**
 * Order entries so the top `TOP_SECTION` rows are the widely used services,
 * with no single publisher flooding them, and keep everything else afterwards.
 */
export function rankEntries<T extends { id: string; name: string }>(entries: T[]): T[] {
  const sorted = [...entries].sort((a, b) => {
    const brand = brandRank(a.id) - brandRank(b.id);
    if (brand !== 0) return brand;
    const flagship = flagshipScore(a.id) - flagshipScore(b.id);
    if (flagship !== 0) return flagship;
    return a.name.localeCompare(b.name);
  });

  const top: T[] = [];
  const rest: T[] = [];
  const seen = new Map<string, number>();

  for (const entry of sorted) {
    const provider = providerOf(entry.id);
    const used = seen.get(provider) ?? 0;
    if (top.length < TOP_SECTION && used < PER_BRAND_CAP) {
      seen.set(provider, used + 1);
      top.push(entry);
    } else {
      rest.push(entry);
    }
  }

  return [...top, ...rest];
}
