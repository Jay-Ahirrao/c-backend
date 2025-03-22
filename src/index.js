import mongoose from "mongoose";
import {DB_NAME} from './constants.js';
import connectDB from "./db/index.js";
import dotenv from 'dotenv';
dotenv.config({
    path:'../.env'
});

connectDB()
.then(() => {

    app.on((err)=>{
        console.log("Error in starting server !!!",err);
        throw err;
    })
    app.listen(process.env.PORT || 8008 ,() => {
        console.log(`Server is running on port ${process.env.PORT || 8008} !!!`)
    })
})
.catch((error)=>{
    console.log("Connection Failed to MONGODB !!!",error);
})

