import mongoose from "mongoose";
// what is the req body? req.body is an object containing data from the client  especially when we have (POST request)

export const signup  = async(req, res,next) => {
    const session = await mongoose.startSession();
    session.startTransaction();//atomic (all or nothing, nothing in between)

    try{
        // here will be the logic to create new user

        await session.commitTransaction();
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}
export const signin  = async(req, res,next) => {

}
export const signout  = async(req, res,next) => {

}