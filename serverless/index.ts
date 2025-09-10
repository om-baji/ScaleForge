import Baker from "cronbake"
import { persistLogs } from "./jobs/store"

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

console.log("cronbake started!")
baker.bakeAll()