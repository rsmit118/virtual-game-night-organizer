import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CreateGameNightForm from "../components/CreateGameNightForm";
import GameNightsList from "../components/GameNightsList";
import { AuthContext } from "../context/AuthContext";

import "./GameNightsPage.css";

function GameNightsPage() {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reloadList, setReloadList] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate("/");
    }
  }, [username, navigate]);

  const handleGameNightCreated = () => {
    setReloadList((prev) => !prev);
  };

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

        <h2 className="profile-title">Game Night Planner</h2>
        <div className="user-badge">
          <span className="username-highlight">{username}</span>
        </div>
        <p className="profile-description">
          Fill in the form below to plan your next event.
        </p>
        <CreateGameNightForm onGameNightCreated={handleGameNightCreated} />
      </div>

      <div className="game-nights-content-box">
        <h2 className="profile-title">Game Night Report</h2>
        <p className="profile-description">
          View and manage your scheduled game nights.
        </p>
        <GameNightsList reload={reloadList} />
      </div>
    </div>
  );
}

export default GameNightsPage;
