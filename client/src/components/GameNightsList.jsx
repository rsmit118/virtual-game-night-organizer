import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

function GameNightsList() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gameNights, setGameNights] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGameNight, setEditingGameNight] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setCurrentUserId(null);
      }
    }
  }, []);

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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchGameNights();
      } else {
        console.error("Failed to delete game night");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (gameNight) => {
    const fixedGameNight = {
      ...gameNight,
      game_night_id: gameNight.game_night_id || gameNight.id,
    };

    setEditingGameNight(fixedGameNight);
    setEditTitle(fixedGameNight.title);
    setEditDate(new Date(fixedGameNight.event_date).toISOString().slice(0, 16));
  };

  const submitEdit = async () => {
    try {
      console.log("EditingGameNight object:", editingGameNight);
      console.log("Editing ID:", editingGameNight.game_night_id);

      const response = await fetch(
        `http://localhost:5000/api/game_nights/${editingGameNight.game_night_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: editTitle,
            event_date: editDate,
            organizer_id: currentUserId,
          }),
        }
      );

      if (response.ok) {
        setEditingGameNight(null);
        fetchGameNights();
      } else {
        console.error("Failed to update game night");
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
      {editingGameNight && (
        <div>
          <h3>Editing Game Night</h3>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
          />
          <input
            type="datetime-local"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
          <button onClick={submitEdit}>Save</button>
          <button onClick={() => setEditingGameNight(null)}>Cancel</button>
        </div>
      )}

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
                {gn.organizer_id === currentUserId ? (
                  <>
                    <button onClick={() => handleEdit(gn)}>Edit</button>
                    <button onClick={() => handleDelete(gn.game_night_id)}>
                      Delete
                    </button>
                  </>
                ) : (
                  <em>Not yours</em>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GameNightsList;
