import { MongoClient } from 'mongodb';
import dns from 'dns';
import {DB_URI} from '../config/env.js';

// Override DNS servers to fix ECONNREFUSED on SRV lookups with some network configs
dns.setServers(['8.8.8.8', '1.1.1.1']);
if (!DB_URI){
    throw new Error('Please define the MONGODB_URI environment variable inside .env.<development/production>.local')
}
const client = new MongoClient(DB_URI);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");

        return client;
    } catch (err) {
        console.dir(err);
        throw err;
    }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
    await client.close();
}
