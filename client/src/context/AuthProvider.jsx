import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ username: "", userId: null });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuth({
          username: decoded.username,
          userId: decoded.userId,
        });
      } catch (err) {
        console.error("Token decode failed", err);
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
