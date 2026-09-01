import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/shopping_orders_db';
        await mongoose.connect(connStr);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};