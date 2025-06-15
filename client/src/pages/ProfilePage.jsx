import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // redirect to home if not logged in
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

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h1>Welcome, {user.username}</h1>
      <p>Email: {user.email}</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

export default ProfilePage;
