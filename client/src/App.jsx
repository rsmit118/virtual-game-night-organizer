import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import GameNightsPage from "./pages/GameNightsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <div>
      <nav style={{ margin: "10px" }}>
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/game-nights">Game Nights</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/game-nights" element={<GameNightsPage />} />
      </Routes>
    </div>
  );
}

export default App;
