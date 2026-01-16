import React, { useEffect, useState } from "react";
import { getMyBookings } from "../api"; // You'll need to add this to api.js
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await getMyBookings();
                setBookings(res.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="p-20 text-center font-black animate-pulse">Loading Your Tickets...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
                    My <span className="text-[#DC143C]">Bookings</span>
                </h1>

                {bookings.length === 0 ? (
                    <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border">
                        <p className="text-gray-400 font-bold uppercase">No bookings found yet!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                                <div className="bg-gray-900 p-6 text-white md:w-1/3 flex flex-col justify-center">
                                    <h2 className="font-black text-xl uppercase leading-tight">{booking.movieTitle}</h2>
                                    <p className="text-[#DC143C] text-[10px] font-black uppercase mt-2">{booking.theaterName}</p>
                                </div>
                                <div className="p-6 flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Date</p>
                                        <p className="text-sm font-bold text-gray-800">{new Date(booking.showStartTime).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Seats</p>
                                        <p className="text-sm font-bold text-gray-800">{booking.bookedSeats.join(", ")}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-black ${booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {booking.bookingStatus}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Amount</p>
                                        <p className="text-lg font-black text-gray-900">${booking.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;