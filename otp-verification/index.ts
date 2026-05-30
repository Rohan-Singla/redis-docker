import express from 'express'
import Redis from 'ioredis';


const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otp_key (phone : number){

    return `otp:${phone}`

}

app.post("/otp",async (req,res) => {

    const { phone } = req.body;
    
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const result = await redis.set(otp_key(phone), otp, 'EX', 30); // valid for 30 seconds


    
    res.json({
        otp : otp,
        result
    })

})

app.post("/verify",async(req,res) => {

    const {phone , otp } = req.body;

    const savedOtp  = redis.get(otp_key(phone));

    if(!savedOtp){
        return res.status(400).send({
            message : "OTP expired or not found !!"
        })
    }

    if(!savedOtp != otp){
        return res.status(400).send({
            message : "Wrong OTP"
        })
    }


    await redis.del(otp_key(phone));

    return res.send({
        message : "OTP verified succesfully"
    })


})

app.get('/otp/:phone/ttl',async (req,res) => {

    const ttl = await redis.ttl(otp_key(Number(req.params.phone)));

     res.json({
        ttl : ttl
     })

})

app.listen(3000,()=>{
    console.log("server running on port 3000")
})