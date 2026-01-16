import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ bookingId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // ⚡ Where to redirect after successful payment
                // Stripe will append 'payment_intent_client_secret' to this URL
                return_url: `${window.location.origin}/payment-success?bookingId=${bookingId}`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-[#DC143C] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-red-700 transition-all disabled:bg-gray-300"
            >
                {isLoading ? "Verifying..." : "Pay Now"}
            </button>

            {message && (
                <div className="text-red-500 text-xs font-bold text-center mt-4 bg-red-50 p-3 rounded-xl uppercase">
                    {message}
                </div>
            )}
        </form>
    );
};

export default CheckoutForm;