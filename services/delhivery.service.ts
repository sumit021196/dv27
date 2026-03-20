import axios from 'axios';

export interface ServiceabilityResponse {
    serviceable: boolean;
    estimated_delivery?: string;
    shipping_cost?: number;
    error?: string;
}

export interface DelhiveryPincodeResponse {
    delivery_codes: Array<{
        postal_code: {
            pincode: number;
            district: string;
            state_code: string;
            is_surface?: string;
            is_express?: string;
            is_cod?: string;
            remark?: string;
            remarks?: string;
            city?: string;
            pre_paid?: string;
            cod?: string;
        };
    }>;
}

export class DelhiveryService {
    private apiToken: string | undefined;
    private baseUrl: string = 'https://track.delhivery.com';
    private pickupLocationName: string = 'Dinu waghade';

    constructor() {
        this.apiToken = process.env.DELHIVERY_API_TOKEN;
    }

    private getHeaders() {
        return {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Check if a pincode is serviceable by Delhivery.
     */
    async checkServiceability(pincode: string): Promise<ServiceabilityResponse> {
        if (!/^\d{6}$/.test(pincode)) {
            return { serviceable: false, error: "Invalid Pin Code format" };
        }

        try {
            const response = await axios.get(`${this.baseUrl}/c/api/pin-codes/json/`, {
                params: { filter_codes: pincode },
                headers: this.getHeaders()
            });

            const data = response.data as DelhiveryPincodeResponse;
            if (data.delivery_codes && data.delivery_codes.length > 0) {
                const pc = data.delivery_codes[0].postal_code;
                const remarkValue = pc.remark || pc.remarks || "";
                
                // Check specifically for Embargo status as per documentation
                if (remarkValue.toLowerCase() === 'embargo') {
                    return { 
                        serviceable: false, 
                        error: "Area under temporary embargo. No deliveries currently." 
                    };
                }

                // According to Delhivery Docs: blank remark means serviceable.
                // We also check for any valid service type (Express, Surface, Pre-paid, or COD)
                const hasServiceType = 
                    pc.is_express === 'Y' || 
                    pc.is_surface === 'Y' || 
                    pc.pre_paid === 'Y' || 
                    pc.cod === 'Y';
                
                if (remarkValue === "" && hasServiceType) {
                    return {
                        serviceable: true,
                        estimated_delivery: "Within 3-5 days"
                    };
                }

                return { 
                    serviceable: false, 
                    error: "Pincode not currently serviceable for B2C" 
                };
            }

            return { serviceable: false, error: "Pincode not found in Delhivery records" };
        } catch (error: any) {
            console.error('Delhivery Serviceability Error:', error.response?.data || error.message);
            return { serviceable: false, error: "Failed to check serviceability" };
        }
    }

    /**
     * Calculate shipping cost based on pincode and weight.
     */
    async calculateShippingCost(destinationPincode: string, weightGrams: number = 500, originPincode: string = '110001'): Promise<number> {
        try {
            // Delhivery often doesn't have a direct "calculate cost" API without an account setup
            // This usually involves calling the serviceability API with weight or a custom pricing logic
            // For now, we'll implement a fallback/dynamic logic or use the KRS API if available
            
            // Mocking cost calculation based on common Delhivery rates
            const baseRate = 60;
            const weightFactor = Math.ceil(weightGrams / 500) * 20;
            return baseRate + weightFactor;
        } catch (error) {
            return 80; // Default fallback
        }
    }

    /**
     * Create a shipment in Delhivery.
     */
    async createShipment(shipmentData: any) {
        try {
            // Delhivery Shipment Creation API (B2C)
            // Endpoint: /api/cmu/create.json
            // Format: url-encoded with format=json and data=<JSON_STRING>
            
            const payload = {
                shipments: [shipmentData],
                pickup_location: {
                    name: this.pickupLocationName
                }
            };

            const params = new URLSearchParams();
            params.append('format', 'json');
            params.append('data', JSON.stringify(payload));

            const response = await axios.post(`${this.baseUrl}/api/cmu/create.json`, params.toString(), {
                headers: {
                    ...this.getHeaders(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Delhivery Shipment Creation Error:', error.response?.data || error.message);
            throw new Error('Failed to create Delhivery shipment');
        }
    }

    /**
     * Track a shipment using waybill number.
     */
    async trackShipment(waybill: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/api/v1/packages/json/`, {
                params: { waybill },
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            console.error('Delhivery Tracking Error:', error.response?.data || error.message);
            throw new Error('Failed to track Delhivery shipment');
        }
    }
}

export const delhiveryService = new DelhiveryService();
