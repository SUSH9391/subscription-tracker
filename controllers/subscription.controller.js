import mongoose from "mongoose";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";
import Subscription from "../models/subscription.model.js";
import Outbox from "../models/outbox.model.js";
// GET ALL SUBSCRIPTIONS
export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find().populate('user', 'name email');
        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (e) {
        next(e);
    }
};

// GET SUBSCRIPTION DETAILS BY ID
export const getSubscriptionDetails = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('user', 'name email');

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user._id.toString() !== req.user._id.toString()) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (e) {
        next(e);
    }
};

// CREATE NEW SUBSCRIPTION
export const createSubscription = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // 1. Create the subscription inside the transaction
        const [subscription] = await Subscription.create(
            [{ ...req.body, user: req.user._id }],
            { session }
        );
        // 2. Insert outbox event in the SAME transaction
        await Outbox.create(
            [{
                type: 'START_REMINDER_WORKFLOW',
                payload: { subscriptionId: subscription._id },
                status: 'PENDING',
            }],
            { session }
        );
        // 3. Commit both writes together
        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription,
        });
    } catch (e) {
        await session.abortTransaction();
        next(e);
    } finally {
        session.endSession();
    }
};

// GET ALL SUBSCRIPTIONS FOR A SPECIFIC USER
export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.statusCode = 401;
            throw error;
        }
        const subscriptions = await Subscription.find({ user: req.params.id });
        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
};

// UPDATE SUBSCRIPTION
export const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('You are not the owner of this subscription');
            error.statusCode = 403;
            throw error;
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: updatedSubscription
        });
    } catch (e) {
        next(e);
    }
};

// DELETE SUBSCRIPTION
export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('You are not the owner of this subscription');
            error.statusCode = 403;
            throw error;
        }

        await Subscription.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
        });
    } catch (e) {
        next(e);
    }
};

// CANCEL SUBSCRIPTION
export const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('You are not the owner of this subscription');
            error.statusCode = 403;
            throw error;
        }

        subscription.status = 'inactive';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription
        });
    } catch (e) {
        next(e);
    }
};

// GET UPCOMING RENEWALS (Next 30 days)
export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const subscriptions = await Subscription.find({
            user: req.user._id,
            status: 'active',
            renewalDate: { $gte: now, $lte: thirtyDaysFromNow }
        }).sort({ renewalDate: 1 });

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (e) {
        next(e);
    }
};
