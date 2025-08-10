import { Queue } from "bullmq";
import { connection } from "./connection";

export const bookingQueue = new Queue("booking", {
    connection,
})

export const notificationQueue = new Queue("notification", {
    connection
})