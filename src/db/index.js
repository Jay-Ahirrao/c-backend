import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
})

console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log("DB_NAME:", DB_NAME);

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
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