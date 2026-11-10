import { Router } from "express";
import {
    createSubscription,
    getAllSubscriptions,
    getUserSubscriptions,
    getSubscriptionDetails,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    getUpcomingRenewals,
} from "../controllers/subscription.controller.js";
import authorize from '../middlewares/auth.middleware.js';

const subscriptionRouter = Router();

// 1. General list and creation
subscriptionRouter.get("/", authorize, getAllSubscriptions);
subscriptionRouter.post("/", authorize, createSubscription);

// 2. Specific routes (MUST be defined before /:id)
subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

// 3. Dynamic /:id routes
subscriptionRouter.get("/:id", authorize, getSubscriptionDetails);
subscriptionRouter.put("/:id", authorize, updateSubscription);
subscriptionRouter.delete("/:id", authorize, deleteSubscription);

// 4. Cancellation (supports both /cancel and /cancle for typo tolerance)
subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);
subscriptionRouter.put("/:id/cancle", authorize, cancelSubscription);

export default subscriptionRouter;
