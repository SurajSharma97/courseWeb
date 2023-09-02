import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import { User}  from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import {Payment }from "../model/payment.js"

export const buySubscription =catchAsyncError(async(req, res, next)=>{

    const user = await User.findById(req.user._id);
    // console.log("User", req)
    if(user.role === "admin") return next(new ErrorHandler("Already subscribed",404));
    
    const planId = process.env.RAZOR_PLAN_ID || "plan_MD9gu8ajnB2Wb7";


   const subscription = await instance.subscriptions.create({
        plan_id : planId,
        customer_notify :1,
        total_count : 12,
    })
    console.log(subscription)

    user.subscription.id=subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(201).json({
        success:true,
        subscriptionId:subscription.id,
        message : `Your Subscription has been created successfully`,

    })

});


export const paymentVerification =catchAsyncError(async(req, res, next)=>{

    const {
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature} = req.body;

    const user= await User.findById(req.user._id);
    const subscription_id = user.subscription.id;

    const generated_Signature = crypto.createHmac("sha256",
    process.env.RAZOR_SECRET)
    .update(razorpay_payment_id ,"|",subscription_id,"utf-8")
    .digest("hex");

    const isAuthentic = generated_Signature===razorpay_signature;
    if(!isAuthentic) return res.redirect(`${process.env.Frontend_URL}/paymentFailed`)

//database comes here
await Payment.create({
    razorpay_payment_id,
    razorpay_subscription_id,
        razorpay_signature

});

user.subscription.status="active";

await user.save();

res.redirect(`${process.env.Frontend_URL}/paymentSuccess?reference=${razorpay_payment_id}`)
})


export const getRazorPay = catchAsyncError(async(req, res, next)=>{
    res.status(200).json({
        success:true,
        key:process.env.RAZOR_KEY
    })
})

export const cancelSubscribe = catchAsyncError(async(req, res, next)=>{
  
    const user =await User.findById(req.user._id);

  const subscriptionId = user.subscription.id
  
  let refund = false;
  await instance.subscriptions.cancel(subscriptionId);

  const payment = await Payment.findOne({
    razorpay_subscription_id : subscriptionId
  });

  const gap = Date.now()-payment.createdAt;
   const refundTime = process.env.refund_Days*24*60*60*1000;

   if (refundTime>gap) {
    await instance.payments.refund(payment.razorpay_payment_id);
    refund =true;
   }

   await payment.remove();
   user.subscription.id = undefined;
   user.subscription.status = undefined;


   await user.save();
  
  res.status(200).json({
        success:true,
        message:refund?"subcription cancelled , you will recieve full refund within 7 days." : "subscription cancelled, now refund intiated as subscription cancelled after 7 days."
    })
})