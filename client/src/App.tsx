import { useState } from 'react';
import { ShoppingList } from './components/ShoppingList';
import { OrderSummary } from './components/OrderSummary';

function App() {
    const [screen, setScreen] = useState<'list' | 'summary'>('list');

    return (
        <div>
            {screen === 'list' ? (
                <ShoppingList onNextScreen={() => setScreen('summary')} />
            ) : (
                <OrderSummary onBack={() => setScreen('list')} />
            )}
        </div>
    );
}

export default App;