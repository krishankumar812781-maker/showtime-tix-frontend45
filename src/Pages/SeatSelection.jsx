import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBooking, getShowSeats } from "../api"; 
import { FaChair } from "react-icons/fa";

const SeatSelection = () => {
    const { showId } = useParams();
    const navigate = useNavigate();

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await getShowSeats(showId);
                setSeats(res.data);
            } catch (err) {
                console.error("Failed to fetch seats:", err);
                alert("Could not load seats. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        if (showId) fetchSeats();
    }, [showId]);

    const toggleSeatSelection = (seat) => {
        if (seat.status !== "AVAILABLE") return;
        setSelectedSeats(prev => 
            prev.find(s => s.id === seat.id)
            ? prev.filter(s => s.id !== seat.id)
            : [...prev, seat]
        );
    };

    const handleProceedToPay = async () => {
        if (selectedSeats.length === 0) return alert("Please select at least one seat.");
        setIsBooking(true);
        try {
            const bookingData = {
                showId: showId,
                showSeatIds: selectedSeats.map(s => s.id)
            };
            const res = await createBooking(bookingData);
            navigate("/payment", { 
                state: { 
                    clientSecret: res.data.clientSecret,
                    bookingId: res.data.id,
                    totalAmount: res.data.totalAmount
                } 
            });
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed.");
        } finally {
            setIsBooking(false);
        }
    };

    const seatGroups = seats.reduce((groups, seat) => {
        const type = seat.seatType?.toUpperCase() || "REGULAR";
        if (!groups[type]) groups[type] = [];
        groups[type].push(seat);
        return groups;
    }, {});

    const getSeatStyles = (seatType, isSelected, isBooked) => {
        if (isBooked) return "text-gray-200 cursor-not-allowed border-transparent";
        if (isSelected) return "bg-[#DC143C] text-white shadow-lg border-[#DC143C]";

        switch (seatType?.toUpperCase()) {
            case 'GOLD': return "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-500";
            case 'PREMIUM': return "bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-500";
            default: return "bg-white text-gray-400 border-gray-100 hover:border-gray-400";
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center font-black animate-pulse text-gray-400 uppercase tracking-widest text-sm md:text-base">
                Generating Seat Map...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-32 pt-6 md:pt-10 px-4 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                {/* SCREEN INDICATOR */}
                <div className="w-full mb-10 md:mb-16">
                    <div className="h-1.5 md:h-2 bg-gray-300 rounded-full w-3/4 md:w-2/3 mx-auto shadow-[0_10px_20px_rgba(0,0,0,0.1)]"></div>
                    <p className="text-[8px] md:text-[10px] text-center font-black text-gray-400 mt-3 md:mt-4 uppercase tracking-[0.3em]">Screen This Way</p>
                </div>

                {/* DYNAMIC SEAT SECTIONS with Horizontal Scroll for Mobile */}
                <div className="space-y-8 md:space-y-12 mb-16">
                    {Object.keys(seatGroups).sort().reverse().map((type) => (
                        <div key={type} className="flex flex-col items-center">
                            <div className="w-full flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                    {type} Class Section
                                </span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            
                            {/* Scrollable Container for small screens */}
                            <div className="w-full overflow-x-auto pb-4 no-scrollbar flex justify-center">
                                <div className="grid grid-cols-10 gap-2 md:gap-3 min-w-max px-2">
                                    {seatGroups[type].map((seat) => (
                                        <button
                                            key={seat.id}
                                            onClick={() => toggleSeatSelection(seat)}
                                            disabled={seat.status !== "AVAILABLE"}
                                            className={`flex flex-col items-center justify-center w-8 h-10 md:w-12 md:h-14 rounded-lg md:rounded-xl transition-all border ${getSeatStyles(seat.seatType, selectedSeats.find(s => s.id === seat.id), seat.status !== "AVAILABLE")}`}
                                        >
                                            <FaChair className="text-[14px] md:text-[18px]" />
                                            <span className="text-[7px] md:text-[8px] font-bold mt-1 uppercase">{seat.seatNumber}</span>
                                            <span className="text-[5px] md:text-[6px] font-black opacity-40">₹{seat.price}</span>

                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* LEGEND - Responsive wrapping */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 border-t pt-8 md:pt-10">
                    {[
                        { icon: "text-amber-500", label: "Gold" },
                        { icon: "text-blue-500", label: "Premium" },
                        { icon: "text-gray-400", label: "Regular" },
                        { icon: "text-gray-200", label: "Booked" },
                        { icon: "text-[#DC143C]", label: "Selected" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 md:gap-2">
                            <FaChair className={item.icon} size={14} />
                            <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* FOOTER ACTION - Sticky/Fixed for Mobile */}
                <div className="fixed bottom-0 left-0 right-0 md:relative bg-white p-4 md:p-8 md:rounded-[40px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-2xl flex flex-row items-center justify-between border-t md:border border-gray-100 z-40">
                    <div className="flex flex-col">
                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Seats</p>
                        <h3 className="text-sm md:text-lg font-black text-gray-900 truncate max-w-[120px] md:max-w-none">
                            {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(", ") : "None"}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-10">
                        <div className="text-right">
                            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                            <h3 className="text-lg md:text-2xl font-black text-[#DC143C]">₹{totalPrice.toFixed(2)}</h3>
                        </div>
                        <button 
                            onClick={handleProceedToPay}
                            disabled={isBooking || selectedSeats.length === 0}
                            className="bg-[#DC143C] text-white px-5 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                        >
                            {isBooking ? "..." : "Pay"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;