import mongoose from 'mongoose';
import dns from 'dns';
import { DB_URI } from '../config/env.js';

// Override DNS servers to fix ECONNREFUSED on SRV lookups with some network configs
dns.setServers(['8.8.8.8', '1.1.1.1']);

if (!DB_URI) {
    throw new Error('Please define the DB_URI environment variable inside .env.<development/production>.local');
}

export async function connectToMongoDB() {
    try {
        await mongoose.connect(DB_URI);
        console.log("Successfully connected to MongoDB via Mongoose!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
    await mongoose.disconnect();
}
