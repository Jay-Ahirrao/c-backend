import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config()

console.log("[DB INDEX.JS] DB_NAME:", DB_NAME);

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`[DB INDEX.JS] DATABASE SUCCESSFULLY CONNECTED ON ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
    }
    catch (error) {
        console.log("[DB INDEX.JS] Connection Failed to MONGODB !!!",error);
        process.exit(1);        
    }
}

export default connectDB;