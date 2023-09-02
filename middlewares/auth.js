import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../model/userModel.js";

export const isAuthenticated =catchAsyncError(async(req, res, next)=>{
    //token from request of cookies
    const {token}=req.cookies;

    // if there is not token generated this error return to login 
    if(!token) return next(new ErrorHandler("please login ",401));

    // jsonwebtoken verify method use to decode via its jwt secret into id
    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    // after finding users decoded id store in request.user
    req.user= await User.findById(decoded._id)
    //next for error and other method
    next()

})

export const autherizedAdmin =(req, res, next)=>{
    if(req.user.role !== "admin")
     return next(
    new ErrorHandler(`${req.user.role} is not allowed to access this resource`,403))

    next();
};

export const autherizedSubscribers =(req, res, next)=>{
    if(req.user.subscription.status !== "active" && req.user.role !== "admin")
     return next(
    new ErrorHandler(`only subscribers can access this resource`,403))

    next();
};
