import { Job, Worker } from "bullmq";
import {connection} from './queue'

const email_worker = new Worker(
    "emails",
    async (job: Job) => {
        console.log("processing email log", job.id, job.name, job.data);
        await new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
        console.log("email job completed!");
    },
    {connection}
);

email_worker.on("completed",(job)=>{
    console.log("Job completed !", job.id,job.name,job.data)
})

email_worker.on("failed",(job)=>{
    console.log("Job completed !", job?.id,job?.name,job?.data)
})