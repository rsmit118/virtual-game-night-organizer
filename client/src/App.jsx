import React from "react";
import { Route, Routes } from "react-router-dom";
import GameNightsPage from "./pages/GameNightsPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game-nights" element={<GameNightsPage />} />
      </Routes>
    </div>
  );
}

export default App;
