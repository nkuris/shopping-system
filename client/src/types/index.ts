export interface Product {
    id: number;
    name: string;
    categoryId: number;
}

export interface Category {
    id: number;
    name: string;
    products: Product[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}       