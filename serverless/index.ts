import Baker from "cronbake"
import { persistLogs } from "./jobs/store"
import { vectorJob } from "./jobs/vector"
import chalk from "chalk"

const baker = Baker.create({
    onError(error, jobName) {
        console.log("Something went wrong on ", jobName, error)
    },
})

const job = baker.add({
    name: "log_populater",
    cron: '0 0 */6 * * *',
    callback: persistLogs  
})

const embedding_job = baker.add({
    name : "vector_store_populate",
    cron : '0 0 */6 * * *',
    callback : vectorJob
})

console.log(chalk.yellow.inverse("⚡cronbake started!"))
baker.bakeAll()