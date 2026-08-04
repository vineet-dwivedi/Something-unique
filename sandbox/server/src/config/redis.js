import Redis from "ioredis";
import { deletePods } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const redisClient = new Redis(process.env.REDIS_URL);
const redisSubscriber = new Redis(process.env.REDIS_URL);

export async function createSandboxKey(sandboxId){
    await redisClient.set(`sandbox:${sandboxId}`, JSON.stringify({ status: "active" }), 'EX', 300); // Set key with 5 minute expiration
}

redisSubscriber.config('SET', 'notify-keyspace-events', 'Ex'); // Enable keyspace notifications for expired events

redisSubscriber.subscribe('__keyevent@0__:expired');

redisSubscriber.on('message', async (channel, key) => {
    console.log(`Key expired: ${key}`);

    const sandboxId = key.split(':')[1];

    // Delete the corresponding pod and service
    await Promise.all([
        deletePods(sandboxId),
        deleteService(sandboxId)
    ]);
});

export {redisClient, redisSubscriber};