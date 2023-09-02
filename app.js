import  Express  from "express";
import dotenv from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";

dotenv.config({
    path:"./config/config.env"
})

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({
    extended:true,
}))
app.use(cookieParser());



// importing routes : - 

import courseRouter from "./routes/courseRoute.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoute from "./routes/paymentRoute.js"
import otherRoute from "./routes/otherRoutes.js"

app.use("/api/v1",courseRouter);
app.use("/api/v1",userRoutes);
app.use("/api/v1",paymentRoute);
app.use("/api/v1",otherRoute);






export default app;

app.use(ErrorMiddleware);