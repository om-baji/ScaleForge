import { Queue } from "bullmq";
import { connection } from "./connection";

export const notificationQueue = new Queue("notification", {
    connection
})