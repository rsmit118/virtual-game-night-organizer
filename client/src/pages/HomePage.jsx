import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        window.location.href = "/game-nights";
      } else {
        console.error("Login failed");
        alert("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      alert("An error occurred during login.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        alert("Registration successful! You can now log in.");
        setShowRegisterModal(false);
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);

        // Show specific message if available
        if (errorData.message) {
          alert(`Registration failed: ${errorData.message}`);
        } else if (errorData.errors) {
          alert(
            `Registration failed: ${errorData.errors
              .map((err) => err.msg)
              .join(", ")}`
          );
        } else {
          alert("Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error during registration:", err);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className="home-container">
      <div className="home-content-box">
        <h1 className="home-title">Welcome to Virtual Game Night Organizer!</h1>
        <p className="home-description">
          Plan, organize, and manage your game nights with ease. Create events,
          invite participants, and keep track of all your game night activities.
          Get started now by registering for an account or logging in.
        </p>

        <div className="auth-box">
          <div className="auth-sub-box">
            <h2>Need to register?</h2>
            <button
              type="button"
              className="home-button"
              onClick={() => setShowRegisterModal(true)}
            >
              Register
            </button>
          </div>
          <div className="auth-sub-box">
            <h2>Already have an account?</h2>
            <div className="login-form">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="home-button"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <div className="register-modal">
          <div className="register-modal-content">
            <h2>Register an Account</h2>
            <input
              type="text"
              placeholder="Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />

            <button className="home-button" onClick={handleRegister}>
              Register
            </button>
            <button
              className="home-button"
              onClick={() => setShowRegisterModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
