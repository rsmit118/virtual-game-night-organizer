import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CreateGameNightForm({ onGameNightCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    organizer_id: "",
    location_type: "online",
    selected_game: "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  function toUTCISOString(date) {
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    if (formData.event_date <= now) {
      setFormError("Please select a future time.");
      return;
    }

    if (!formData.event_date) {
      setFormError("Please select a date and time.");
      return;
    } else {
      setFormError("");
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/game_nights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            event_date: formData.event_date
              ? toUTCISOString(formData.event_date)
              : null,
            location_type: formData.location_type || "online",
            selected_game: formData.selected_game || null,
          }),
        }
      );

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
      <h2 className="game-section-title">Create Your Game Night</h2>
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
        {formError && (
          <p style={{ color: "red", marginTop: "-12px", fontSize: "1.2rem" }}>
            {formError}
          </p>
        )}

        <div className="game-event-row">
          <div className="game-select-group">
            <select
              id="selected_game"
              name="selected_game"
              value={formData.selected_game}
              onChange={handleChange}
              required
              className={`form-select${
                formData.selected_game === "" ? " placeholder" : ""
              }`}
            >
              <option value="" disabled hidden>
                Choose a game
              </option>
              <option value="Diablo 4 (D4)">Diablo 4 (D4)</option>
              <option value="Fortnite (FN)">Fortnite (FN)</option>
              <option value="League of Legends (LoL)">
                League of Legends (LoL)
              </option>
              <option value="Mario Kart World (MKW)">
                Mario Kart World (MKW)
              </option>
              <option value="Overwatch (OW)">Overwatch (OW)</option>
              <option value="Super Mario Party Jamboree (SMPJ)">
                Super Mario Party Jamboree (SMPJ)
              </option>
              <option value="World of Warcraft (WoW)">
                World of Warcraft (WoW)
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="event-type-group">
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
        <button type="submit" className="button-base">
          Create
        </button>
      </form>
      {message && <p className="game-message">{message}</p>}
    </div>
  );
}

export default CreateGameNightForm;
