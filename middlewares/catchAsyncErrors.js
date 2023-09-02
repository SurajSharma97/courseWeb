export const catchAsyncError =(passedfunction)=>{
return  (req,res,next)=>{
    Promise.resolve(passedfunction(req,res, next)).catch(next);

}
}