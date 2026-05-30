import express, { raw } from 'express';
import Redis from 'ioredis';
import { emailQueue } from './queue';

const app = express();

const redis =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


app.get("/welcome-email",async (req ,res) => {
    
    emailQueue.add(
        "send_welcome_email",
        {
            to : req.body.to,
            name : req.body.name,
        },
        {
            attempts : 3,
            backoff : {
                type : "exponential",
                delay : 1000
            }
        }
    )

})

app.listen(3000, ()=>{
    console.log("server running on port 3000!")
})