const express = require('express');
const { client } = require('./sub_services/prom_client.js'); 
const { logger } = require('./sub_services/loki.js')
const app = express(); 

app.get('/', (req, res, next) => {
    logger.info("Fetching the / error"); 
    return res.json({
        status: 200, 
        message: "Route fetched sucessfully" 
    })
})

app.get('/slow', (req, res, next) => {
    setTimeout(() => {
        try{
            logger.info("Fetching /slow"); 
            const randomInt = Math.ceil(Math.random() * 2);  
            if(randomInt == 1){
                throw new Error("Failed to fetch route"); 
            }
    
            return res.json({
                status: 200, 
                message: "Slow route fetched sucessfully"
            }); 
        }catch(e){
            logger.error(e.message); 
            res.status(500).json({
                status: 500, 
                message: "Internal Server Error",
                err: e.message
            });
        }
    }, 2000)
})

app.get('/metrics', async (req, res, next) => {
    res.setHeader('Content-Type', client.register.contentType); 
    const metrics = await client.register.metrics(); 
    res.send(metrics); 
})


const PORT = process.env.PORT || 5000; 

app.listen(PORT, () =>{
    console.log(`App listening on port ${PORT}`) 
})