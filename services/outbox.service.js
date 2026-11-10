import Outbox from '../models/outbox.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';

const MAX_ATTEMPTS = 3;

export const processOutboxMessages = async () => {
    // 1. Find up to 10 pending events
    const messages = await Outbox.find({ status: 'PENDING' })
        .sort({ createdAt: 1 })
        .limit(10);

    if (messages.length === 0) return;

    for (const message of messages) {
        try {
            message.status = 'PROCESSING';
            message.attempts += 1;
            await message.save();

            if (message.type === 'START_REMINDER_WORKFLOW') {
                await workflowClient.trigger({
                    url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                    body: { subscriptionId: message.payload.subscriptionId },
                    headers: { 'content-type': 'application/json' },
                    retries: 0,
                });
            }

            // 2. Mark as completed
            message.status = 'COMPLETED';
            await message.save();
            console.log(`[Outbox] Successfully processed event: ${message._id}`);

        } catch (error) {
            console.error(`[Outbox] Failed to process event ${message._id}:`, error.message);
            message.error = error.message;

            // 3. If exceeded max attempts mark as FAILED, otherwise return to PENDING for retry
            if (message.attempts >= MAX_ATTEMPTS) {
                message.status = 'FAILED';
            } else {
                message.status = 'PENDING';
            }
            await message.save();
        }
    }
};