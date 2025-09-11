import { GrafanaApi } from "@myunisoft/loki";
import { LogQL, StreamSelector } from "@sigyn/logql";

const api = new GrafanaApi({
    authentication: {
        type: "bearer",
        token: process.env.GRAFANA_API_TOKEN!
    },
    remoteApiURL: "http://localhost:3100"
});

const ql = new LogQL(
    new StreamSelector({ app: "inventory-service" })
);

const q2 = new LogQL(
    new StreamSelector({ app: "order-service" })
);

export const fetchLogs = async () => {
    const inv_logs = await api.Loki.queryRange(
        ql,
        {
            start: "1d",
            limit: 200
        }
    );

    const od_logs = await api.Loki.queryRange(
        q2,
        {
            start: "1d",
            limit: 200
        }
    );

    const inventory_logs = inv_logs.logs      
                    .filter(log => log.startsWith("HTTP Request"))
                    .map(log => JSON.parse(log.replace("HTTP Request","")))

    const order_logs = od_logs.logs      
                    .filter(log => log.startsWith("HTTP Request"))
                    .map(log => JSON.parse(log.replace("HTTP Request","")))

    return {
        inventory_logs,
        order_logs
    }
}