import { BlitzReelsClient } from "@blitzreels/sdk";

import extension from "../extension";

const USER_AGENT = "blitzreels-eve/0.2.4";

let client: BlitzReelsClient | null = null;

export function getBlitzReelsClient(): BlitzReelsClient {
  if (client) return client;
  const { apiKey, baseUrl } = extension.config;
  client = new BlitzReelsClient({
    apiKey,
    baseUrl,
    fetchFn: undefined,
    userAgent: USER_AGENT,
  });
  return client;
}
