import { useState, useEffect, useCallback } from 'react';
import { addSeats, getSeatsByScreen, getScreensByTheater, clearScreenLayout } from '../api'; 
import { useData } from '../context/DataContext';

const AdminSeatManager = () => {
    const { theaters } = useData();
    const [screens, setScreens] = useState([]);
    const [selectedTheater, setSelectedTheater] = useState('');
    const [selectedScreen, setSelectedScreen] = useState('');
    
    // Grid Configuration State
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(12);
    const [seatType, setSeatType] = useState('REGULAR');
    
    const [existingSeats, setExistingSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSeats, setFetchingSeats] = useState(false);

    // 1. Fetch screens specifically for the selected theater
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

    // 2. Fetch existing seats when a screen is selected
    const fetchSeats = useCallback(async () => {
        if (!selectedScreen) {
            setExistingSeats([]);
            return;
        }
        setFetchingSeats(true);
        try {
            const res = await getSeatsByScreen(selectedScreen);
            // Sort seats alphabetically by seatNumber so Row A is always at the top (near screen)
            const sortedSeats = res.data.sort((a, b) => 
                a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true, sensitivity: 'base' })
            );
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
            const msg = err.response?.data?.message || "Failed to clear layout. Seats might be booked.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAndSave = async () => {
        if (!selectedScreen) return alert("Please select a screen first!");
        
        const seatList = [];
        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(65 + r); 
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
            alert(`Successfully added ${seatList.length} ${seatType} seats!`);
            await fetchSeats();
        } catch (err) {
            alert("Error adding seats. They might already exist.");
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
                
                {/* CONFIGURATION PANEL */}
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 md:mb-6">1. Target Screen</h3>
                        <div className="space-y-3 md:space-y-4">
                            <select 
                                className="w-full p-3 md:p-4 border rounded-xl bg-white outline-none focus:border-[#DC143C] font-bold text-sm"
                                value={selectedTheater}
                                onChange={(e) => setSelectedTheater(e.target.value)}
                            >
                                <option value="">Select Theater</option>
                                {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>

                            <select 
                                className="w-full p-3 md:p-4 border rounded-xl bg-white outline-none focus:border-[#DC143C] font-bold text-sm"
                                value={selectedScreen}
                                onChange={(e) => setSelectedScreen(e.target.value)}
                                disabled={!selectedTheater}
                            >
                                <option value="">Select Screen</option>
                                {screens.map(s => <option key={s.id} value={s.id}>{s.name} ({s.screenType})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 md:mb-6">2. Grid Layout</h3>
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                            <div>
                                <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Rows (A-Z)</label>
                                <input 
                                    type="number" className="w-full p-3 md:p-4 border rounded-xl outline-none text-sm" 
                                    value={rows} onChange={(e) => setRows(e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Cols (1-50)</label>
                                <input 
                                    type="number" className="w-full p-3 md:p-4 border rounded-xl outline-none text-sm" 
                                    value={cols} onChange={(e) => setCols(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Seat Tier</label>
                            <select 
                                className="w-full p-3 md:p-4 border rounded-xl bg-white outline-none font-bold text-sm"
                                value={seatType} onChange={(e) => setSeatType(e.target.value)}
                            >
                                <option value="REGULAR">REGULAR (Front)</option>
                                <option value="PREMIUM">PREMIUM (Middle)</option>
                                <option value="GOLD">GOLD CLASS (Back)</option>
                            </select>
                            <p className="mt-2 text-[8px] text-gray-400 font-bold uppercase tracking-tight italic">
                                * Tip: Generate Regular seats first (A-E), then Premium (F-J), etc.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleGenerateAndSave}
                                disabled={loading || !selectedScreen}
                                className="w-full bg-[#DC143C] text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all disabled:bg-gray-300"
                            >
                                {loading ? "Processing..." : "Generate & Save Seats"}
                            </button>

                            {existingSeats.length > 0 && (
                                <button 
                                    onClick={handleClearLayout}
                                    disabled={loading}
                                    className="w-full bg-white text-red-600 border-2 border-red-600 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all"
                                >
                                    Clear Existing Layout
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* VISUAL PREVIEW PANEL */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px] md:min-h-[500px]">
                        <div className="p-4 md:p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="font-black text-gray-800 uppercase text-[10px] md:text-xs tracking-widest">Live Seating Preview</h3>
                            {existingSeats.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 md:gap-4 items-center">
                                    <div className="flex gap-2 items-center mr-2">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-400"></div><span className="text-[8px] font-bold">GOLD</span></div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-400"></div><span className="text-[8px] font-bold">PREM</span></div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-300"></div><span className="text-[8px] font-bold">REG</span></div>
                                    </div>
                                    <span className="text-[9px] md:text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">
                                        {existingSeats.length} SEATS REGISTERED
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-4 md:p-8 overflow-auto text-center">
                            {fetchingSeats ? (
                                <div className="h-full flex items-center justify-center animate-pulse text-gray-300 font-bold uppercase tracking-widest text-sm">
                                    Fetching Database Layout...
                                </div>
                            ) : existingSeats.length > 0 ? (
                                <div className="flex flex-col items-center min-w-max px-4">
                                    <div className="w-full max-w-md h-2 bg-gray-200 rounded-full mb-10 md:mb-12 shadow-inner relative">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Screen This Way</span>
                                    </div>

                                    <div 
                                        className="grid gap-1.5 md:gap-2"
                                        style={{ 
                                            gridTemplateColumns: `repeat(${Math.max(...existingSeats.map(s => parseInt(s.seatNumber.replace(/^\D+/g, '')) || 1))}, minmax(0, 1fr))` 
                                        }}
                                    >
                                        {existingSeats.map(seat => (
                                            <div 
                                                key={seat.id} 
                                                title={`${seat.seatNumber} - ${seat.seatType}`}
                                                className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center text-[8px] md:text-[9px] font-black rounded md:rounded-lg border transition-all cursor-default shadow-sm
                                                    ${getSeatColorClass(seat.seatType)}`}
                                            >
                                                {seat.seatNumber}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10 md:py-20">
                                    <div className="text-6xl md:text-8xl mb-4">💺</div>
                                    <p className="font-bold uppercase tracking-widest text-lg md:text-xl text-gray-900">No Layout Defined</p>
                                    <p className="text-xs md:text-sm text-gray-500">Select a screen and generate the grid.</p>
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