import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFilteredShows, getAllTheaters } from '../api';
import { FaMapMarkerAlt, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

const MovieSchedule = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    
    const [shows, setShows] = useState([]);
    const [availableCities, setAvailableCities] = useState(['All']);
    const [isListLoading, setIsListLoading] = useState(true); 
    
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCity, setSelectedCity] = useState('All');

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await getAllTheaters();
                const uniqueCities = ['All', ...new Set(res.data.map(t => t.city))];
                setAvailableCities(uniqueCities);
            } catch (err) { console.error(err); }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const fetchFilteredShows = async () => {
            setIsListLoading(true);
            try {
                const cityParam = selectedCity === 'All' ? null : selectedCity;
                const res = await getFilteredShows({
                    movieId,
                    city: cityParam,
                    date: selectedDate
                });
                setShows(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsListLoading(false);
            }
        };
        fetchFilteredShows();
    }, [movieId, selectedDate, selectedCity]);

    const dateOptions = useMemo(() => {
        return [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return {
                full: d.toISOString().split('T')[0],
                day: i === 0 ? "Today" : d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate()
            };
        });
    }, []);

    const groupedShows = useMemo(() => {
        return shows.reduce((acc, show) => {
            if (!acc[show.theaterName]) {
                acc[show.theaterName] = {
                    name: show.theaterName,
                    address: show.theaterAddress || 'Cinema Multiplex',
                    shows: []
                };
            }
            acc[show.theaterName].shows.push(show);
            return acc;
        }, {});
    }, [shows]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* STICKY HEADER */}
            <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 md:py-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                        {dateOptions.map((d) => (
                            <button
                                key={d.full}
                                onClick={() => setSelectedDate(d.full)}
                                className={`flex flex-col items-center min-w-[60px] md:min-w-[70px] py-3 md:py-4 rounded-2xl transition-all duration-300
                                    ${selectedDate === d.full ? 'bg-[#DC143C] text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter mb-1">{d.day}</span>
                                <span className="text-lg md:text-xl font-black">{d.date}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 w-full md:w-auto">
                        <FaMapMarkerAlt className="text-[#DC143C]" />
                        <select 
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-transparent font-black uppercase text-xs outline-none cursor-pointer text-gray-700 w-full md:min-w-[120px]"
                        >
                            {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* THEATER LISTINGS */}
            <div className="max-w-5xl mx-auto mt-6 md:mt-12 px-4">
                {isListLoading ? (
                    <div className="text-center py-20">
                         <div className="w-10 h-10 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Refreshing Shows...</p>
                    </div>
                ) : Object.keys(groupedShows).length > 0 ? (
                    Object.values(groupedShows).map((theater) => (
                        <div key={theater.name} className="bg-white rounded-3xl md:rounded-[40px] p-5 md:p-8 mb-6 border border-gray-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">{theater.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <FaMapMarkerAlt className="text-[#DC143C] text-[10px]" />
                                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{theater.address}</p>
                                    </div>
                                </div>
                                
                                {/* TIME SLOTS CONTAINER */}
                                <div className="flex flex-wrap gap-3 md:gap-4">
                                    {theater.shows.map((show) => (
                                        <button
                                            key={show.id}
                                            onClick={() => navigate(`/select-seats/${show.id}`)}
                                            className="group relative flex flex-col items-center justify-center min-w-[100px] md:min-w-[120px] border-2 border-gray-100 hover:border-[#DC143C] px-4 py-3 md:py-4 rounded-2xl transition-all duration-300 bg-white ring-offset-2 hover:ring-2 hover:ring-red-100"
                                        >
                                            {/* Pulsing indicator to show it's clickable */}
                                            <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DC143C]"></span>
                                            </div>

                                            <div className="text-sm md:text-base font-black text-gray-800 group-hover:text-[#DC143C] transition-colors">
                                                {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            
                                            {/* Hover "BOOK" hint */}
                                            <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-black text-gray-400 uppercase mt-1 group-hover:text-[#DC143C]">
                                                <span>{show.screenName}</span>
                                                <FaChevronRight className="hidden group-hover:block transition-all" />
                                            </div>
                                            
                                            {/* Visual Overlay */}
                                            <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 md:py-32 bg-white rounded-[30px] md:rounded-[60px] border-4 border-dashed border-gray-100">
                        <FaCalendarAlt className="text-gray-200 text-5xl mx-auto mb-6" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs md:text-sm px-6">No shows found, Please check on another date</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieSchedule;