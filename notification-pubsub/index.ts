import express, { raw } from 'express';
import Redis from 'ioredis';

const app = express();

const redis =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const publisher =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post("/notifications",async (req,res) => {
    const payload = {
        title : req.body.title,
        createAt : new Date().toISOString()
    }

    const recievers = await publisher.publish("notificaitons",JSON.stringify(payload));

    return res.json({
        message : `Notification sent to ${recievers} subscribers`
    })

    
})

app.listen(3000, ()=>{
    console.log("server running on port 3000!")
})