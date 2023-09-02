import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import { User } from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import {Course} from "../model/course.js"
import crypto from "crypto"
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/dataUri.js";
import {Stats} from "../model/stats.js"


// register:-----------------
export const register =catchAsyncError(async(req,res,next)=>{
const {name, email, password}=req.body;


if(!name || !email || !password) return next(new ErrorHandler("please Enter all field",400));

//check if user already exist in database
let user =await User.findOne({email})
if(user) return next(new ErrorHandler("user already exist",409))

//upload file :-
const file  = req.file;
const fileUri = getDataUri(file);
const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name, email, password, avatar:{
            public_id:myCloud.public_id,
            url: myCloud.secure_url,
        }
    });
sendToken(res, user, "Registered Successfully",201)
});
// login :--------------------
export const login =catchAsyncError(async(req,res,next)=>{
const { email, password}=req.body;

console.log(email,password)

if(!email || !password) return next(new ErrorHandler("please Enter all field",400));

//check if user already exist in databasec
const user =await User.findOne({email}).select("+password");
if(!user) return next(new ErrorHandler("user doesnot exist",401))

const isMatch = await user.comparePassword(password);
if(!isMatch) return next(new ErrorHandler("Incorrect Password",400))


    sendToken(res, user, `welcome back ${user.name}`,200)
});

// logout :----------------
export const logout =catchAsyncError(async(req,res,next)=>{

res.status(200).cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly : true, //to prevent the client from accessing it directly in the browser
secure:true,
sameSite : true,
}).json({
    success:true,
    message:"logout successfully"
})
});


export const getMyProfle =catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    res.status(200).json({
    success :true,
    user,
    })

});

export const changePassword =catchAsyncError(async(req, res, next)=>{
  const {oldPassword, newPassword} =req.body;
  if(!oldPassword || !newPassword) return next(new ErrorHandler("please enter all the fields",400));
  // check old passowrd match with db password or not
  const user= await User.findById(req.user._id).select("+password")
  const isMatch = await user.comparePassword(oldPassword);
  //isMatch function return error at find no matching password
if(!isMatch) return next(new ErrorHandler("Incorrect Old Password",400));

//save new password into user's password
user.password = newPassword;

await user.save();
res.status(200).json({
    success: true ,
    message :"passwod changed succesfully ",
})})

//update profile:- update name, email
export const updateProfile =catchAsyncError(async(req, res, next)=>{
  const {name, email} =req.body;

  const user = await User.findById(req.user._id)
    if (name) user.name = name;
    if (email) user.email = email;
await user.save();
res.status(200).json({
    success: true ,
    message :"profile updated succesfully ",
})})

//update profile picture: -------------------

export const updateProfilePicture =catchAsyncError(async(req, res, next)=>{

    const user= await User.findById(req.user._id)
    // cloudinary and multer
const file  = req.file;
const fileUri = getDataUri(file);
const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

await cloudinary.v2.uploader.destroy(user.avatar.public_id);

user.avatar = {
    public_id:myCloud.public_id,
    url :myCloud.secure_url,
}

await user.save();
res.status(200).json({
    success: true ,
    message :"profile picture updated succesfully ",
})})



// forget password :------------------------ 
export const forgetPassword =catchAsyncError(async(req, res, next)=>{
    //grab email from request of body:
const{email}=req.body;
// finding email from User model
const user = await User.findOne({email});
// if user doesnot exist error pass
if(!user) return next( new ErrorHandler(" User not found ",400));

// reset token pass from usermodel getresettoken method
const resetToken = await user.getResetToken();
// save user's reset token
await user.save();


const url =`${process.env.Frontend_URL}/resetPassword/${resetToken}`
    const message = `click on the link to reset your password.${url} if you are not have request than please ignore`
// sendtoken via email : 
await sendEmail(user.email,"coursebundler reset password",message)
res.status(200).json({
    success: true ,
    message :`Reset token has been sent to ${user.email} `,
})})


//reset password  : ------------------------ 
export const resetPassword =catchAsyncError(async(req, res, next)=>{
const {token} = req.params;

const resetPasswordToken = crypto
.createHash("sha256")
.update(token)
.digest("hex");

const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{
        $gt: Date.now(),
    }, 
})

if(!user) return next(new ErrorHandler("Invalid token or has been expired"));

user.password = req.body.password;

user.resetPasswordToken=undefined;
user.resetPasswordExpire= undefined;
await user.save();

res.status(200).json({
    success: true ,
    message :"Password Changed Succesfully ",
})})

//add to playlist route:-----------

export const addToPlaylist =catchAsyncError(async(req,res,next)=>{
   const user= await User.findById(req.user._id);
   const course = await Course.findById(req.body.id);
   if (!user)return next(new ErrorHandler("invalid course id",404));
const itemExist = user.playlist.find((item)=>{
if(item.course.toString() === course._id.toString()) return true;
})

   if(itemExist) return next(new ErrorHandler("Item already Exist",409))
   user.playlist.push({
    course:course._id,
    poster:course.poster.url,
   });
   await user.save();

   res.status(200).json({
    success:true,
    message:"Added to playlist successfully"
   })
})

// remove from playlist :- 

export const removeFromPlaylist =catchAsyncError(async(req,res,next)=>{
 

    const user = await User.findById(req.user._id);
    const course = await  Course.findById(req.query.id);
    if(!course) return next(new ErrorHandler("Invalid Course Id",404));
    const newPlaylist = user.playlist.filter(item =>{
        if(item.course.toString()!==course._id.toString()) return item;
    }
    );

    user.playlist = newPlaylist;
    await user.save();

    res.status(200).json({
        success:true,
        message:"Removed from playlist"
    })
});
//admin routes:---------------------------------------------------------
//get all users:
export const getAllUsers =catchAsyncError(async(req, res, next)=>{
    const users =await User.find({});

    res.status(200).json({
        success:true,
        users,    })
})

//update users role into user to admin 
export const updateUserRole =catchAsyncError(async(req, res, next)=>{
    const user =await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("user not found",404));

    // updation user to admin
    if(user.role === "user") user.role="admin";
    else user.role = "user";
//save users info
    await user.save()
    res.status(200).json({
        success:true,
        message:"role changed successfully",    })
});

export const deleteUser = catchAsyncError(async(req, res, next)=>{
    const user =await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("user not found",404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

//Cancel substcription
    await user.deleteOne()
    res.status(200).json({
        success:true,
        message:"User Deleted successfully",    })
});

// delete My Profile:--------
export const deleteMyProfile = catchAsyncError(async(req, res, next)=>{

    const user=await User.findById(req.user._id);

if(!user) return next (new ErrorHandler("No such profile exist",401));

await cloudinary.v2.uploader.destroy(user.avatar.public_id);
//cancel subscription:


await user.deleteOne();

res.status(200).cookie("token",null,{
    expires: new Date(Date.now())})
    .json({
    success:true,
    message:'profile deleted successfully', 
    })
});


User.watch().on("change",async()=>{
    const stats= await Stats.find({}).sort({createdAt:"desc"}).limit(1)

    const subscription = await User.find({"subscription.status":"active"});

    stats[0].user = await User.countDocuments(),
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save()


})

