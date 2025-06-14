import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import GameNightsPage from "./pages/GameNightsPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/game-nights">Game Nights</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game-nights" element={<GameNightsPage />} />
      </Routes>
    </div>
  );
}

export default App;
