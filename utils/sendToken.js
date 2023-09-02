export const sendToken =(res, user, message,statusCode=200)=>{


const token = user.getJWTToken()

const options={
expires:new Date(Date.now()+ 5*24*60*60*1000),
httpOnly : true, //to prevent the client from accessing it directly in the browser
secure:false,
sameSite : true,
}

    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        message,
        user
    })
}