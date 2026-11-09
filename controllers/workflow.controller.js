import { createRequire } from 'module';
import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js'
const require = createRequire(import.meta.url);

const REMINDERS = [7, 5, 2, 1];

const { serve } = require("@upstash/workflow/express");


export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);
    if (!subscription || subscription.status != "active") return;
    const renewalDate = dayjs(subscription.renewalDate);
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId} stopping the workflow`);
        return;
    }
    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        // Only trigger if today is the reminder day
        if (dayjs().isSame(reminderDate, 'day')) {
            await triggerReminder(context, `Reminder ${daysBefore} days before`);
        }
    }
})
const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return await Subscription.findById(subscriptionId).populate('user', 'name email').lean();
        //lean() this tells mongoose to return a plain lightweight javascript object instead of a heaveyweight mongoose documnet with databse client reference
    })
}
const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}
const triggerReminder = async (context, label, date) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`);
        //we can send the reminders as email or push notifications or sms what i would like to do is i want to sent the noti
        //in the form of email for 1day to go to expire 
        //push notifications of r 7 ot 5 days to go 

    })
}
