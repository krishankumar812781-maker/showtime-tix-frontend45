import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { addShow, getScreensByTheater, getAllShows, deleteShow } from '../api';

const AdminShowManager = () => {
    const { movies, theaters } = useData();
    const [screens, setScreens] = useState([]);
    const [existingShows, setExistingShows] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        movieId: '',
        theaterId: '',
        screenId: '',
        startTime: '',
        endTime: '',
        seatPrices: { REGULAR: 0, PREMIUM: 0, GOLD: 0 } 
    });

    useEffect(() => { fetchShows(); }, []);

    useEffect(() => {
        const fetchTheaterScreens = async () => {
            if (!formData.theaterId) return setScreens([]);
            try {
                const res = await getScreensByTheater(formData.theaterId);
                setScreens(res.data);
            } catch (err) { setScreens([]); }
        };
        fetchTheaterScreens();
    }, [formData.theaterId]);

    const fetchShows = async () => {
        try {
            const res = await getAllShows();
            setExistingShows(res.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
        } catch (err) { console.error("Sync Error"); }
    };

    const handlePriceChange = (type, value) => {
        setFormData(prev => ({
            ...prev,
            seatPrices: { ...prev.seatPrices, [type]: parseFloat(value) || 0 }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addShow(formData);
            fetchShows();
            setFormData({ movieId: '', theaterId: '', screenId: '', startTime: '', endTime: '', seatPrices: { REGULAR: 0, PREMIUM: 0, GOLD: 0 } });
            alert("Success: Show broadcasted to theater.");
        } catch (err) {
            alert(err.response?.data?.message || "Conflict: Check for time overlaps.");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent Action: This will wipe all seat allocations for this show.")) return;
        try {
            await deleteShow(id);
            fetchShows();
        } catch (err) { alert("Deletion Blocked: Active bookings found."); }
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 bg-[#F9FAFB] min-h-screen font-sans text-gray-900">
            {/* ⚡ SIMPLIFIED HEADER */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                    Show <span className="text-[#DC143C]">Scheduler</span>
                </h1>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* ⚡ SCHEDULING FORM */}
                <div className="lg:col-span-4 order-2 lg:order-1">
                    <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-50 lg:sticky lg:top-10">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">
                            <span className="w-2 h-6 bg-[#DC143C] rounded-full"></span> 
                            Configure Event
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Select Movie</label>
                                <select 
                                    className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 font-bold text-sm focus:bg-white focus:border-[#DC143C] outline-none transition-all appearance-none"
                                    value={formData.movieId}
                                    onChange={(e) => setFormData({...formData, movieId: e.target.value})} required
                                >
                                    <option value="">Choose Movie...</option>
                                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Location</label>
                                    <select 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 font-bold text-sm focus:bg-white focus:border-[#DC143C] outline-none transition-all"
                                        value={formData.theaterId}
                                        onChange={(e) => setFormData({...formData, theaterId: e.target.value, screenId: ''})} required
                                    >
                                        <option value="">Theater</option>
                                        {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Screen</label>
                                    <select 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 font-bold text-sm focus:bg-white focus:border-[#DC143C] outline-none transition-all"
                                        value={formData.screenId}
                                        onChange={(e) => setFormData({...formData, screenId: e.target.value})}
                                        disabled={!formData.theaterId} required
                                    >
                                        <option value="">Screen</option>
                                        {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Start Window</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 font-bold text-sm focus:bg-white focus:border-[#DC143C] outline-none transition-all"
                                        // ⚡ Added min/max constraints
                                        min="2026-01-20T00:00"
                                        max="2026-01-26T23:59"
                                        value={formData.startTime} 
                                        onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">End Window</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50/50 font-bold text-sm focus:bg-white focus:border-[#DC143C] outline-none transition-all"
                                        // ⚡ Added min/max constraints
                                        min="2026-01-20T00:00"
                                        max="2026-01-26T23:59"
                                        value={formData.endTime} 
                                        onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                                        required
                                    />
                                </div>
                            </div>

                            

                            {/* ⚡ VERTICAL PRICE CONFIGURATION */}
                            <div className="pt-4 border-t border-dashed">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Pricing Structure (USD)</label>
                                <div className="space-y-3">
                                    {['REGULAR', 'PREMIUM', 'GOLD'].map(type => (
                                        <div key={type} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                            <div className="min-w-20">
                                                <p className="text-[10px] font-black text-gray-500 uppercase">{type}</p>
                                            </div>
                                            <input 
                                                type="number" placeholder="0.00" 
                                                className="flex-1 w-full p-2 bg-white border-2 border-gray-100 rounded-xl text-right font-black text-sm outline-none focus:border-[#DC143C] transition-all"
                                                value={formData.seatPrices[type] || ''}
                                                onChange={(e) => handlePriceChange(type, e.target.value)} required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" disabled={loading}
                                className="w-full bg-[#111] text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#DC143C] active:scale-[0.98] transition-all disabled:bg-gray-200"
                            >
                                {loading ? "Syncing..." : "Commit to Schedule"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ⚡ LIST VIEW */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        
                        {/* Mobile View */}
                        <div className="block md:hidden">
                            {existingShows.length > 0 ? existingShows.map(show => {
                                const isLive = new Date() >= new Date(show.startTime) && new Date() <= new Date(show.endTime);
                                return (
                                    <div key={show.id} className="p-5 border-b border-gray-50 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[70%]">
                                                <div className="font-black text-gray-900 leading-tight">{show.movieTitle}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                                    {show.theaterName} • <span className="text-gray-900">{show.screenName}</span>
                                                </div>
                                            </div>
                                            {isLive ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-600 text-[8px] font-black rounded-full uppercase">Live</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-blue-50 text-blue-500 text-[8px] font-black rounded-full uppercase">Upcoming</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
                                            <div className="text-[10px] font-bold text-gray-500">
                                                {new Date(show.startTime).toLocaleDateString([], {month: 'short', day: 'numeric'})} | {new Date(show.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(show.id)}
                                                className="text-[#DC143C] font-black text-[10px] uppercase underline underline-offset-4"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-20 text-center text-gray-400 font-bold uppercase text-[10px]">Empty Schedule</div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-50">
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Show Details</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeframe</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="p-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {existingShows.length > 0 ? existingShows.map(show => {
                                        const isLive = new Date() >= new Date(show.startTime) && new Date() <= new Date(show.endTime);
                                        return (
                                            <tr key={show.id} className="hover:bg-gray-50/40 transition-colors group">
                                                <td className="p-6">
                                                    <div className="font-black text-gray-900 group-hover:text-[#DC143C] transition-colors">{show.movieTitle}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                                        {show.theaterName} • <span className="text-gray-900">{show.screenName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-xs font-black text-gray-700">
                                                        {new Date(show.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400">
                                                        {new Date(show.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                                        - {new Date(show.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    {isLive ? (
                                                        <span className="px-3 py-1 bg-green-100 text-green-600 text-[8px] font-black rounded-full uppercase">Live Now</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-500 text-[8px] font-black rounded-full uppercase">Upcoming</span>
                                                    )}
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(show.id)}
                                                        className="opacity-0 group-hover:opacity-100 bg-red-50 text-[#DC143C] font-black text-[10px] px-4 py-2 rounded-xl uppercase transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="p-32 text-center text-gray-400 font-bold uppercase text-xs">No shows currently on schedule</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminShowManager;