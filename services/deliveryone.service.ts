import { delhiveryService } from './delhivery.service';

export interface ServiceabilityResponse {
    serviceable: boolean;
    estimated_delivery?: string;
    shipping_cost?: number;
    error?: string;
}

export class DeliveryOneService {
    async checkServiceability(pincode: string, weight: number = 500): Promise<ServiceabilityResponse> {
        // Validation for pincode format (6 digits for India)
        if (!/^\d{6}$/.test(pincode)) {
            return { serviceable: false, error: "Invalid Pin Code format" };
        }

        // Use the actual DelhiveryService
        const response = await delhiveryService.checkServiceability(pincode);
        if (response.serviceable) {
            response.shipping_cost = await delhiveryService.calculateShippingCost(pincode, weight);
        }
        return response;
    }

    async createShipment(orderId: string, details: any) {
        // Placeholder for actual shipment creation API call via DelhiveryService
        console.log(`Creating shipment for order ${orderId} via DelhiveryService`);
        try {
            const result = await delhiveryService.createShipment(details);
            return { success: true, tracking_id: result.waybill || result.shipment_id || "DV-" + orderId };
        } catch (error: any) {
            console.error('Shipment creation failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

export const deliveryOneService = new DeliveryOneService();
