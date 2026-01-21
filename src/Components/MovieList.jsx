import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useData } from "../context/DataContext"; 
import { FaStar, FaGlobe, FaFilter } from "react-icons/fa";

const MovieList = () => {
  const { movies, loading } = useData();
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");

  // Converts string or number minutes to Hours and Minutes
  const formatDuration = (durationInput) => {
    if (!durationInput) return "N/A";
    // This turns "151 min" into "151"
    const cleanedInput = durationInput.toString().replace(/\D/g, "");
    const totalMinutes = Number(cleanedInput);
    // If after cleaning we still don't have a valid number
    if (isNaN(totalMinutes) || totalMinutes <= 0) return "N/A";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // ⚡ Dynamic Genre Extraction
  const genres = useMemo(() => {
    if (!movies || movies.length === 0) return ["All"];
    const genreSet = new Set();
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(",").forEach(g => genreSet.add(g.trim()));  //trim() extra space remove kr deta hai 
    }});
    return ["All", ...Array.from(genreSet).sort()];
  }, [movies]);

  // ⚡ Dynamic Language Extraction
  const languages = useMemo(() => {
    if (!movies || movies.length === 0) return ["All"];
    const langSet = new Set();
    movies.forEach(movie => {
      if (movie.language) {
        movie.language.split(",").forEach(l => langSet.add(l.trim()));
      }
    });
    return ["All", ...Array.from(langSet).sort()];
  }, [movies]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <h2 className="text-xl font-black text-gray-300 animate-pulse tracking-widest uppercase">
        Loading Cinema...
      </h2>
    </div>
  );

  // ⚡ Combined Filter Logic
  const filteredMovies = movies.filter((movie) => {
    const matchesGenre = activeGenre === "All" || movie.genre?.includes(activeGenre);
    const matchesLang = activeLanguage === "All" || movie.language?.includes(activeLanguage);
    return matchesGenre && matchesLang;
  });

  return (
    <div className="w-[92%] md:w-[90%] lg:w-[85%] mx-auto mt-16 mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <h2 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
          Now <span className="text-red-500">Showing</span>
        </h2>
        
        {/* Mobile Clear Filters (Visible only when filters active) */}
        {(activeGenre !== "All" || activeLanguage !== "All") && (
          <button 
            onClick={() => { setActiveGenre("All"); setActiveLanguage("All"); }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full w-fit"
          >
            Clear All Filters ×
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* SIDEBAR FILTERS */}
        <aside className="w-full md:w-60 space-y-10">
          {/* Genre Filter */}
          <div>
            <h3 className="flex items-center gap-2 text-[11px] font-black mb-5 text-gray-400 uppercase tracking-[0.2em]">
              <FaFilter className="text-red-500" /> Filter By Genre
            </h3>
            <div className="flex flex-wrap md:flex-col gap-2">
              {genres.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveGenre(cat)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-wider
                    ${activeGenre === cat
                      ? "bg-red-500 text-white shadow-lg shadow-red-200"
                      : "bg-white text-gray-500 border border-gray-100 hover:border-red-200 hover:text-red-500"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Language Filter */}
          <div>
            <h3 className="flex items-center gap-2 text-[11px] font-black mb-5 text-gray-400 uppercase tracking-[0.2em]">
              <FaGlobe className="text-red-500" /> Language
            </h3>
            <div className="flex flex-wrap md:flex-col gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-wider
                    ${activeLanguage === lang
                      ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                      : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-black"
                    }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MOVIE GRID */}
        <div className="flex-1">
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredMovies.map((movie) => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="group flex flex-col">
                  {/* Poster Container */}
                  <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-2/3 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300x450?text=No+Poster")}
                    />
                    
                    {/* Floating Info */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                      <FaStar className="text-yellow-400 text-[10px]" />
                      <span className="text-white text-[11px] font-black">{movie.rating || "N/A"}</span>
                    </div>

                    {/* Language Tag */}
                    <div className="absolute bottom-4 left-4">
                       <span className="bg-white/90 backdrop-blur-md text-black text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-sm">
                         {movie.language?.split(",")[0]}
                       </span>
                    </div>

                    {/* Hover Button */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                       <div className="w-full bg-red-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-xl">
                          View Details
                       </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-5 px-1">
                    <h3 className="font-black text-gray-900 group-hover:text-red-600 transition-colors text-lg leading-tight line-clamp-1">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         {movie.genre?.split(",")[0]}
                       </span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-[10px] font-bold text-gray-400">
                         {formatDuration(movie.duration)}
                       </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-gray-50 rounded-[40px] px-10 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <FaFilter className="text-gray-200 text-4xl" />
                </div>
                <h3 className="text-gray-900 font-black uppercase tracking-tighter text-xl">No Matches Found</h3>
                <p className="text-gray-400 text-sm font-medium mt-1">Try adjusting your genre or language filters</p>
                <button 
                  onClick={() => { setActiveGenre("All"); setActiveLanguage("All"); }}
                  className="mt-6 text-[10px] font-black text-red-500 uppercase tracking-widest border-b-2 border-red-500 pb-1"
                >
                  Reset Filters
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieList;