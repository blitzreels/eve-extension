import { defineExtension } from "eve/extension";
import { z } from "zod";

export default defineExtension({
  config: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url().default("https://www.blitzreels.com/api/v1"),
  }),
});
