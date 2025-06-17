import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ username: "", userId: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuth({ username: decoded.username, userId: decoded.userId });
      } catch {
        console.error("Invalid token in AuthProvider");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
