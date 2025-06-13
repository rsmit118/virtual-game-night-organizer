import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/game-nights");
  };

  return (
    <div>
      <h1>Login</h1>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default LoginPage;
