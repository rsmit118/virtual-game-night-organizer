import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        setEditMode(false);
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
    setFormUsername(user.username);
    setFormEmail(user.email);
    setEditMode(false);
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
            {editMode ? (
              <div className="profile-sub-box">
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
                <div className="profile-buttons">
                  <button onClick={handleSave} disabled={isSubmitting}>
                    Save
                  </button>
                  <button onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
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
                      <button onClick={() => setEditMode(true)}>
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
            )}

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
    </div>
  );
};

export default ProfilePage;
