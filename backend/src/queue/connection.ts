import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL must be set in .env before starting the server or worker");
}

// BullMQ requires maxRetriesPerRequest: null on the connection it's given —
// without it, ioredis gives up retrying mid-job and BullMQ throws.
// enableReadyCheck: false avoids a slow startup handshake quirk some
// managed Redis providers (like Upstash) have with ioredis's default.
export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
