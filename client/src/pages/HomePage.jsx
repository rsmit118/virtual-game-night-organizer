import React, { useEffect, useState } from "react";
import "./HomePage.css";

function HomePage() {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const resetRegisterForm = () => {
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRegisterModal(false);
        resetRegisterForm();
      }
    };

    if (showRegisterModal) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showRegisterModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
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

    setNameError("");
    setEmailError("");
    setPasswordError("");

    const errors = [];
    if (!registerName.trim()) errors.push("Username is required");
    if (!registerEmail.trim() || !/^\S+@\S+\.\S+$/.test(registerEmail))
      errors.push("Valid email is required");
    if (!registerPassword || registerPassword.length < 6)
      errors.push("Password must be at least 6 characters long");

    if (errors.length > 0) {
      if (errors.includes("Username is required"))
        setNameError("Username is required.");
      if (errors.includes("Valid email is required"))
        setEmailError("Valid email is required.");
      if (errors.includes("Password must be at least 6 characters long"))
        setPasswordError("Password must be at least 6 characters long.");
      return;
    }

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
        resetRegisterForm();
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);

        if (errorData.message) {
          setNameError(errorData.message);
        } else if (errorData.errors) {
          errorData.errors.forEach((err) => {
            if (err.msg.includes("Username")) setNameError(err.msg);
            if (err.msg.includes("email")) setEmailError(err.msg);
            if (err.msg.includes("Password")) setPasswordError(err.msg);
          });
        } else {
          setNameError("Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setNameError("An error occurred during registration.");
    }
  };

  return (
    <div className="home-container">
      <div className="home-content-box">
        <nav className="home-nav">
          <a href="/">Home</a>
          <a href="/game-nights">Game Nights</a>
        </nav>
        <h1 className="home-title">Welcome to Virtual Game Night Organizer!</h1>
        <p className="home-description">
          Plan, organize, and manage your game nights with ease. Create events,
          invite participants, and keep track of all your game night activities.
          Get started now by registering for an account or logging in.
        </p>

        <div className="auth-box">
          <div className="auth-sub-box">
            <h2>Log in</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit" className="home-button">
                Login
              </button>
            </form>
          </div>
          <p className="or">or</p>
          <div className="auth-sub-box">
            <h2>Make an Account</h2>
            <button
              type="button"
              className="home-button"
              onClick={() => setShowRegisterModal(true)}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="register-modal">
            <h2
              className="home-title"
              style={{ fontSize: "2rem", marginBottom: "10px" }}
            >
              Register an Account
            </h2>

            <input
              type="text"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              placeholder={nameError ? nameError : "Username"}
              className={nameError ? "input-error" : ""}
            />

            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder={emailError ? emailError : "Email"}
              className={emailError ? "input-error" : ""}
            />

            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder={passwordError ? passwordError : "Password"}
              className={passwordError ? "input-error" : ""}
            />

            <div className="modal-buttons">
              <button
                type="button"
                className="modal-back-button"
                onClick={() => {
                  setShowRegisterModal(false);
                  resetRegisterForm();
                }}
              >
                Back
              </button>

              <button type="button" onClick={handleRegister}>
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
