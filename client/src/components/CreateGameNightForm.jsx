import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CreateGameNightForm({ onGameNightCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: null,
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

  const handleDateChange = (date) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setHours(21);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    setFormData({ ...formData, event_date: newDate });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/game_nights", {
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
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Game night created successfully!");
        setFormData({
          title: "",
          description: "",
          event_date: new Date(),
          organizer_id: formData.organizer_id,
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
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <DatePicker
          selected={formData.event_date}
          onChange={handleDateChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat="eeee, MMMM d, yyyy '@' h:mm aa"
          placeholderText="Select date and time"
          minDate={new Date()}
          portalId="datepicker-portal"
          popperContainer={({ children }) => <div>{children}</div>}
          popperClassName="custom-datepicker-popup"
          formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 3)}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          openToDate={getTodayAt9PM()}
          customInput={<input className="custom-datepicker-input" readOnly />}
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
