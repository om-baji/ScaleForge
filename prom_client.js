// prom-client is used for collecting the metrics 
const client = require("prom-client") 

const collectionDefaultMetrics = client.collectDefaultMetrics; 

collectionDefaultMetrics({register: client.register, timeout: 5000}); 

module.exports = { client }; 