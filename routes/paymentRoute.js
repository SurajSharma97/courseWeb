import  Express  from "express";
import { buySubscription, cancelSubscribe, getRazorPay, paymentVerification } from "../controller/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { autherizedAdmin } from "../middlewares/auth.js";
 const router =Express.Router();


//buy subscription:
router.route("/subscribe").get(isAuthenticated,buySubscription);

// verify payment and save refreence in database:===
router.route("/paymentVerification").post(isAuthenticated,paymentVerification);

//get RazorPay key:-
router.route("/getRazorPayKey").get(getRazorPay)

//remove subscription 
router.route("/subscribe/cancel")
.delete(isAuthenticated, cancelSubscribe)

 export default router;
