/** @doc Ranking for the APIs tab.
 *
 *  Every entry here is a service that publishes a real OpenAPI description, so
 *  its base URL, auth scheme and endpoints are read from the spec itself — the
 *  app works as soon as the user pastes their key. The list below only decides
 *  the order: the services people and companies actually use come first, the
 *  rest of the directory follows alphabetically.
 */

/** Widely used services, most popular first. Matched against the entry id. */
const POPULAR = [
  "googleapis.com",
  "microsoft.com",
  "azure.com",
  "amazonaws.com",
  "slack.com",
  "github.com",
  "stripe.com",
  "shopify.com",
  "twilio.com",
  "sendgrid.com",
  "hubspot.com",
  "salesforce.com",
  "zoom.us",
  "atlassian.com",
  "notion.com",
  "asana.com",
  "trello.com",
  "dropbox.com",
  "box.com",
  "openai.com",
  "mailchimp.com",
  "sentry.io",
  "digitalocean.com",
  "cloudflare.com",
  "spotify.com",
  "xero.com",
  "quickbooks",
  "paypal.com",
  "adyen.com",
  "square",
  "docusign.net",
  "zendesk.com",
  "intercom.com",
  "pipedrive.com",
  "bigcommerce.com",
  "walmart.com",
  "ebay.com",
  "instagram.com",
  "linkedin.com",
  "youtube",
  "nytimes.com",
  "twitter.com",
  "meta.com",
  "gitlab.com",
  "bitbucket.org",
  "circleci.com",
  "netlify.com",
  "vercel.com",
  "heroku.com",
  "openweathermap.org",
];

/** Lower number = shown earlier. Unlisted services keep their alpha order. */
export function popularityRank(id: string): number {
  const key = id.replace(/^dir:/, "").toLowerCase();
  for (let i = 0; i < POPULAR.length; i += 1) {
    if (key.includes(POPULAR[i]!)) return i;
  }
  return POPULAR.length;
}

export function rankEntries<T extends { id: string; name: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const diff = popularityRank(a.id) - popularityRank(b.id);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}
