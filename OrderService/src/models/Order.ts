import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
    productId: number;
    productName: string;
    quantity: number;
}

export interface IOrder extends Document {
    fullName: string;
    address: string;
    email: string;
    items: IOrderItem[];
    createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, match: [/^(?:[a-zA-Z0-9_'^&+\/=?`{|}~-]+(?:\.[a-zA-Z0-9_'^&+\/=?`{|}~-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 'Invalid email'] },
    items: [
        {
            productId: { type: Number, required: true },
            productName: { type: String, required: true },
            quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export const Order = model<IOrder>('Order', OrderSchema);