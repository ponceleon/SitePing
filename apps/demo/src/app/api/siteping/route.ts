import { createSitepingHandler, PrismaStore } from "@siteping/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { memoryStore } from "@/lib/memory-store";

// Webhook notifications — uncomment to ping Slack/Discord on each new feedback.
// (Self-hosted demos: drop your incoming webhook URL into the env and you're done.)
//
// const SLACK_WEBHOOK = process.env.SITEPING_SLACK_WEBHOOK;
// const DISCORD_WEBHOOK = process.env.SITEPING_DISCORD_WEBHOOK;

//
// ─── Backend store ────────────────────────────────────────────────────────────
// Railway: add a PostgreSQL service → DATABASE_URL is injected automatically.
// No DATABASE_URL = in-memory store (data resets on restart — fine for eval).
//
const databaseUrl = process.env.DATABASE_URL;
const store =
  databaseUrl
    ? new PrismaStore(
        new PrismaClient({
          adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
        }),
      )
    : memoryStore;

//
// ─── API security ─────────────────────────────────────────────────────────────
// Production: set SITEPING_API_KEY to protect GET/PATCH/DELETE.
// POST stays open (the browser widget submits from unauthenticated contexts).
//
const apiKey = process.env.SITEPING_API_KEY || undefined;

export const { GET, POST, PATCH, DELETE, OPTIONS } = createSitepingHandler({
  store,
  apiKey,
  // webhooks: [
  //   ...(SLACK_WEBHOOK ? [{ url: SLACK_WEBHOOK, type: "slack" as const }] : []),
  //   ...(DISCORD_WEBHOOK ? [{ url: DISCORD_WEBHOOK, type: "discord" as const }] : []),
  // ],
});
