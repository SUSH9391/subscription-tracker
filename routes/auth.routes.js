import {Router} from 'express';
import {signin, signup, signout} from '../controllers/auth.controller.js';
const authRouter = Router();
//PATH: /api/v1/auth/sign-up (POST)
authRouter.post('/sign-up', signup);

//Path :/api/v1/auth/sign-in (POST)
authRouter.post('/sign-in', signin);

//Path :/api/v1/auth/sign-out (post)
authRouter.post('/sign-out', signout)

export default authRouter;