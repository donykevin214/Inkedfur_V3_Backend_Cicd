export type OrNull<T> = T | null;
export type OrUndefined<T> = T | undefined;

export interface fileInterface {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

export interface CardInterface {
    cardNumber: string;
    expireDate: string;
    cardCode: string;
}
export interface CheckoutInterface {
    buyer_id?: string,
    card: CardInterface,
    shippingInfo: {
        name: string;
        price: string;
    },
    billToInfo: {
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    },
    shipToInfo: {
        firstName: string;
        lastName: string;
        email: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    },
    products: {
        cart_id?: string;
        product_id: string;
        product_name: string;
        image: string;
        category: string;
        price: number;
        quantity: number;
        crop_size?: string;
        product_sell_type: string;
        tip: number;
    }[],
    totalPrice: string,
}

