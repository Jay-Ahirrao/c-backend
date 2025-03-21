import mongoose from "mongoose";
import {DB_NAME} from '../constants.js';

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Database connected successfully");
        console.log( `Database connected on ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
        
        
    } catch (error) {
        console.log("Connection Failed to MONGODB !!!",error);
        process.exit(1);        
    }
}

export default connectDB;