import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../app/cartSlice';
import type { RootState } from '../app/store';
import type { Category, Product } from '../types';

interface ShoppingListProps {
    onNextScreen: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ onNextScreen }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);

    useEffect(() => {
        // Replace URL/port with your local CatalogService URL
        axios.get<Category[]>('http://localhost:5000/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error('Failed fetching categories:', err));
    }, []);

    const currentCategoryObj = categories.find(c => c.id === selectedCategory);

    const handleAdd = () => {
        if (selectedProduct && quantity > 0) {
            dispatch(addToCart({ product: selectedProduct, quantity }));
            setQuantity(1);
        }
    };

    return (
        <div style={{ direction: 'rtl', padding: '20px' }}>
            <h2>רשימת קניות</h2>

            {/* Category Dropdown */}
            <div>
                <label>בחר קטגוריה: </label>
                <select onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCategory(val === '' ? null : Number(val));
                    setSelectedProduct(null);
                }}>
                    <option value="">-- בחר --</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Product Dropdown & Quantity */}
            {currentCategoryObj && (
                <div style={{ marginTop: '10px' }}>
                    <label>בחר מוצר: </label>
                    <select onChange={(e) => {
                        const val = e.target.value;
                        const prod = currentCategoryObj.products.find(p => p.id === Number(val));
                        setSelectedProduct(prod || null);
                    }}>
                        <option value="">-- בחר --</option>
                        {currentCategoryObj.products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        style={{ width: '50px', marginRight: '10px' }}
                    />

                    <button onClick={handleAdd} disabled={!selectedProduct} style={{ marginRight: '10px' }}>
                        הוסף מוצר לסל
                    </button>
                </div>
            )}

            {/* Selected Items Display grouped by category */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <h3>עגלת הקניות</h3>
                {cartItems.map(item => (
                    <div key={item.product.id}>
                        {item.product.name} - {item.quantity}
                    </div>
                ))}
            </div>

            {cartItems.length > 0 && (
                <button onClick={onNextScreen} style={{ marginTop: '20px' }}>
                    המשך הזמנה
                </button>
            )}
        </div>
    );
};