import express from 'express';
import {PORT} from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.router.js';
import {connectToMongoDB} from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json()); //this helps json data send in data and api calls
app.use(express.urlencoded({ extended: false }));
//this helps us send form data sent via html forms in a simple format
app.use(cookieParser())
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscriptions',subscriptionRouter);
app.use(errorMiddleware)
app.get('/', (req,res)=>{
    res.send('Hello World!');
});
app.listen(PORT, async ()=>{
    console.log(`Subscription tracker API is running on http://localhost:${PORT}`)});
    await connectToMongoDB();
export default app;