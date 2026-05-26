//kết nối với database
import mongoose from "mongoose";
export const connect = async (): Promise<void> =>{
    try{
        const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ITSS2";
        await mongoose.connect(mongoUrl)
        console.log("Kết nối thành công!");
    }
    catch(error){
        console.log("Kết nối thất bại!", error);
    }
};