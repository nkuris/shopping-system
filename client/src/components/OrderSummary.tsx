import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../app/store';
import { clearCart } from '../app/cartSlice';

interface OrderSummaryProps {
    onBack: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ onBack }) => {
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const orderPayload = {
            fullName,
            address,
            email,
            items: cartItems.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity
            }))
        };

        try {
            // Replace URL/port with your local Node.js OrderService URL
            await axios.post('http://localhost:5000/api/orders', orderPayload);
            dispatch(clearCart());
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('אירעה שגיאה בשמירת ההזמנה');
        }
    };

    if (submitted) {
        return (
            <div style={{ direction: 'rtl', padding: '20px' }}>
                <h2>ההזמנה נקלטה בהצלחה!</h2>
                <button onClick={onBack}>חזור לרשימת קניות</button>
            </div>
        );
    }

    return (
        <div style={{ direction: 'rtl', padding: '20px' }}>
            <h2>סיכום ההזמנה</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                <div>
                    <label>שם פרטי ומשפחה: </label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div>
                    <label>כתובת מלאה: </label>
                    <input type="text" required value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div>
                    <label>מייל: </label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <h4>מוצרי ההזמנה:</h4>
                <ul>
                    {cartItems.map(item => (
                        <li key={item.product.id}>
                            {item.product.name} - {item.quantity}
                        </li>
                    ))}
                </ul>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit">אשר הזמנה</button>
                    <button type="button" onClick={onBack}>חזור</button>
                </div>
            </form>
        </div>
    );
};};