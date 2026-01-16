import { createContext, useState, useEffect, useContext } from "react";
import { getAllMovies, getAllTheaters } from '../api'; 

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Movies using the helper function
  const fetchMovies = async () => {
    try {
      const response = await getAllMovies(); // ⚡ Clean & Reusable
      setMovies(response.data); 
    } catch (error) {
      console.error("❌ Error fetching movies:", error);
    }
  };

  // 2. Fetch Theaters using the helper function
  const fetchTheaters = async () => {
    try {
      const response = await getAllTheaters(); // ⚡ Clean & Reusable
      setTheaters(response.data);
    } catch (error) {
      console.error("❌ Error fetching theaters:", error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      // Wait for both to finish
      await Promise.all([fetchMovies(), fetchTheaters()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  return (
    <DataContext.Provider value={{ 
        movies, 
        theaters, 
        loading, 
        refreshMovies: fetchMovies, 
        refreshTheaters: fetchTheaters 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};