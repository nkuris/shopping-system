import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../app/store';
import { clearCart } from '../app/cartSlice';
import './OrderSummary.css';

interface OrderSummaryProps {
    onBack: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ onBack }) => {
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; address?: string; email?: string; items?: string[] }>({});

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payloadItems = cartItems.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity
        }));

        const validationErrors: string[] = [];
        const newFieldErrors: { fullName?: string; address?: string; email?: string; items?: string[] } = {};
        if (!fullName.trim()) validationErrors.push('Full name is required');
        if (!fullName.trim()) newFieldErrors.fullName = 'Please enter your full name';
        if (!address.trim()) validationErrors.push('Address is required');
        if (!address.trim()) newFieldErrors.address = 'Please enter your full address';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            validationErrors.push('Email is required');
            newFieldErrors.email = 'Please enter your email address';
        } else if (!emailRegex.test(email)) {
            validationErrors.push('Email is not valid');
            newFieldErrors.email = 'Enter a valid email like name@example.com';
        }
        if (!Array.isArray(payloadItems) || payloadItems.length === 0) validationErrors.push('Cart must contain at least one item');
        const itemFieldErrors: string[] = [];
        payloadItems.forEach((it, idx) => {
            if (typeof it.productId !== 'number') validationErrors.push(`items[${idx}].productId must be a number`);
            if (!it.productName || typeof it.productName !== 'string') validationErrors.push(`items[${idx}].productName is required`);
            if (!Number.isInteger(it.quantity) || it.quantity <= 0) validationErrors.push(`items[${idx}].quantity must be an integer > 0`);
            if (!it.productName || typeof it.productName !== 'string') itemFieldErrors.push(`Item ${idx + 1}: product name is required`);
            if (!Number.isInteger(it.quantity) || it.quantity <= 0) itemFieldErrors.push(`Item ${idx + 1}: quantity must be > 0`);
        });
        if (itemFieldErrors.length > 0) newFieldErrors.items = itemFieldErrors;

        if (validationErrors.length > 0) {
            setFieldErrors(newFieldErrors);
            setErrors(validationErrors);
            return;
        }

        // clear field errors on successful validation
        setFieldErrors({});

        const orderPayload = { fullName, address, email, items: payloadItems };

        try {
            setIsSubmitting(true);
            // POST to OrderService (runs on port 5001)
            const resp = await axios.post('http://localhost:5001/api/orders', orderPayload);
            dispatch(clearCart());
            setSubmitted(true);
            setErrors([]);
            // show toast
            setToastMessage(resp.data?.message || 'Order submitted successfully');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } catch (error) {
            console.error('Error submitting order:', error);
            // show server-side validation errors if returned
            if (axios.isAxiosError(error) && error.response && error.response.data) {
                const data = error.response.data as { errors?: string[]; message?: string } | undefined;
                if (data && data.errors && Array.isArray(data.errors)) setErrors(data.errors);
                else if (data && data.message) setErrors([data.message]);
                else setErrors(['Server error submitting order']);
            } else {
                setErrors(['Server error submitting order']);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="order-summary">
            <h2>סיכום ההזמנה</h2>
            {submitted && <div className="success-banner">ההזמנה התקבלה בהצלחה.</div>}

            <form onSubmit={handleSubmit} className="order-form">
                {errors.length > 0 && (
                    <div className="error-box" role="alert">
                        <strong style={{ display: 'block', marginBottom: '6px' }}>Please fix the following errors</strong>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="field-wrapper">
                    <label>שם פרטי ומשפחה: </label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className={fieldErrors.fullName ? 'input-error' : undefined}
                    />
                    {fieldErrors.fullName && <div className="field-error-text">{fieldErrors.fullName}</div>}
                </div>

                <div className="field-wrapper">
                    <label>כתובת מלאה: </label>
                    <input
                        type="text"
                        required
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className={fieldErrors.address ? 'input-error' : undefined}
                    />
                    {fieldErrors.address && <div className="field-error-text">{fieldErrors.address}</div>}
                </div>

                <div className="field-wrapper">
                    <label>מייל: </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={fieldErrors.email ? 'input-error' : undefined}
                    />
                    {fieldErrors.email && <div className="field-error-text">{fieldErrors.email}</div>}
                </div>

                <h4>מוצרי ההזמנה:</h4>
                <ul>
                    {cartItems.map(item => (
                        <li key={item.product.id}>
                            {item.product.name} - {item.quantity}
                        </li>
                    ))}
                </ul>
                {fieldErrors.items && (
                    <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: 8 }}>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {fieldErrors.items.map((it, i) => (
                                <li key={i}>{it}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="buttons">
                    <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'שולח...' : 'אשר הזמנה'}</button>
                    <button type="button" onClick={onBack}>חזור</button>
                </div>
            </form>
            {showToast && <div className="toast" role="status">{toastMessage}</div>}
        </div>
    );
};
