import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Search, Menu, Ticket, Star, X, User } from "lucide-react"; 
import AuthModal from "../Pages/AuthModal";
import { useAuth } from "../context/AuthContext";
import { searchMovies } from "../api"; 

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Logic with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await searchMovies(searchQuery.trim());
          setResults(res.data);
          setShowDropdown(true);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectMovie = (movieId) => {
    setShowDropdown(false);
    setSearchQuery("");
    setIsMenuOpen(false);
    navigate(`/movie/${movieId}`);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
           <Link to="/" className="flex items-center gap-2 shrink-0">
            <Film size={28} className="text-[#DC143C]" />
            <span className="font-black text-xl md:text-2xl text-gray-900 tracking-tighter uppercase">
              SHOWTIME TIX
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8 relative" ref={dropdownRef}>
            <div className="flex border border-gray-200 rounded-xl px-4 py-2.5 items-center gap-3 bg-gray-50 focus-within:border-[#DC143C] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search for Movies..."
                className="bg-transparent w-full outline-none text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // If Enter is pressed and results exist, select the first one
                    if (results && results.length > 0) {
                      handleSelectMovie(results[0].id);
                    }
                  }
                }}
              />
            </div>

            {/* Live Search Dropdown */}
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white mt-3 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50">
                {results.map((movie) => (
                  <div 
                    key={movie.id} 
                    onClick={() => handleSelectMovie(movie.id)} 
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-4 border-b border-gray-50 last:border-0"
                  >
                    <img src={movie.posterUrl} alt="" className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 uppercase truncate">{movie.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{movie.genre}</span>
                        <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5">
                           <Star size={10} fill="currentColor" /> {movie.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {!loading && user && user.email !== "anonymousUser" ? (
              <>
                <Link to="/mybookings" className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-[#DC143C] transition-all uppercase tracking-widest">
                  <Ticket size={18} />
                  My Bookings
                </Link>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900">{user.name || ' Hi Member!'}</p>
                  </div>
                  <button onClick={logout} className="text-xs font-black border-2 border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white transition-all uppercase">
                    LOGOUT
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="bg-[#DC143C] text-white text-xs font-black px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase tracking-widest">
                SIGN IN
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Slide Down) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full left-0 z-40 p-5">
          <div className="space-y-6">
            {/* Mobile Search */}
            <div className="relative">
              <div className="flex border border-gray-200 rounded-xl px-4 py-3 items-center gap-3 bg-gray-50">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="bg-transparent w-full outline-none text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && results.length > 0) {
                      handleSelectMovie(results[0].id);
                    }
                  }}
                />
              </div>
              {/* Mobile Dropdown Results */}
              {searchQuery.length > 1 && results.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-100 rounded-xl shadow-lg">
                   {results.map((movie) => (
                      <div key={movie.id} onClick={() => handleSelectMovie(movie.id)} className="p-3 border-b border-gray-50 flex items-center gap-3">
                        <img src={movie.posterUrl} className="w-8 h-10 object-cover rounded" alt="" />
                        <span className="text-xs font-bold uppercase truncate">{movie.title}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            {/* User Sections */}
            {!loading && user && user.email !== "anonymousUser" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Logged in as</p>
                    <p className="text-sm font-black text-gray-900">{user.name || 'Member'}</p>
                  </div>
                </div>
                
                <Link to="/mybookings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full p-3 font-black text-gray-600 uppercase text-xs tracking-widest">
                  <Ticket size={20} className="text-[#DC143C]" />
                  My Bookings
                </Link>

                <button onClick={() => {logout(); setIsMenuOpen(false);}} className="w-full border-2 border-gray-900 py-3 rounded-xl font-black text-xs uppercase">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => {setIsAuthOpen(true); setIsMenuOpen(false);}} className="w-full bg-[#DC143C] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100">
                Sign In to Account
              </button>
            )}
          </div>
        </div>
      )}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </nav>
  );
};

export default Navbar;