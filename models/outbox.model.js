import mongoose from 'mongoose';

const outboxSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['START_REMINDER_WORKFLOW'],
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
            default: 'PENDING',
            index: true,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        error: {
            type: String,
        },
    },
    { timestamps: true }
);

const Outbox = mongoose.model('Outbox', outboxSchema);
export default Outbox;