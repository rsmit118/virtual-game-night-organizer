import React, { useState } from "react";

function CreateGameNightForm({ onGameNightCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    organizer_id: 1,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/game_nights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div>
      <h2>Create Game Night</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="event_date"
          value={formData.event_date}
          onChange={handleChange}
        />
        <input
          type="number"
          name="organizer_id"
          placeholder="Organizer ID"
          value={formData.organizer_id}
          onChange={handleChange}
        />
        <button type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateGameNightForm;
