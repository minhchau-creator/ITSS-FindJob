//kết nối với database
import mongoose from "mongoose";
export const connect = async (): Promise<void> =>{
    try{
        const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ITSS2";
        await mongoose.connect(mongoUrl);
        const dbName = mongoose.connection.name;
        console.log(`Kết nối thành công tới database: ${dbName}`);
    }
    catch(error){
        console.log("Kết nối thất bại!", error);
    }
};