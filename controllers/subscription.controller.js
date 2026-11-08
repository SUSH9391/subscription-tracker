import Subscription from "../models/subscription.model.js";
export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscription = await Subscription.find().populate('user', 'name email');
        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (e) {
        next(e);
    }
}
export const getSubscriptionDetails = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Suspcription not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ success: true, data: subscription })
    } catch (e) {
        next(e);
    }
}
export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,

        });
        res.status(201).json({ sucess: true, data: subscription })
    } catch (e) {
        next(e);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user.id != req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }
        const subscription = await Subscription.find({ user: req.params.id });
        res.status(200).json({ success: true, data: subscription });
    } catch (e) {
        next(e);
    }
}