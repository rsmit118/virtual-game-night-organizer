import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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
  const [toastMessages, setToastMessages] = useState([]);
  const [exitingToastIndexes, setExitingToastIndexes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const resetRegisterForm = () => {
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
  };

  const removeToast = (id) => {
    setToastMessages((prev) => prev.filter((msg) => msg.id !== id));
    setExitingToastIndexes((prev) => prev.filter((eid) => eid !== id));
  };

  const showToast = (message, type = "error") => {
    if (toastMessages.some((msg) => msg.text === message)) return;

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, text: message, type };

    setToastMessages((prev) => [...prev, newToast]);

    setTimeout(() => {
      setExitingToastIndexes((prev) => [...prev, id]);
      setTimeout(() => {
        setToastMessages((prev) => prev.filter((msg) => msg.id !== id));
        setExitingToastIndexes((prev) => prev.filter((eid) => eid !== id));
      }, 300);
    }, 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRegisterModal(false);
      }
    };

    if (showRegisterModal) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showRegisterModal]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!showRegisterModal) {
      const timeout = setTimeout(() => {
        resetRegisterForm();
      }, 500);
      return () => clearTimeout(timeout);
    }
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
        console.log("Received token:", data.token);
        console.log("Login response JSON:", data);
        localStorage.setItem("token", data.token);
        console.log("Login successful:", data);
        window.location.href = "/game-nights";
      } else {
        console.error("Login failed");
        showToast("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      showToast("An error occurred during login.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

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
      errors.forEach((err) => showToast(err));
      setIsSubmitting(false);
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
        showToast("Registration successful! You can now log in.", "success");
        setShowRegisterModal(false);
        resetRegisterForm();
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);

        if (errorData.message) {
          if (errorData.message.includes("Username")) {
            setNameError(errorData.message);
          }
          if (errorData.message.includes("Email")) {
            setEmailError(errorData.message);
          }
          showToast(errorData.message);
        } else if (errorData.errors) {
          errorData.errors.forEach((err) => {
            if (err.msg.includes("Username")) setNameError(err.msg);
            if (err.msg.includes("email")) setEmailError(err.msg);
            if (err.msg.includes("Password")) setPasswordError(err.msg);
            showToast(err.msg);
          });
        } else {
          setNameError("Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setNameError("An error occurred during registration.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="home-content-box">
          <nav className="home-nav">
            <div className="nav-left">
              <NavLink to="/" end>
                Home
              </NavLink>
            </div>
            <div className="nav-right">
              <NavLink to="/game-nights">Game Nights</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </div>
          </nav>
          <h1 className="home-title">
            Welcome to Virtual Game Night Organizer
          </h1>
          <p className="home-description">
            Plan, organize, and manage your game nights with ease. Create
            events, invite participants, and keep track of all your game night
            activities. Get started now by registering for an account or logging
            in.
          </p>

          {user ? (
            <div className="auth-box logged-in-box">
              <div className="auth-sub-box logged-in-sub-box">
                <h2>Welcome back, {user.username}!</h2>
                <p>You’re logged in and ready to go.</p>
                <div className="full-width-buttons">
                  <NavLink
                    to="/game-nights"
                    className="home-button button-base"
                  >
                    Go to Game Nights
                  </NavLink>
                  <NavLink to="/profile" className="home-button button-base">
                    Profile
                  </NavLink>
                  <button
                    className="home-button button-base logout-button"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
                  <button type="submit" className="home-button button-base">
                    Login
                  </button>
                </form>
              </div>
              <p className="or">or</p>
              <div className="auth-sub-box">
                <h2>Make an Account</h2>
                <button
                  type="button"
                  className="home-button button-base"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
        {toastMessages.map((msg) => (
          <div
            key={msg.id}
            className={`true-toast ${
              msg.type === "success" ? "toast-success" : ""
            } ${exitingToastIndexes.includes(msg.id) ? "toast-exit" : ""}`}
            role="alert"
            onClick={() => {
              setExitingToastIndexes((prev) => [...prev, msg.id]);
              setTimeout(() => removeToast(msg.id), 300);
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "1.25rem" }}>⚠️</span>
            {msg.text}
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.div
              className="register-modal"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{
                scale: [0.8, 1.02, 0.98, 1],
                opacity: 1,
                y: 0,
                rotate: [0, 2, -2, 0],
                transition: {
                  duration: 0.4,
                  ease: "easeOut",
                },
              }}
              exit={{
                scale: [1, 1.05, 0.8, 0],
                opacity: [1, 0.8, 0],
                rotate: [0, -3, 3, -10],
                y: [0, -10, 30],
                transition: {
                  duration: 0.5,
                  ease: "easeInOut",
                },
              }}
            >
              <h2 className="home-title modal-version">Register an Account</h2>
              <form
                onSubmit={handleRegister}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "25px",
                }}
              >
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
                    className="modal-back-button button-base"
                    onClick={() => {
                      setShowRegisterModal(false);
                    }}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="button-base"
                  >
                    Register
                  </button>
                </div>{" "}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;
