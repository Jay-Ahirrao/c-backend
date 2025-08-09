import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config()
console.log(`MONGODB_URI:", "mongodb+srv://jay:jay%40123@cluster0.fzj4c.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`);
console.log("DB_NAME:", DB_NAME);

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://jay:jay%40123@cluster0.fzj4c.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
        console.log("Database connected successfully");
        console.log( `Database connected on ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
    }
    catch (error) {
        console.log("[DB INDEX.JS] Connection Failed to MONGODB !!!",error);
        process.exit(1);        
    }
}

export default connectDB;