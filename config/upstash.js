import { Client as WorkflowClient } from '@upstash/workflow'; // ✅ Capital 'W' for the Class
import { QSTASH_TOKEN, QSTASH_URL } from './env.js';

export const workflowClient = new WorkflowClient({ // ✅ Lowercase 'w' for the instance
    baseUrl: QSTASH_URL,
    token: QSTASH_TOKEN,
});