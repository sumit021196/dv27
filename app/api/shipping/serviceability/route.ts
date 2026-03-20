import { NextRequest, NextResponse } from 'next/server';
import { deliveryOneService } from '@/services/deliveryone.service';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
        return NextResponse.json({ serviceable: false, error: "Pincode is required" }, { status: 400 });
    }

    try {
        const result = await deliveryOneService.checkServiceability(pincode);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('API Serviceability Error:', error.message);
        return NextResponse.json({ 
            serviceable: false, 
            error: "Failed to check serviceability server-side" 
        }, { status: 500 });
    }
}
