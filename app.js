import express from 'express';
import {PORT} from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.router.js';
import {connectToMongoDB} from "./database/mongodb.js";

const app = express();
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscriptions',subscriptionRouter);
app.get('/', (req,res)=>{
    res.send('Hello World!');
});
app.listen(PORT, async ()=>{
    console.log(`Subscription tracker API is running on http://localhost:${PORT}`)});
    await connectToMongoDB();
export default app;