import express from 'express';
import Redis from 'ioredis';
import mongoose, { mongo } from 'mongoose';

const app = express();

const redis =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.get("/redis", async (req,res) =>{

    const result = await redis.ping();

    res.json({
        response : result
    })

})

app.get('/mongo' , async (req,res) => {

    const url = process.env.MONG_URL || "mongodb://localhost:27017";

    if(mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }
    res.json({
        response : "mognoose connected",
        database : mongoose.connection.name
    })

})

app.listen(3000, ()=>{
    console.log("server running on port 3000!")
})