import express from 'express';
import Redis from 'ioredis';
import mongoose, { mongo } from 'mongoose';

const app = express();

const redis =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const banner_key = "app:banner";

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

// site banner

app.post("/banner" , async (req,res) => {
    await redis.set(banner_key,req.body.message);


    res.send({
        success : true
    })
})

app.get("/banner" , async (req,res) => {

    const result = await redis.get(banner_key);


    res.send({
        message : result
    })
})


app.delete("/banner" , async (req,res) => {

    const result = await redis.del(banner_key);


    res.send({
        sucess : true
    })
})


app.get("/banner/exists" , async (req,res) => {

    const result = await redis.exists(banner_key);


    res.send({
        exists : Boolean(result)
    })
})



app.listen(3000, ()=>{
    console.log("server running on port 3000!")
})