import DataUriParser from "datauri/parser.js";
import path, { extname } from "path";


export const getDataUri = (file) =>{

    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    console.log(extname)
    const fileParser=    parser.format(extName,file.buffer)
 return fileParser;
}
