import { useState, useEffect, useCallback } from 'react';
import { addSeats, getSeatsByScreen, getScreensByTheater, clearScreenLayout } from '../api'; 
import { useData } from '../context/DataContext';

const AdminSeatManager = () => {
    const { theaters } = useData();
    const [screens, setScreens] = useState([]);
    const [selectedTheater, setSelectedTheater] = useState('');
    const [selectedScreen, setSelectedScreen] = useState('');
    
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(10);
    const [seatType, setSeatType] = useState('REGULAR');
    
    const [existingSeats, setExistingSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSeats, setFetchingSeats] = useState(false);

    useEffect(() => {
        const fetchScreens = async () => {
            if (!selectedTheater) {
                setScreens([]);
                setSelectedScreen('');
                return;
            }
            try {
                const res = await getScreensByTheater(selectedTheater);
                setScreens(res.data);
            } catch (err) {
                console.error("Failed to load screens:", err);
                setScreens([]);
            }
        };
        fetchScreens();
    }, [selectedTheater]);

    const fetchSeats = useCallback(async () => {
        if (!selectedScreen) {
            setExistingSeats([]);
            return;
        }
        setFetchingSeats(true);
        try {
            const res = await getSeatsByScreen(selectedScreen);
            
            // ⚡ FIX 1: Natural Sorting (A2 before A10)
            const sortedSeats = res.data.sort((a, b) => {
                return a.seatNumber.localeCompare(b.seatNumber, undefined, { 
                    numeric: true, 
                    sensitivity: 'base' 
                });
            });
            setExistingSeats(sortedSeats);
        } catch (err) {
            setExistingSeats([]);
        } finally {
            setFetchingSeats(false);
        }
    }, [selectedScreen]);

    useEffect(() => {
        fetchSeats();
    }, [fetchSeats]);

    const handleClearLayout = async () => {
        if (!selectedScreen) return;
        const confirmFirst = window.confirm("Alert: This will delete ALL seats for this screen.");
        if (!confirmFirst) return;

        setLoading(true);
        try {
            await clearScreenLayout(selectedScreen);
            setExistingSeats([]); 
            alert("Layout cleared successfully.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to clear layout.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAndSave = async () => {
        if (!selectedScreen) return alert("Please select a screen first!");
        
        // ⚡ FIX 2: Automatic Row Offsetting
        // This calculates the next available letter so tiers don't overlap
        const lastSeat = existingSeats[existingSeats.length - 1];
        let startRowChar = 65; // 'A'
        
        if (lastSeat) {
            const lastRowLetter = lastSeat.seatNumber.match(/[A-Z]+/)[0];
            startRowChar = lastRowLetter.charCodeAt(0) + 1;
        }

        const seatList = [];
        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(startRowChar + r); 
            for (let c = 1; c <= cols; c++) {
                seatList.push({
                    seatNumber: `${rowLabel}${c}`,
                    seatType: seatType
                });
            }
        }

        const requestDto = {
            screenId: parseInt(selectedScreen),
            seats: seatList
        };

        setLoading(true);
        try {
            await addSeats(requestDto);
            alert(`Added ${seatList.length} ${seatType} seats starting from Row ${String.fromCharCode(startRowChar)}`);
            await fetchSeats();
        } catch (err) {
            alert("Error adding seats. Check if rows already exist.");
        } finally {
            setLoading(false);
        }
    };

    const getSeatColorClass = (type) => {
        switch (type?.toUpperCase()) {
            case 'GOLD': return 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm';
            case 'PREMIUM': return 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm';
            default: return 'bg-gray-50 border-gray-200 text-gray-500';
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen">
            <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-10 border-l-8 border-[#DC143C] pl-4 uppercase tracking-tighter">
                Seat <span className="text-[#DC143C]">Architect</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">1. Target Screen</h3>
                        <div className="space-y-3">
                            <select 
                                className="w-full p-3 border rounded-xl bg-white font-bold text-sm"
                                value={selectedTheater}
                                onChange={(e) => setSelectedTheater(e.target.value)}
                            >
                                <option value="">Select Theater</option>
                                {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>

                            <select 
                                className="w-full p-3 border rounded-xl bg-white font-bold text-sm"
                                value={selectedScreen}
                                onChange={(e) => setSelectedScreen(e.target.value)}
                                disabled={!selectedTheater}
                            >
                                <option value="">Select Screen</option>
                                {screens.map(s => <option key={s.id} value={s.id}>{s.name} ({s.screenType})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">2. Grid Layout</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Rows to Add</label>
                                <input 
                                    type="number" className="w-full p-3 border rounded-xl outline-none text-sm" 
                                    value={rows} onChange={(e) => setRows(parseInt(e.target.value))} 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Cols (Width)</label>
                                <input 
                                    type="number" className="w-full p-3 border rounded-xl outline-none text-sm" 
                                    value={cols} onChange={(e) => setCols(parseInt(e.target.value))} 
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Seat Tier</label>
                            <select 
                                className="w-full p-3 border rounded-xl bg-white font-bold text-sm"
                                value={seatType} onChange={(e) => setSeatType(e.target.value)}
                            >
                                <option value="REGULAR">REGULAR (Front)</option>
                                <option value="PREMIUM">PREMIUM (Middle)</option>
                                <option value="GOLD">GOLD CLASS (Back)</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleGenerateAndSave}
                                disabled={loading || !selectedScreen}
                                className="w-full bg-[#DC143C] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-red-700 disabled:bg-gray-300 transition-all"
                            >
                                {loading ? "Processing..." : "Generate & Save Seats"}
                            </button>

                            {existingSeats.length > 0 && (
                                <button 
                                    onClick={handleClearLayout}
                                    disabled={loading}
                                    className="w-full bg-white text-red-600 border-2 border-red-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all"
                                >
                                    Clear Existing Layout
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Live Seating Preview</h3>
                            <div className="flex gap-4 items-center">
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-400"></div><span className="text-[8px] font-bold uppercase">Gold</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-400"></div><span className="text-[8px] font-bold uppercase">Prem</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-300"></div><span className="text-[8px] font-bold uppercase">Reg</span></div>
                                </div>
                                <span className="text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">
                                    {existingSeats.length} SEATS
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-auto text-center">
                            {fetchingSeats ? (
                                <div className="h-full flex items-center justify-center animate-pulse text-gray-300 font-bold uppercase tracking-widest text-sm">
                                    Updating Grid...
                                </div>
                            ) : existingSeats.length > 0 ? (
                                <div className="flex flex-col items-center">
                                    {/* Screen Visualizer */}
                                    <div className="w-3/4 h-1.5 bg-gray-200 rounded-full mb-12 shadow-inner relative">
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Cinema Screen This Way</span>
                                    </div>

                                    <div 
                                        className="grid gap-2"
                                        style={{ 
                                            // ⚡ FIX 3: Dynamic Grid columns based on max seat number found
                                            gridTemplateColumns: `repeat(${Math.max(...existingSeats.map(s => parseInt(s.seatNumber.match(/\d+/)[0]) || 1))}, minmax(0, 1fr))` 
                                        }}
                                    >
                                        {existingSeats.map(seat => (
                                            <div 
                                                key={seat.id} 
                                                className={`w-9 h-9 flex items-center justify-center text-[9px] font-black rounded-lg border transition-all shadow-sm ${getSeatColorClass(seat.seatType)}`}
                                            >
                                                {seat.seatNumber}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                    <div className="text-8xl mb-4">💺</div>
                                    <p className="font-bold uppercase tracking-widest text-xl text-gray-900">No Layout Defined</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSeatManager;