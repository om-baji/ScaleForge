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
    const inventory_logs = await api.Loki.queryRange(
        ql,
        {
            start: "1d",
            limit: 200
        }
    );

    const order_logs = await api.Loki.queryRange(
        q2,
        {
            start: "1d",
            limit: 200
        }
    );

    return {
        inventory_logs,
        order_logs
    }
}