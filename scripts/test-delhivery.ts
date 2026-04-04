import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local BEFORE importing services
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { delhiveryService } from '../services/delhivery.service';

async function verifyDelhivery() {
    console.log('--- Testing Delhivery API ---');
    console.log('Token Loaded:', process.env.DELHIVERY_API_TOKEN ? 'YES' : 'NO');

    const testPincode = '110001';
    console.log(`Checking serviceability for ${testPincode}...`);
    try {
        const result = await delhiveryService.checkServiceability(testPincode);
        console.log(`Serviceability Result for ${testPincode}:`, JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Error checking serviceability:', error.message);
    }

    console.log('Calculating shipping cost for 110001 to 400001 (500g)...');
    try {
        const cost = await delhiveryService.calculateShippingCost('400001', 500, '110001');
        console.log('Calculated Cost:', cost);
    } catch (error: any) {
        console.error('Error calculating cost:', error.message);
    }

    console.log('--- Verification Complete ---');
}

verifyDelhivery();
