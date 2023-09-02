import  Express  from "express";
import dotenv from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config({
    path:"./config/config.env"
})

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({
    extended:true,
}))
app.use(cookieParser());
app.use(cors({
    origin:process.env.Frontend_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
}))





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
app.get("/",(req,res)=>{
res.send(`<h1> hello world! Site is working. click <a href=${process.env.Frontend_URL}>here</a> to visit frontend. </h1>`)
})

app.use(ErrorMiddleware);