import { Job, Worker } from "bullmq";
import { mailer, mailTemplate } from "../emails/setup";
import { connection } from "../connection";

type Order = {
    id: string;
    name: string;
    email: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    status: string;
}

new Worker("notification", async (job: Job) => {

    console.log("[BROKER - NOTIFICATION] ", job.name)
    const data: Order = job.data;

    await mailer.sendMail({
        to: data.email,
        html: mailTemplate(data),
    })
}, {
    connection
})