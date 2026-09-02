import type { Request, Response } from 'express';
import { Order } from '../models/Order.js';

function isPositiveInteger(value: any): boolean {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isValidEmail(email: any): boolean {
    if (typeof email !== 'string') return false;
    // simple RFC2822-ish email regex (sufficient for validation)
    return /^(?:[a-zA-Z0-9_'^&+/=?`{|}~-]+(?:\.[a-zA-Z0-9_'^&+/=?`{|}~-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(email);
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, address, email, items } = req.body;

        const errors: string[] = [];

        if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
            errors.push('fullName is required');
        }
        if (!address || typeof address !== 'string' || address.trim().length === 0) {
            errors.push('address is required');
        }
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            errors.push('email is required');
        } else if (!isValidEmail(email)) {
            errors.push('email is not a valid email address');
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            errors.push('items must be a non-empty array');
        } else {
            items.forEach((it: any, idx: number) => {
                if (typeof it !== 'object' || it == null) {
                    errors.push(`items[${idx}] must be an object`);
                    return;
                }
                if (typeof it.productId !== 'number') {
                    errors.push(`items[${idx}].productId must be a number`);
                }
                if (!it.productName || typeof it.productName !== 'string') {
                    errors.push(`items[${idx}].productName is required`);
                }
                if (!isPositiveInteger(it.quantity)) {
                    errors.push(`items[${idx}].quantity must be an integer greater than 0`);
                }
            });
        }

        if (errors.length > 0) {
            res.status(400).json({ message: 'Validation failed', errors });
            return;
        }

        const newOrder = new Order({
            fullName: fullName.trim(),
            address: address.trim(),
            email: email.trim(),
            items
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', orderId: savedOrder._id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error saving order' });
    }
};
