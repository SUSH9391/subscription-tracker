
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// SIGNUP
export const signup = async (req, res, next) => {
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // Extract data from request body
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email }).session(session);

        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create(
            [{
                name,
                email,
                password: hashedPassword
            }],
            { session }
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Commit transaction
        await session.commitTransaction();

        // Never send hashed password to client
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: userResponse
            }
        });

    } catch (error) {

        if (session?.inTransaction()) {
            await session.abortTransaction();
        }

        next(error);

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};


// SIGNIN
export const signin = async (req, res, next) => {
    // TODO: Implement login logic
};


// SIGNOUT
export const signout = async (req, res, next) => {
    // TODO: Implement logout logic
};
