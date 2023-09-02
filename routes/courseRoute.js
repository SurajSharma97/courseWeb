import express from "express";
import { createCourse, deleteCourse, deleteLecture, getAllCourse } from "../controller/courseControllelr.js";
import { singleUpload } from "../middlewares/multer.js";
import { addLecture, getCourseLecture } from "../controller/courseControllelr.js";
import { autherizedAdmin, autherizedSubscribers, isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.route("/courses").get(getAllCourse);

//admin protected routes:--------------
router.route("/createcourse")
.post(isAuthenticated,autherizedAdmin,singleUpload,createCourse);

router.route("/course/:id")
.get(isAuthenticated,autherizedSubscribers,getCourseLecture)
.post(isAuthenticated,autherizedAdmin,singleUpload,addLecture)
.delete(isAuthenticated,autherizedAdmin,deleteCourse);


router.route("/lecture").delete(isAuthenticated,autherizedAdmin,deleteLecture)

//subscriber routes:-------------

export default router;

