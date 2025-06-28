import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [toastMessages, setToastMessages] = useState([]);
  const [exitingToastIndexes, setExitingToastIndexes] = useState([]);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  const { setAuth } = useContext(AuthContext);

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
        removeToast(id);
      }, 300);
    }, 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setFormUsername(data.username);
          setFormEmail(data.email);
        } else {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowEditForm(false);
      }
    };

    if (showEditForm) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showEditForm]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth({ username: null, userId: null });
    navigate("/");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPasswordForm(false);
      }
    };

    if (showPasswordForm) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordValid(true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPasswordForm]);

  const handleSave = async () => {
    if (!formUsername.trim() || !formEmail.trim()) {
      showToast("Username and email cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formUsername,
            email: formEmail,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowEditForm(false);
        showToast("Profile updated successfully.", "success");
      } else {
        const error = await response.json();
        if (
          error &&
          typeof error.message === "string" &&
          error.message.toLowerCase().includes("username")
        ) {
          showToast("That username is already taken.");
        } else {
          showToast(error.message || "Failed to update profile.");
        }
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("An error occurred while updating.");
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setShowEditForm(false);
    setFormUsername(user.username);
    setFormEmail(user.email);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Your passwords do not match.", true);
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      showToast(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        true
      );
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showToast("Password changed successfully.", "success");
        setShowPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(result.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      showToast("An error occurred.");
    }
  };

  if (!user) return <div className="profile-container">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-content-box">
          <nav className="profile-nav">
            <div className="nav-left">
              <NavLink to="/" end>
                Home
              </NavLink>
            </div>
            <div className="nav-right">
              <NavLink to="/game-nights">Game Nights</NavLink>
              <NavLink to="/profile" className="active">
                Profile
              </NavLink>
            </div>
          </nav>

          <h1 className="profile-title">Your Profile</h1>
          <p className="profile-description">
            View or update your account information.
          </p>

          <div className="profile-card">
            <>
              <div className="profile-sub-box">
                <p className="profile-info">
                  <span className="label">Username:</span>{" "}
                  <span className="value">{user.username}</span>
                </p>
              </div>
              <div className="profile-sub-box">
                <p className="profile-info">
                  <span className="label">Email:</span>{" "}
                  <span className="value">{user.email}</span>
                </p>
              </div>
              <div className="profile-sub-box profile-button-box">
                <div className="profile-buttons">
                  <button onClick={() => setShowEditForm(true)}>
                    Edit Info
                  </button>
                  <button onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </button>
                  <button className="logout-button" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditForm && (
          <motion.div
            className="profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.div
              className="profile-modal"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{
                scale: [0.8, 1.02, 0.98, 1],
                opacity: 1,
                y: 0,
                rotate: [0, 2, -2, 0],
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              exit={{
                scale: [1, 1.05, 0.8, 0],
                opacity: [1, 0.8, 0],
                rotate: [0, -3, 3, -10],
                y: [0, -10, 30],
                transition: { duration: 0.5, ease: "easeInOut" },
              }}
            >
              <h2 className="profile-modal-version">Edit Your Info</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ width: "calc(107% - 20px)", marginBottom: "18px" }}
                >
                  <label className="profile-input-label">
                    Change your username
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Username"
                    className="profile-input"
                  />
                </div>

                <div
                  style={{ width: "calc(107% - 20px)", marginBottom: "10px" }}
                >
                  <label className="profile-input-label">
                    Change your email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Email"
                    className="profile-input"
                  />
                </div>

                <div
                  className="profile-modal-buttons"
                  style={{ marginTop: "0px" }}
                >
                  <button
                    type="button"
                    className="profile-modal-back-button button-base"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="button-base"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPasswordForm && (
          <motion.div
            className="profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.div
              className="profile-modal"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{
                scale: [0.8, 1.02, 0.98, 1],
                opacity: 1,
                y: 0,
                rotate: [0, 2, -2, 0],
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              exit={{
                scale: [1, 1.05, 0.8, 0],
                opacity: [1, 0.8, 0],
                rotate: [0, -3, 3, -10],
                y: [0, -10, 30],
                transition: { duration: 0.5, ease: "easeInOut" },
              }}
            >
              <h2 className="profile-modal-version">Change Your Password</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChangePassword();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ width: "calc(107% - 20px)", marginBottom: "0" }}>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    className="profile-input"
                  />
                </div>

                <div
                  style={{
                    width: "calc(107% - 20px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginTop: "0",
                    marginBottom: "16px",
                  }}
                >
                  <small
                    className={`password-hint ${
                      !isPasswordValid ? "invalid" : ""
                    }`}
                  >
                    Must be at least 8 characters and include uppercase,
                    lowercase, number, and special character.
                  </small>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPassword(value);
                      setIsPasswordValid(passwordRegex.test(value));
                    }}
                    placeholder="New Password"
                    className="profile-input"
                  />
                </div>

                <div
                  style={{ width: "calc(107% - 20px)", marginBottom: "10px" }}
                >
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="profile-input"
                  />
                </div>

                <div
                  className="profile-modal-buttons"
                  style={{ marginTop: "0px" }}
                >
                  <button
                    type="button"
                    className="profile-modal-back-button button-base"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-base">
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  );
};

export default ProfilePage;
