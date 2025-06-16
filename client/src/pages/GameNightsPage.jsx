import React from "react";
import { NavLink } from "react-router-dom";
import CreateGameNightForm from "../components/CreateGameNightForm";
import GameNightsList from "../components/GameNightsList";
import "./GameNightsPage.css";

function GameNightsPage() {
  return (
    <div className="game-nights-container">
      <div className="game-nights-content-box">
        <nav className="game-nav">
          <div className="nav-left">
            <NavLink to="/" end>
              Home
            </NavLink>
          </div>
          <div className="nav-right">
            <NavLink to="/game-nights" className="active">
              Game Nights
            </NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </div>
        </nav>

        <h1 className="profile-title">Game Nights</h1>
        <p className="profile-description">
          Create and manage your upcoming game nights.
        </p>

        <CreateGameNightForm />
        <GameNightsList />
      </div>
    </div>
  );
}

export default GameNightsPage;
