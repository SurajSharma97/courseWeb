import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodecron from "node-cron";
import { Stats } from "./model/stats.js";




connectDB();




cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
})

export const instance = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET,
  });


nodecron.schedule(" * * * 1 * *", async()=>{
try{
    await Stats.create({});

}catch(err){
console.log(err)
};

});

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port:${process.env.PORT}`);
})


