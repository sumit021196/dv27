export interface ServiceabilityResponse {
    serviceable: boolean;
    estimated_delivery?: string;
    shipping_cost?: number;
    error?: string;
}

export class DeliveryOneService {
    private apiToken: string | undefined;

    constructor() {
        this.apiToken = process.env.DELHIVERY_API_TOKEN;
    }

    async checkServiceability(pincode: string, weight: number = 500): Promise<ServiceabilityResponse> {
        // Validation for pincode format (6 digits for India)
        if (!/^\d{6}$/.test(pincode)) {
            return { serviceable: false, error: "Invalid Pin Code format" };
        }

        // Mock implementation for development
        // In a real scenario, this would call Delhivery One / DPD API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Logic for mock:
                // 1. Pincodes starting with '0' are non-serviceable
                // 2. Shipping cost depends on weight
                if (pincode.startsWith('0')) {
                    resolve({ serviceable: false, error: "Area not serviceable" });
                } else {
                    const cost = weight > 1000 ? 150 : 80;
                    const date = new Date();
                    date.setDate(date.getDate() + 3); // Standard 3-day delivery
                    
                    resolve({
                        serviceable: true,
                        estimated_delivery: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                        shipping_cost: cost
                    });
                }
            }, 800);
        });
    }

    async createShipment(orderId: string, details: any) {
        // Placeholder for actual shipment creation API call
        console.log(`Creating shipment for order ${orderId} via DeliveryOne`);
        return { success: true, tracking_id: `DVONE-${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
    }
}

export const deliveryOneService = new DeliveryOneService();
