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

        <h2 className="profile-title">Create Game Night</h2>
        <p className="profile-description">
          Fill in the form below to plan your next event.
        </p>
        <CreateGameNightForm />
      </div>

      <div className="game-nights-content-box">
        <h2 className="profile-title">Game Nights Report</h2>
        <p className="profile-description">
          View and manage your scheduled game nights.
        </p>
        <GameNightsList />
      </div>
    </div>
  );
}

export default GameNightsPage;
