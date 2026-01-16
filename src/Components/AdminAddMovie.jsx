import { useState } from 'react';
import { searchOmdb, importMovie, deleteMovie } from '../api'; 
import { useData } from '../context/DataContext';

const AdminAddMovie = () => {
    const { movies, loading: dataLoading, refreshMovies } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        try {
            const res = await searchOmdb(searchTerm);
            setSearchResults(res.data || []);
        } catch (err) {
            alert("Search failed. Check your Backend or API key.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleImport = async (imdbId) => {
        setActionLoading(imdbId);
        try {
            await importMovie(imdbId);
            await refreshMovies();
            setSearchResults(prev => prev.filter(m => m.imdbID !== imdbId));
            alert("Movie Imported successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Import failed.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove the movie and its associated shows.")) return;
        setActionLoading(id);
        try {
            await deleteMovie(id);
            await refreshMovies();
        } catch (err) {
            alert("Delete failed. This movie might have active bookings.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* SECTION 1: ADD NEW MOVIE */}
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm mb-6 md:mb-10 border border-gray-100">
                <h2 className="text-xl md:text-2xl font-black mb-6 border-l-8 border-[#DC143C] pl-4 uppercase tracking-tighter">
                    Movie <span className="text-[#DC143C]">Importer</span>
                </h2>
                <div className="flex flex-col md:flex-row gap-3">
                    <input 
                        type="text" 
                        className="flex-1 border-2 border-gray-100 p-4 rounded-xl md:rounded-2xl outline-none focus:border-[#DC143C] font-bold transition-all text-sm md:text-base"
                        placeholder="Search OMDb (e.g. Inception)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                        onClick={handleSearch} 
                        disabled={isSearching}
                        className="bg-[#DC143C] text-white px-8 py-4 md:py-0 rounded-xl md:rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all disabled:bg-gray-300 shadow-lg shadow-red-100"
                    >
                        {isSearching ? "Searching..." : "Search OMDb"}
                    </button>
                </div>

                {/* Search Results Horizontal Scroll */}
                {searchResults.length > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Results</h3>
                            <button onClick={() => setSearchResults([])} className="text-[10px] font-bold text-red-500 uppercase">Clear</button>
                        </div>
                        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide">
                            {searchResults.map((m)=> (
                                <div key={m.imdbID} className="min-w-[140px] md:min-w-40 group">
                                    <div className="relative mb-3">
                                        <img src={m.Poster !== "N/A" ? m.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                                             alt={m.Title}
                                             className="h-48 md:h-56 w-full object-cover rounded-xl md:rounded-2xl shadow-md group-hover:scale-105 transition-transform" />
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] px-2 py-1 rounded-md backdrop-blur-md">
                                            {m.Year}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleImport(m.imdbID)}
                                        disabled={actionLoading === m.imdbID}
                                        className="w-full bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-300"
                                    >
                                        {actionLoading === m.imdbID ? "..." : "+ Import"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION 2: CURRENTLY AVAILABLE MOVIES */}
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
                    <h2 className="text-xl md:text-2xl font-black border-l-8 border-gray-800 pl-4 uppercase tracking-tighter">
                        Active <span className="text-gray-400">Catalog</span>
                    </h2>
                    <span className="w-fit bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-2 rounded-full uppercase">
                        {movies.length} Movies Stored
                    </span>
                </div>

                {dataLoading ? (
                    <div className="animate-pulse flex flex-col gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {movies.map(movie => (
                            <div key={movie.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group border border-gray-100 md:border-transparent md:hover:border-gray-100">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <img src={movie.posterUrl} alt="" className="w-12 h-18 md:w-16 md:h-24 object-cover rounded-lg md:rounded-xl shadow-sm" />
                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 text-base md:text-lg leading-tight mb-1">{movie.title}</h3>
                                        <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                                            <span className="text-[9px] md:text-[10px] font-black text-[#DC143C] uppercase tracking-widest">{movie.genre}</span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{movie.duration}</span>
                                            {movie.rating && (
                                                <span className="text-[9px] md:text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                                    ★ {movie.rating}
                                                </span>
                                            )}
                                        </div>
                                        <p className="hidden md:block text-xs text-gray-400 mt-2 line-clamp-1 max-w-md">{movie.plot}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(movie.id)}
                                    disabled={actionLoading === movie.id}
                                    className="mt-4 md:mt-0 md:opacity-0 md:group-hover:opacity-100 text-red-500 font-black text-[10px] uppercase tracking-widest py-2 md:p-4 hover:bg-red-50 rounded-xl transition-all text-left md:text-center"
                                >
                                    {actionLoading === movie.id ? "DELETING..." : "REMOVE MOVIE"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAddMovie;