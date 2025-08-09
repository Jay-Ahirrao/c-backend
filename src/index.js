import mongoose from "mongoose";
import {DB_NAME} from './constants.js';
import connectDB from "./db/index.js";
import dotenv from 'dotenv';
import app from './app.js';
dotenv.config({
    path:'../.env'
});

connectDB()
.then(() => {
    app.on('error', (err)=>{
        console.log("Error in starting server !!!",err);
        throw err;
    })
    app.listen(process.env.PORT || 8008 ,() => {
        console.log(`[MAIN INDEX.JS]Server is running on port ${process.env.PORT || 8008} !!!`)
    })
})
.catch((error)=>{
    console.log("Connection Failed to MONGODB !!!",error);
})

