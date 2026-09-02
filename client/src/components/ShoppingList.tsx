import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../app/cartSlice';
import type { RootState } from '../app/store';
import type { Category, Product } from '../types';
import './ShoppingList.css';

interface ShoppingListProps {
    onNextScreen: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ onNextScreen }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);

    useEffect(() => {
        // Replace URL/port with your local CatalogService URL
        setIsLoadingCategories(true);
        axios.get<Category[]>('http://localhost:5000/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error('Failed fetching categories:', err))
            .finally(() => setIsLoadingCategories(false));
    }, []);

    const currentCategoryObj = categories.find(c => c.id === selectedCategory);

    const handleAdd = () => {
        if (selectedProduct && quantity > 0) {
            dispatch(addToCart({ product: selectedProduct, quantity }));
            setQuantity(1);
        }
    };

    return (
        <div className="shopping-list">
            <div className="hero">
                <h2 style={{ margin: 0 }}>רשימת קניות</h2>
                <div style={{ fontSize: '0.95rem', color: '#555' }}>בחרו קטגוריה, בחרו מוצר והוסיפו לסל</div>
            </div>

            {/* Category Dropdown */}
            <div className="category-row">
                <label>בחר קטגוריה: </label>
                {isLoadingCategories && (
                    <>
                        <span className="spinner" aria-hidden="true" />
                        <span className="loading-text">טוען קטגוריות...</span>
                    </>
                )}
                <select disabled={isLoadingCategories} onChange={(e) => {
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
                <div className="controls">
                    <div>
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
                    </div>

                    <div>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            style={{ width: '80px' }}
                        />
                    </div>

                    <button className="add-button" onClick={handleAdd} disabled={!selectedProduct}>
                        הוסף מוצר לסל
                    </button>
                </div>
            )}

            {/* Selected Items Display grouped by category */}
            <div className="cart">
                <h3>עגלת הקניות</h3>
                {cartItems.length === 0 && <div style={{ color: '#666' }}>העגלה ריקה</div>}
                {cartItems.map(item => (
                    <div className="cart-item" key={item.product.id}>
                        <div>{item.product.name}</div>
                        <div>{item.quantity}</div>
                    </div>
                ))}

                <button className="checkout-button" onClick={onNextScreen} disabled={cartItems.length === 0}>
                    המשך הזמנה
                </button>
            </div>
        </div>
    );
};