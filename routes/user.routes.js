import { Router } from 'express';
import { getUsers, getUser } from '../controllers/user.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req, res) => {
    res.send({ title: 'Create new user' });
})

userRouter.put('/:id', (req, res) => {
    res.send({ title: 'update user' });
})

userRouter.delete('/', (req, res) => {
    res.send({ title: 'Delete user' });
})
export default userRouter;