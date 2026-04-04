import dotenv from 'dotenv';
import path from 'path';

// Force load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("INTERNAL DIAGNOSTIC:");
console.log("DELHIVERY_API_TOKEN from process.env:", process.env.DELHIVERY_API_TOKEN ? "FOUND" : "NOT FOUND");
if (process.env.DELHIVERY_API_TOKEN) {
    console.log("Token length:", process.env.DELHIVERY_API_TOKEN.length);
    console.log("Token starts with:", process.env.DELHIVERY_API_TOKEN.substring(0, 4));
}

// Check how the service would see it
import { delhiveryService } from './services/delhivery.service';
const headers = (delhiveryService as any).getHeaders();
console.log("Generated Headers:", JSON.stringify(headers, null, 2));
