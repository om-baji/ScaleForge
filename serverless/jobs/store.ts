import { PutObjectCommand } from "@aws-sdk/client-s3";
import { gzipSync } from "bun";
import { s3 } from "../utils";
import { fetchLogs } from "./inject";

export const persistLogs = async () => {
    const { inventory_logs, order_logs } = await fetchLogs()

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const uploads = [
        {
            key: `logs/inventory/${timestamp}.json.gz`,
            body: gzipSync(JSON.stringify(inventory_logs, null, 2)),
        },
        {
            key: `logs/order/${timestamp}.json.gz`,
            body: gzipSync(JSON.stringify(order_logs, null, 2)),
        },
    ];

    uploads.forEach(async file => {
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_LOGS_BUCKET!,
                Key: file.key,
                Body: file.body,
                ContentType: "application/json",
                ContentEncoding: "gzip",
            })
        );
        console.log(`✅ Uploaded ${file.key} to S3`);
    })
}