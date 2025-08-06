import client from "prom-client"

const collectionDefaultMetrics = client.collectDefaultMetrics; 

collectionDefaultMetrics({register: client.register, timeout: 5000}); 

export default client;