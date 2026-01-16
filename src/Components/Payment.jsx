import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// ⚡ Replace with your actual Stripe Publishable Key
const stripePromise = loadStripe("pk_test_51SlXl9FvBoqAZV2rKb4AhkObBmTFuBFyRVuUUHiWtG4IhFgNF1zOvhNFMN5pJcqJX1osFMmLUw59M3ZRFSC8Rc9P00CEL8xgLH");

const Payment = () => {
    const location = useLocation();
    
    // Extract data passed from SeatSelection.jsx
    const { clientSecret, bookingId, totalAmount } = location.state || {};

    if (!clientSecret) {
        return <div className="p-20 text-center font-black">Invalid Session. Please try booking again.</div>;
    }

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#DC143C',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            borderRadius: '12px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-6 overflow-x-hidden">
    <div className="w-full max-w-md">
        <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-6 md:mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secure Checkout</p>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
                    Finalize <span className="text-[#DC143C]">Payment</span>
                </h2>
                
                {/* Responsive Amount Box */}
                <div className="mt-6 p-4 md:p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount Due</p>
                    {/* Updated to Rupees (₹) */}
                    <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        ₹{totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Payment Description/Hint for Mobile */}
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase mb-6 tracking-wide">
                Pay securely using your card
            </p>

            {/* ⚡ Stripe Elements Provider */}
            <div className="stripe-container">
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm bookingId={bookingId} />
                </Elements>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex justify-center items-center gap-4 opacity-40 grayscale">
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
            </div>
        </div>
    </div>
</div>
    );
};

export default Payment;