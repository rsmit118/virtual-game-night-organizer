import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CreateGameNightForm({ onGameNightCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    event_date: null,
    organizer_id: "",
    location_type: "in-person",
    selected_game: "Diablo 4",
  });

  const [formError, setFormError] = useState("");

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

  const handleDateChange = (date) => {
    if (!date) return;

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const newDate = new Date(date);
    if (hours === 0 && minutes === 0) {
      newDate.setHours(21, 0, 0, 0);
    }

    setFormData({ ...formData, event_date: newDate });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.event_date) {
      setFormError("Please select a date and time.");
      return;
    } else {
      setFormError("");
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/game_nights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          event_date: formData.event_date
            ? formData.event_date.toISOString()
            : null,
          location_type: formData.location_type || "online",
          selected_game: formData.selected_game || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Game night created successfully!");
        setFormData({
          title: "",
          event_date: null,
          organizer_id: formData.organizer_id,
        });
        setFormError("");

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

  function getTodayAt9PM() {
    const now = new Date();
    now.setHours(21, 0, 0, 0);
    return now;
  }

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
        <DatePicker
          selected={formData.event_date || getTodayAt9PM()}
          value={formData.event_date ? undefined : ""}
          onChange={handleDateChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat="eeee, MMMM d, yyyy '@' h:mm aa"
          placeholderText={formError || "Select date and time"}
          className={formError ? "error" : ""}
          minDate={new Date()}
          portalId="datepicker-portal"
          popperContainer={({ children }) => <div>{children}</div>}
          popperClassName="custom-datepicker-popup"
          formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 3)}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          customInput={
            <input
              readOnly
              className={`custom-datepicker-input ${formError ? "error" : ""}`}
              placeholder={formError || "Select date and time"}
            />
          }
        />
        <div className="location-type-group">
          <label>Event Type:</label>
          <div>
            <label>
              <input
                type="radio"
                name="location_type"
                value="in-person"
                checked={formData.location_type === "in-person"}
                onChange={handleChange}
              />
              In-Person
            </label>
            <label>
              <input
                type="radio"
                name="location_type"
                value="online"
                checked={formData.location_type === "online"}
                onChange={handleChange}
              />
              Online
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="selected_game">Choose a Game:</label>
          <select
            name="selected_game"
            value={formData.selected_game || ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a game
            </option>
            <option value="Diablo 4">Diablo 4</option>
            <option value="Fortnite">Fortnite</option>
            <option value="League of Legends">League of Legends</option>
            <option value="Mario Kart World">Mario Kart World</option>
            <option value="Overwatch">Overwatch</option>
            <option value="Super Mario Party Jamboree">
              Super Mario Party Jamboree
            </option>
            <option value="World of Warcraft">World of Warcraft</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="button-base">
          Create
        </button>
      </form>
      {message && <p className="game-message">{message}</p>}
    </div>
  );
}

export default CreateGameNightForm;
