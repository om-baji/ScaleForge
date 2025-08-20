import Redis from "ioredis";

export const connection = new Redis({
    // host : "host.docker.internal",
    // port : 6379,
    maxRetriesPerRequest : null
})