# Node
node_modules/
**/node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
out/
**/dist/
**/build/

# TypeScript build info
tsconfig.tsbuildinfo

# Runtime / logs
logs/
*.log
pids/
*.pid

# Environment / secrets
.env
.env.local
.env.*.local

# Coverage
coverage/
.nyc_output/

# Caches
.cache/
.parcel-cache/
.vite/
.next/

# Editor / OS
.vscode/
!.vscode/extensions.json
.idea/
.DS_Store

# Visual Studio / .NET
.vs/
*.suo
*.user
*.userosscache
*.sln.docstates
bin/
obj/
**/bin/
**/obj/

# Misc
*.tgz
*.logimport type { Request, Response } from 'express';
import { Order } from '../models/Order.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, address, email, items } = req.body;

        if (!fullName || !address || !email || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: 'Missing required order fields or items array' });
            return;
        }

        const newOrder = new Order({
            fullName,
            address,
            email,
            items
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', orderId: savedOrder._id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error saving order' });
    }
};