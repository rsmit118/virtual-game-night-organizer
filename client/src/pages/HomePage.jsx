import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      <div className="home-content-box">
        <h1 className="home-title">Welcome to Virtual Game Night Organizer!</h1>

        <p className="home-description">
          Plan, organize, and manage your game nights with ease. Create events,
          invite participants, and keep track of all your game night activities.
          Get started now by registering for an account or logging in.
        </p>
        <div className="home-buttons">
          <Link to="/register" className="home-button">
            Register
          </Link>
          <Link to="/login" className="home-button">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
