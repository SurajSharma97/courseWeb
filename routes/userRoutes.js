import  Express  from "express";
import { addToPlaylist,
    changePassword,
    forgetPassword,
    resetPassword,
    getMyProfle,
    register,
    login,
    logout,
    deleteUser,
    getAllUsers,
    updateProfile,
    updateUserRole,
    removeFromPlaylist,
    updateProfilePicture,
    deleteMyProfile,
    } from "../controller/userController.js";
import { autherizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
const router = Express.Router();

// register user:-
router.route("/register").post(singleUpload,register);




// logout :------------
router.route("/logout").get(logout);
// login :-----------
router.route("/login").post(login);

// getmyprofile :- isAuthenticated is using for give access with their id
router.route("/me").get(isAuthenticated,getMyProfle)

//deletmyprofile :- 
router.route("/me").delete(isAuthenticated,deleteMyProfile)
// change password : - change password to change old password into new password
router.route("/changePassword").put(isAuthenticated,changePassword)
router.route("/updateProfile").put(isAuthenticated,updateProfile)
router.route("/updateProfilePicture").put(isAuthenticated,singleUpload,updateProfilePicture)

router.route("/forgetPassword").post(forgetPassword)
router.route("/resetPassword/:token").put(resetPassword)
router.route("/addtoplaylist").post(isAuthenticated,addToPlaylist)
router.route("/removefromplaylist").delete(isAuthenticated,removeFromPlaylist)


//admin routes :-

router.route("/admin/users").get(isAuthenticated, autherizedAdmin, getAllUsers)
router.route("/admin/users/:id")
.put(isAuthenticated, autherizedAdmin, updateUserRole)
.delete(isAuthenticated, autherizedAdmin, deleteUser)
export default router;