import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import { FaStar, FaClock, FaLanguage, FaTicketAlt } from "react-icons/fa";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

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

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id || id === "undefined") return;
      try {
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (!movie)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <div className="relative h-auto lg:h-[550px] w-full overflow-hidden bg-gray-900">
        {/* Background Blur Poster */}
        <img
          src={movie.posterUrl}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-20"
          alt="backdrop"
        />
        {/* Gradient Overlay for Desktop readability */}
        <div className="absolute inset-0 bg-linear-to-t from-white via-white/5 to-transparent lg:block hidden"></div>

        <div className="relative z-10 w-[92%] md:w-[85%] mx-auto h-full flex flex-col lg:flex-row items-center lg:items-end gap-10 py-10 lg:pb-16">
          {/* Main Poster */}
          <img
            src={
              movie.posterUrl ||
              "https://via.placeholder.com/300x450?text=No+Poster"
            }
            alt={movie.title}
            className="w-48 md:w-64 h-72 md:h-96 rounded-2xl object-cover shadow-2xl border-4 border-white shrink-0"
          />

          {/* Quick Info & CTA Container */}
          <div className="flex-1 flex flex-col lg:flex-row justify-between items-center lg:items-end w-full gap-8">
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4">
                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Now Showing
                </span>
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white lg:text-gray-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <FaStar className="text-yellow-500" /> {movie.rating || "N/A"}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white lg:text-gray-900 uppercase tracking-tighter mb-4 leading-none">
                {movie.title}
              </h1>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm font-bold text-gray-400 lg:text-gray-600">
                <div className="flex items-center gap-2">
                  {/* ✅ Uses formatDuration to turn "150" into "2h 30m" */}
                  
                  <FaClock className="text-red-500" />{" "}
                  {formatDuration(movie.duration)}
                </div>
                <div className="flex items-center gap-2">
                  <FaLanguage className="text-red-500" /> {movie.language}
                </div>
                <div className="text-red-500 uppercase tracking-widest text-xs font-black">
                  {movie.genre}
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="bg-white p-6 md:p-8 rounded-4xl shadow-2xl border border-gray-100 text-center w-full max-w-[320px] lg:mb-0 mb-4 z-20">
              <div className="hidden lg:flex bg-red-100 w-12 h-12 rounded-full items-center justify-center mx-auto mb-4">
                <FaTicketAlt className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-1">
                Ready to Watch?
              </h3>
              <p className="text-[10px] text-gray-500 mb-6 font-bold uppercase tracking-widest">
                Pick a Theater & Show
              </p>

              <button
                onClick={() => navigate(`/book/${movie.id}`)}
                className="w-full bg-[#DC143C] text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-red-700 transition-all transform active:scale-95"
              >
                Book Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SYNOPSIS SECTION */}
      <div className="w-[92%] md:w-[85%] mx-auto mt-16 pb-20">
        <div className="max-w-3xl">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4 border-l-4 border-red-500 pl-4">
            The Synopsis
          </h2>
          <p className="text-gray-500 leading-relaxed text-lg italic mb-10">
            {movie.plot ||
              "No description available for this cinematic masterpiece."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Director
              </h3>
              <p className="font-bold text-gray-800 text-lg leading-tight">
                {movie.director || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Starring
              </h3>
              <p className="font-bold text-gray-800 text-lg leading-snug">
                {movie.actors || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
