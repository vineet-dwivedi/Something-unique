import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

export async function refreshTTL(sandboxId) {
  await redisClient.expire(`sandbox:${sandboxId}`, 300); // Refresh TTL to 5 minutes
}