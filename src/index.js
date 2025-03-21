import mongoose from "mongoose";
import {DB_NAME} from './constants.js';
import connectDB from "./db/index.js";
import dotenv from 'dotenv';
dotenv.config({
    path:'../.env'
});

connectDB();

// ;( async () => {
//     try {
//         mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }) ()