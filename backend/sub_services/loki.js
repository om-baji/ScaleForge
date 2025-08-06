import { createLogger, transports } from "winston";

import LokiTransport from "winston-loki";

const options = {
  transports: [
    new LokiTransport({
      labels: {
        appName: "Booking App",
      },
      host: "http://127.0.0.1:3100",
    }),
  ],
};

export const logger = createLogger(options);
