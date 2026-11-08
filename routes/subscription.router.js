import { Router } from "express";
import { createSubscription, getAllSubscriptions, getUserSubscriptions, getSubscriptionDetails } from "../controllers/subscription.controller.js";
import authorize from '../middlewares/auth.middleware.js';
const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, getAllSubscriptions);

subscriptionRouter.get("/:id", authorize, getSubscriptionDetails);

subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.put("/:id");

subscriptionRouter.delete("/:id", (req, res) => res.send({
    title: 'delete subscriptions',
}))

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions)

subscriptionRouter.put("/:id/cancle", (req, res) => res.send({
    title: 'Cancel subscriptions',
}))

subscriptionRouter.get("/upcoming-renewals", (req, res) => res.send({
    title: 'Get upcoming renewals',
}))

export default subscriptionRouter;