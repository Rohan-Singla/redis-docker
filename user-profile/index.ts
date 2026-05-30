import express from 'express';
import Redis from 'ioredis';
import mongoose, { mongo } from 'mongoose';

const app = express();

const redis =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post("/user/:id/json", async (req,res) =>{

    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));

    res.json({
        savedAs : "json"
    })

})


app.get("/user/:id/json", async (req,res) =>{

    const json = await redis.get(`user:${req.params.id}:json`);

    res.json({
        user : json ? JSON.parse(json) : null
    })

})


app.post("/user/:id/hash", async (req,res) =>{
    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({
        savedAs : "hash"
    })
})

app.get("/user/:id/hash", async (req,res) =>{
    const hash = await redis.hgetall(`user:${req.params.id}:hash`);
    res.json({
        user : hash
    })
})

app.listen(3000, ()=>{
    console.log("server running on port 3000!")
})