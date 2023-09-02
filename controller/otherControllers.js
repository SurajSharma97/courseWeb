import {catchAsyncError }from "../middlewares/catchAsyncErrors.js"
 import { Stats } from "../model/stats.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";



export const contact = catchAsyncError(async(req, res, next)=>{
    const {name, email, message}= req.body;

    if(!name || !email || !message) return next(new ErrorHandler("Please fill all the fields",404))
    
    const to =process.env.My_Mail;
    const subject="i am transferring some money to you";
    const text=`i am ${name} and my email is ${email}. my message is ${message}`
    await sendEmail(to, subject,text);
    res.status(200).json({
        success:true,
        message:"Your Message has been sent",
    })
});


export const courseRequest =catchAsyncError(async(req,res,next)=>{
    const {name, email, course}= req.body;
    if(!name || !email || !course) return next(new ErrorHandler("Please fill all the fields",404))
    
    const to =process.env.My_Mail;
    const subject="requesting for a course on courseweb";
    const text=`i am ${name} and my email is ${email}. my message is ${course}`
    await sendEmail(to, subject,text);
    res.status(200).json({
        success:true,
        message:"Your Request has been sent",
    })
});



export const getDashboard =catchAsyncError(async(req,res,next)=>{


    const stats = await Stats.find({}).sort({
        createdAt:"desc"}).limit(12);
 
        console.log(stats);
        const statsData = [];
        const requiredSize = 12-stats.length;

        for(let i=0; i<stats.length; i++){
            statsData.unshift(stats[i]);}


    for(let i=0;i<requiredSize;i++){
        statsData.unshift({
            user:0,
            subscription:0,
            views:0,
        });}


        const userCount = statsData[11].user;
        const viewsCount = statsData[11].views;
        const subscriptionCount = statsData[11].subscription;

        let userProfit = true, viewsProfit=true,subscriptionProfit = true;
        let userPercentage = 0, viewsPercentage=0,subscriptionPercentage = 0;
        
        if(statsData[10].user === 0) userPercentage = userCount *100;
        if(statsData[10].views === 0) viewsPercentage = viewsCount *100;
        if(statsData[10].subscription === 0) 
        subscriptionPercentage = subscriptionCount *100;
    else{
        const difference = {
            user: statsData[11].user - statsData[10].user,
            views : statsData[11].views - statsData[10].views,
            subscription : statsData[11].subscription - statsData[10].subscription
        };
        
        userPercentage = (difference.user  / statsData[10].user) * 100,
        viewsPercentage = (difference.views  / statsData[10].views) * 100,
        subscriptionPercentage = (difference.subscription  / statsData[10].subscription) * 100;
        
        if(userPercentage < 0 ) userProfit = false;
        if(viewsPercentage < 0 ) viewsProfit = false;
        if(subscriptionPercentage < 0 )  subscriptionProfit = false;
    };

    
    
    
    res.status(200).json({
        success:true,
        stats:statsData,
        userCount,
        viewsCount,
        subscriptionCount,
        subscriptionPercentage,userPercentage,viewsPercentage,
        subscriptionProfit,viewsProfit,userProfit
    })
    console.log(userCount,viewsCount,subscriptionCount)
})