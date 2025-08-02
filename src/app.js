import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin :process.env.CORS_ORIGIN ,
    credentials:true
}))

app.use(express.json({limit:"10mb"}));
app.use(urlencoded({extended:true,limit:"10mb"}));
app.use(express.static("/public/temp"));
app.use(cookieParser());


//Router Import
import userRouter from './routes/user.routes.js';

//Router Paths 
app.use("/api/v1/users", userRouter)

export default app;