import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";

function CreateGameNightForm({ onGameNightCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    organizer_id: "",
  });

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    setFormData((prevData) => ({
      ...prevData,
      organizer_id: userId,
    }));
  }, []);

  function getUserIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token || token.split(".").length !== 3) {
      console.warn("Invalid or missing token:", token);
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      return decoded.userId;
    } catch (err) {
      console.error("Token decode failed:", err);
      return null;
    }
  }

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      console.log("Token being sent:", token);
      const response = await fetch("http://localhost:5000/api/game_nights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Game night created successfully!");
        setFormData({
          title: "",
          description: "",
          event_date: "",
          organizer_id: 1,
        });
        if (onGameNightCreated) {
          onGameNightCreated();
        }
      } else {
        setMessage(data.message || "Failed to create game night");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred");
    }
  };

  return (
    <div className="game-form-box">
      <h2 className="game-section-title">Create Game Night</h2>
      <form onSubmit={handleSubmit} className="game-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="event_date"
          value={formData.event_date}
          onChange={handleChange}
          required
        />
        <button type="submit" className="button-base">
          Create
        </button>
      </form>
      {message && <p className="game-message">{message}</p>}
    </div>
  );
}

export default CreateGameNightForm;
