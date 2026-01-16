import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";
import { FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const bookingId = searchParams.get("bookingId");

    useEffect(() => {
        const finalizeBooking = async () => {
            try {
                // Call the backend to move status from PENDING to CONFIRMED
                const res = await api.post(`/booking/${bookingId}/confirm`);
                setBooking(res.data);
            } catch (err) {
                console.error("Error finalizing booking:", err);
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) finalizeBooking();
    }, [bookingId]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DC143C] mb-4"></div>
            <p className="font-black text-gray-400 uppercase tracking-widest text-[10px] md:text-xs text-center">
                Verifying Payment & Issuing Ticket...
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 md:py-20 px-4 overflow-x-hidden">
            <div className="max-w-xl mx-auto text-center">
                <FaCheckCircle className="text-green-500 text-6xl md:text-7xl mx-auto mb-4 md:mb-6 drop-shadow-lg" />
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">
                    Booking Confirmed!
                </h1>
                <p className="text-gray-500 text-sm md:text-base font-medium mb-8 md:mb-10 px-4">
                    Your transaction was successful. Grab your popcorn!
                </p>

                {booking && (
                    <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 text-left animate-in fade-in zoom-in duration-500">
                        {/* Ticket Header */}
                        <div className="bg-gray-900 p-6 md:p-8 text-white relative">
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter truncate">
                                {booking.movieTitle}
                            </h2>
                            <p className="text-red-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1">
                                {booking.theaterName}
                            </p>
                            
                            {/* Ticket Notch effects - hidden on extra small screens if needed, or adjusted */}
                            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gray-50 rounded-full hidden sm:block"></div>
                            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gray-50 rounded-full hidden sm:block"></div>
                        </div>

                        {/* Ticket Body */}
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                        <FaCalendarAlt className="text-red-500 shrink-0" /> 
                                        {new Date(booking.showStartTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seats</p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                        <FaTicketAlt className="text-red-500 shrink-0" /> 
                                        <span className="truncate">{booking.bookedSeats.join(", ")}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-dashed border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</p>
                                    <p className="font-mono text-sm text-gray-900 font-bold uppercase">#MB-{booking.id}</p>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid</p>
                                    <p className="text-xl md:text-2xl font-black text-[#DC143C]">
                                        ₹{booking.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                    <Link to="/mybookings" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-black transition-all text-center">
                        View My Bookings
                    </Link>
                    <Link to="/" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-gray-50 transition-all text-center">
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;