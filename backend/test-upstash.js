import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function main() {
  console.log(await redis.ping()); // should print "PONG"
  await redis.set("demo-key", "hello world");
  console.log(await redis.get("demo-key")); // should print "hello world"
}
main();
