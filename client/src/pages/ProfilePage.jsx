import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    navigate("/");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formUsername,
          email: formEmail,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowEditForm(false);
      } else {
        const error = await response.json();
        alert(error.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating.");
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setShowEditForm(false);
    setFormUsername(user.username);
    setFormEmail(user.email);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Password changed successfully.");
        setShowPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(result.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      alert("An error occurred.");
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

              {!showPasswordForm && (
                <div className="profile-sub-box profile-button-box">
                  <div className="profile-buttons">
                    <button
                      onClick={() => {
                        setShowEditForm(true);
                      }}
                    >
                      Edit Info
                    </button>
                    <button onClick={() => setShowPasswordForm(true)}>
                      Change Password
                    </button>
                    <button onClick={handleLogout}>Log Out</button>
                  </div>
                </div>
              )}
            </>

            {showPasswordForm && (
              <div className="profile-sub-box">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="profile-input"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="profile-input"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="profile-input"
                />
                <div className="profile-buttons">
                  <button onClick={handleChangePassword}>Submit</button>
                  <button onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
                  gap: "25px",
                }}
              >
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Username"
                  className="profile-input"
                />
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Email"
                  className="profile-input"
                />
                <div className="profile-modal-buttons">
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
    </div>
  );
};

export default ProfilePage;
