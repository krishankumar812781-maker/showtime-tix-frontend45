import { useState } from 'react';
import { addTheater, deleteTheater } from '../api';
import { useData } from '../context/DataContext';

const AdminTheaterManager = () => {
    const { theaters, loading, refreshTheaters } = useData();
    const [theaterForm, setTheaterForm] = useState({ name: '', address: '', city: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!theaterForm.name || !theaterForm.city) return alert("Please fill required fields");
        
        setIsSubmitting(true);
        try {
            await addTheater(theaterForm);
            alert("Theater added successfully!");
            setTheaterForm({ name: '', address: '', city: '' });
            await refreshTheaters(); 
        } catch (err) { 
            alert("Error adding theater. Ensure you are logged in as Admin."); 
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove all associated screens.")) return;
        
        try {
            await deleteTheater(id);
            await refreshTheaters();
        } catch (err) {
            alert("Delete failed. Check backend logs.");
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="mb-6 md:mb-10">
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 border-l-8 border-[#DC143C] pl-4 uppercase tracking-tighter leading-none">
                        Theater <span className="text-[#DC143C]">Management</span>
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm font-bold mt-2 ml-6 uppercase tracking-widest">
                        Configure and monitor physical cinema locations
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                    
                    {/* LEFT: Add Theater Form */}
                    <aside className="lg:col-span-1 sticky top-8">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black mb-6 text-gray-800 uppercase tracking-tight">Add New Location</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block ml-1">Theater Name</label>
                                    <input 
                                        type="text" placeholder="e.g. PVR Icon" 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#DC143C] outline-none transition-all text-sm font-bold"
                                        value={theaterForm.name} onChange={(e) => setTheaterForm({...theaterForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block ml-1">City</label>
                                    <input 
                                        type="text" placeholder="e.g. Mumbai" 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#DC143C] outline-none transition-all text-sm font-bold"
                                        value={theaterForm.city} onChange={(e) => setTheaterForm({...theaterForm, city: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block ml-1">Full Address</label>
                                    <textarea 
                                        placeholder="Enter the street address..." 
                                        className="w-full p-4 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-[#DC143C] outline-none transition-all text-sm font-bold min-h-[100px]"
                                        value={theaterForm.address} onChange={(e) => setTheaterForm({...theaterForm, address: e.target.value})}
                                    />
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    type="submit" 
                                    className="bg-[#DC143C] text-white px-6 py-5 rounded-2xl font-black hover:bg-red-700 w-full transition-all shadow-xl shadow-red-100 uppercase text-xs tracking-widest disabled:bg-gray-300 mt-2"
                                >
                                    {isSubmitting ? "Processing..." : "Create Theater"}
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* RIGHT: Theater List */}
                    <main className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            
                            {/* Header for List */}
                            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Locations</h3>
                                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-gray-500 border border-gray-100">
                                    {theaters.length} TOTAL
                                </span>
                            </div>

                            {/* Desktop View Table (Hidden on Mobile) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Theater Details</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase text-right">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr><td colSpan="2" className="p-20 text-center text-gray-400 font-bold animate-pulse">Fetching theater data...</td></tr>
                                        ) : theaters.length === 0 ? (
                                            <tr><td colSpan="2" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">No theaters registered yet.</td></tr>
                                        ) : (
                                            theaters.map(theater => (
                                                <tr key={theater.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="font-black text-gray-900 text-lg group-hover:text-[#DC143C] transition-colors">{theater.name}</div>
                                                        <div className="text-sm text-gray-500 font-medium">{theater.address}, {theater.city}</div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button 
                                                            onClick={() => handleDelete(theater.id)}
                                                            className="text-red-500 hover:text-white hover:bg-red-500 font-black text-xs px-5 py-2.5 rounded-xl border-2 border-red-50 transition-all uppercase tracking-tighter"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View Cards (Hidden on Desktop) */}
                            <div className="md:hidden">
                                {loading ? (
                                    <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Loading...</div>
                                ) : theaters.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400 font-bold">No locations found.</div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {theaters.map(theater => (
                                            <div key={theater.id} className="p-5 space-y-3">
                                                <div>
                                                    <div className="font-black text-gray-900 text-base">{theater.name}</div>
                                                    <div className="text-xs text-gray-500 font-bold">{theater.city}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1 italic">{theater.address}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(theater.id)}
                                                    className="w-full bg-red-50 text-red-500 font-black text-[10px] py-3 rounded-xl uppercase tracking-widest active:scale-95 transition-transform"
                                                >
                                                    Delete Location
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
};

export default AdminTheaterManager;