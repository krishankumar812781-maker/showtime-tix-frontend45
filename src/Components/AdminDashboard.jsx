import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import AdminAddMovie from './AdminAddMovie';
import AdminTheaterManager from './AdminTheaterManager';
import AdminScreenManager from './AdminScreenManager';
import AdminSeatManager from './AdminSeatManager';
import AdminShowManager from './AdminShowManager';
import { LogOut, Menu, X, Film, Landmark, Monitor, Map, Calendar, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout } = useAuth(); 

    const navItems = [
        { id: 'movies', label: 'Movies', icon: <Film size={20} /> },
        { id: 'theaters', label: 'Theaters', icon: <Landmark size={20} /> },
        { id: 'screens', label: 'Screens', icon: <Monitor size={20} /> },
        { id: 'seating', label: 'Seating', icon: <Map size={20} /> },
        { id: 'shows', label: 'Shows', icon: <Calendar size={20} /> },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'movies': return <AdminAddMovie />;
            case 'theaters': return <AdminTheaterManager />;
            case 'screens': return <AdminScreenManager />;
            case 'seating': return <AdminSeatManager />;
            case 'shows': return <AdminShowManager />;
            default: return <AdminAddMovie />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
            
            {/* --- MOBILE TOP BAR --- */}
            {/* z-index is set high to ensure mobile navigation stays on top */}
            <div className="lg:hidden bg-white border-b px-6 h-16 flex justify-between items-center sticky top-0 z-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-[#DC143C] p-1.5 rounded-lg text-white">
                        <LayoutDashboard size={20} />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-gray-900 uppercase">Admin</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <Menu size={28} />
                </button>
            </div>

            {/* --- SIDEBAR DRAWER --- */}
            {/* DESKTOP FIX: Changed z-index to 40 so it stays UNDER your main navbar (usually z-50).
                Changed lg:sticky to ensure it occupies its own column rather than floating over content.
            */}
            <aside className={`
                fixed inset-y-0 left-0 z-110 w-72 bg-[#DC143C] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
                lg:sticky lg:top-0 lg:h-screen lg:z-40 lg:translate-x-0 
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="p-8 flex justify-between items-center border-b border-red-500/30">
                    <div className="text-2xl font-black tracking-tighter uppercase">
                        SHOWTIME <span className="text-red-200">TIX</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-1 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 mt-6 overflow-y-auto px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${
                                activeTab === item.id 
                                ? 'bg-white text-[#DC143C] shadow-lg scale-[1.02]' 
                                : 'text-white/80 hover:bg-red-700 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-red-500/30">
                    <button 
                        className="flex items-center justify-center gap-3 w-full bg-red-700/50 hover:bg-red-800 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all"
                        onClick={logout} 
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* --- DARK OVERLAY (Mobile Only) --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-105 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 min-w-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-10">
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
                            {activeTab} <span className="text-[#DC143C]">Management</span>
                        </h1>
                        <div className="h-1.5 w-20 bg-[#DC143C] mt-4 rounded-full"></div>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white p-4 md:p-6 lg:p-10 rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 min-h-[calc(100vh-200px)]">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;