import Redis from "ioredis";

const subscriber =  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

subscriber.subscribe('notifications',(err)=>{

    if(err){
        console.log("error happened" , err.message);
    }

    console.log("subscribed succesfully!")

})


subscriber.on("message",(channel,message) => {
    console.log("recieved on " , channel , " : " , JSON.parse(message))
})