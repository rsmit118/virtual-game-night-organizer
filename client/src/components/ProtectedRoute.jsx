import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { username, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!username) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
