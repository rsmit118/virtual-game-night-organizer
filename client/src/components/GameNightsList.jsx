import React, { useEffect, useState } from "react";

function GameNightsList() {
  const [gameNights, setGameNights] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGameNights = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/game_nights/report"
      );
      const data = await response.json();
      setGameNights(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/game_nights/search?title=${encodeURIComponent(
          searchTerm
        )}`
      );
      const data = await response.json();
      setGameNights(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game night?"))
      return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/game_nights/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh list
        fetchGameNights();
      } else {
        console.error("Failed to delete game night");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGameNights();
  }, []);

  return (
    <div>
      <h2>Game Nights Report</h2>
      <div>
        <input
          type="text"
          placeholder="Search by Title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Event Date</th>
            <th>Organizer ID</th>
            <th>Created At</th>
            <th>Actions</th> {/* Add Actions column */}
          </tr>
        </thead>
        <tbody>
          {gameNights.map((gn) => (
            <tr key={gn.game_night_id || gn.title + gn.event_date}>
              <td>{gn.title}</td>
              <td>{new Date(gn.event_date).toLocaleString()}</td>
              <td>{gn.organizer_id}</td>
              <td>{new Date(gn.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(gn.game_night_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GameNightsList;
