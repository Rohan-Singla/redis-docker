import express, { raw } from 'express';
import Redis from 'ioredis';

const app = express();

const redis =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const queue_key = "queue:emails";

app.post("/email",async (req,res) => {

    const job = {
        to : req.body.to,
        subject : req.body.subject,
        body : req.body.body,
        createdAt : new Date().toISOString()
    }

    await redis.lpush(queue_key,JSON.stringify(job));

    res.json({
        queued : true,
        job
    })

})

app.get("/emails/process-one",async (req ,res) => {
    const rawJob = await redis.rpop(queue_key);

    if(!rawJob){
        return res.json({
            message : "no jobs in the queue"
        })
    }

    const job = JSON.parse(rawJob);

    return res.json({
        message : "email sent",
        job
    })
})

app.listen(3000, ()=>{
    console.log("server running on port 3000!")
})