declare const __BASE__: string | undefined

export declare module "@medusajs/medusa/dist/api/routes/admin/products/create-product" {
    declare interface AdminPostProductsReq {
        address?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        state_id?: number | null;
        city_id?: number | null;
        generalAddressArea?: string;
        cautionFees?: Record<string, number>|null;
    }
}
export declare module "@medusajs/medusa/dist/models/order" {
  declare interface Order {
    booking?: /* ProductBooking */{id: string, cautionFeePaid: number, cautionFeeWithHeld: boolean, 

      bookingStartDate: string,
      bookingEndDate: string,
    }[];
  }
}
export declare module "@medusajs/medusa/dist/models/product" {
    declare interface Product {
        cautionFees: Record<string, number>;
        generalAddressArea: string;
        address: string;
        latitude: number;
        longitude: number;
        state: {id: number, name: string};
        city: {id: number, name: string};
    }
}
