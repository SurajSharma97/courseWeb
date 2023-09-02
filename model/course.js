import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
 title:{
    type:String,
    required :[true, "please enter course title "],
    minlength :[4,"title must be at least 4 characters"],
    maxlength : [80 , "title must be at most 8 character"], 
 },
 description:{
   type: String,
   required:[true,"please enter course title"],
   minlength : [4,"title must be at least 20 character"],
  

 },
 lectures:[{
    title :{
        type: String,
        required : true,
    },
    description:{
        type:String,
        required : true,

    },
    video : {
      public_id:{
         type:String,
         required : true,
      },
      url :{
            type:String,
            required : true,
        }
    },
 }],
 poster:{
    public_id : {
        type:String,
        required : true,
    },
    url:{
        type:String,
        required : true,
    },
 },

 views :{
    type:Number, 
    default:0
 },
 numOfVideos :{
    type:Number, 
    default:0
 },
 category:{
    type:String, 
    required: true,
 },
 createdBy:{
    type:String, 
    required: [true, "please enter creator name"]
 },
 createdAt:{
    type:Date,
    default: Date.now()
 }
});

export const Course = mongoose.model("course",courseSchema)