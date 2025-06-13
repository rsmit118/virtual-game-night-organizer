import React from "react";
import CreateGameNightForm from "../components/CreateGameNightForm";
import GameNightsList from "../components/GameNightsList";

function GameNightsPage() {
  return (
    <div>
      <h1>Game Nights</h1>
      <CreateGameNightForm />
      <GameNightsList />
    </div>
  );
}

export default GameNightsPage;
