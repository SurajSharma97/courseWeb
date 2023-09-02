import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import crypto from "crypto"

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:["please enter your name"],
},

email:{
    type:String,
    required:["please enter your email"],
    unique:true,
    validate:validator.isEmail,
},
password:{
    type:String,
    required:[true, "please enter a password"],
    minLength:[6,"password must be at least six characters"],
    select: false,
},
role:{
    type:String,
    enum:["admin", "user"],
   default :"user",
},
subscription:{
    id:String,
    status:String,
},
avatar:{
    public_id:{
        type: String,
        required:true,
    }
},
playlist:[{
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    poster:String,
    createdAt:{
        type: Date,
        default:Date.now(),
    },
}],
resetPasswordToken :String,
resetPasswordExpire:String
});

userSchema.pre("save",async function(next){
if(!this.isModified("password")) return next();
  const hashedPassword=  await bcrypt.hash(this.password,10);
  this.password=hashedPassword;
  next();
})

userSchema.methods.getJWTToken=function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET,{
        expiresIn:"5d"
    })
}

userSchema.methods.comparePassword=async function (password){
    console.log(this.password)
    return await bcrypt.compare(password,this.password) 
}


userSchema.methods.getResetToken= function(){
    //storing token into string type character to resetpassword through this token
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    //saving the time of creation in database

this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

    return resetToken;
}

export const User= mongoose.model("User",userSchema)