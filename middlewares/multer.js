import multer from "multer";
//memory storage removes the uploaded file after its execution
const storage = multer.memoryStorage();

export const singleUpload = multer({
    storage: storage, //setting up memory storage for uploading files to server
}).single("file")