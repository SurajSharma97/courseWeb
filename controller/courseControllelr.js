import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import { Course } from "../model/course.js";
import { Stats } from "../model/stats.js";
import { getDataUri } from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// get all courses without lectures
export const getAllCourse = catchAsyncError(async (req, res, next) => {
 const keyword = req.query.keyword || "";
 const category = req.query.category || "";


  const courses = await Course.find({
    title:{
      $regex: keyword,
      $options:"i",
    },category:{
      $regex: category,
      $options:"i",
    },  }).select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});

// create course:----------

export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("please add all fields", 400));
  //file getting from request of file:-----
  const file = req.file;

  // get file dataUri----
  const fileUri = getDataUri(file);
  //file content uploaded into cloudinary
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  console.log(myCloud);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "course created successfully, You can add lectures now",
  });
});

// add lecture, delete course, getcourseDetails
// getcourselecture :-

export const getCourseLecture = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("course not found", 404));
  
  course.views += 1;

  await course.save();
  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

//upload lecture:----
//max videosize = 100MB free cloudinary

export const addLecture = catchAsyncError(async (req, res, next) => {
   const { id } = req.params;
   const { title, description } = req.body;
  const course = await Course.findById(id);
  if(!course){return next( new ErrorHandler('course doesnot exist',404))}

  if (!title || !description || !id)
    return next(new ErrorHandler("please fill the all fields ", 400));

  // cloudinary files sending file to the cloudinary
  const file = req.file;
  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content,{resource_type:"video"});

  course.lectures.push({
    title,
    description,
    video: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  // file upload:-

  course.numOfVideos = course.lectures.length;

  await course.save();
  res.status(200).json({
    success: true,
    message: "Lecture added in Course",
  });
});

// delete Course :--
export const deleteCourse = catchAsyncError(async (req, res, next) => {
const {id}=req.params;

 const course = await Course.findById(id);

 if (!course) return next(new ErrorHandler("course not found", 404));
   
 await cloudinary.v2.uploader.destroy(course.poster.public_id);
 
 for(let i=0; i<course.lectures.length; i++){
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
      resource_type:"video",}); }
   await course.deleteOne();
   res.status(200).json({
     success: true,
     message : "course deleted successfully"
   });
 });

 // delete Course :--
export const deleteLecture = catchAsyncError(async (req, res, next) => {
const {courseId,lectureId}=req.query;

const course = await Course.findById(courseId);

 if (!course) return next(new ErrorHandler("course not found", 404));
   
const lecture =course.lectures.find(item=>{
   if(item._id.toString()=== lectureId.toString())  return item;
});

await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
   resource_type:"video",});

course.lectures = course.lectures.filter(item=>{
   if(item._id.toString()!== lectureId.toString())  return item;
});
course.numOfVideos = course.lectures.length;

   await course.save();
   res.status(200).json({
     success: true,
     message : "Lecture deleted successfully"
   });
 });
//


Course.watch().on("change",async()=>{
  const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
  const courses = await Course.find({});
  
  let totalViews = 0;

  for( let i= 0 ; i<courses.length; i++ ){
  const course = courses[i];
  totalViews += course.views;
  }
  stats[0].views =totalViews;
  stats[0].createdAt=new Date(Date.now());

  await stats[0].save()
})