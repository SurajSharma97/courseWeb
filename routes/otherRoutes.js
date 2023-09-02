import express from "express";
import { contact, courseRequest, getDashboard } from "../controller/otherControllers.js";
import {autherizedAdmin, isAuthenticated} from "../middlewares/auth.js"
const router = express.Router();


router.route("/contact").post(contact)
router.route("/courserequest").post(courseRequest)
router.route("/admin/stats").get(isAuthenticated,autherizedAdmin,getDashboard)



export default router;
