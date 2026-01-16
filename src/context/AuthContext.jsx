import React, { createContext, useState, useEffect, useContext } from "react";
import { checkMe, logout as apiLogout } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚡ 1. The "Single Source of Truth" check
  const refreshUser = async () => {
    try {
      const res = await checkMe(); // Automatically sends secure cookies
      setUser(res.data);
      console.log(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      await apiLogout(); // Tells Spring Boot to clear cookies
      setUser(null);
      // window.location.href = '/';
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ⚡ 2. Custom hook for easy access in any component
export const useAuth = () => useContext(AuthContext);
