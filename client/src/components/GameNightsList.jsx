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

      setGameNights(data.data);
    } catch (error) {
      console.error("Failed to fetch game nights:", error);
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

  const handleRSVP = async (gameNightId, isJoining) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/game_nights/${gameNightId}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
          body: JSON.stringify({ join: isJoining }),
        }
      );

      if (response.ok) {
        const updatedGameNights = gameNights.map((gn) => {
          if (gn.game_night_id === gameNightId) {
            const alreadyJoined = gn.attendees.some(
              (a) => a.user_id === currentUserId
            );
            let updatedAttendees;
            if (isJoining && !alreadyJoined) {
              updatedAttendees = [
                ...gn.attendees,
                { user_id: currentUserId, username: "You" },
              ];
            } else if (!isJoining && alreadyJoined) {
              updatedAttendees = gn.attendees.filter(
                (a) => a.user_id !== currentUserId
              );
            } else {
              updatedAttendees = gn.attendees;
            }
            return { ...gn, attendees: updatedAttendees };
          }
          return gn;
        });

        setGameNights(updatedGameNights);
      } else {
        console.error("Failed to RSVP");
      }
    } catch (err) {
      console.error("Error submitting RSVP:", err);
    }
  };

  const handleVote = async (gameId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/game_nights/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (!res.ok) throw new Error("Vote failed");

      fetchGameNights();
    } catch (err) {
      console.error("Voting error:", err.message);
    }
  };

  useEffect(() => {
    fetchGameNights();
  }, []);
  console.log("Game nights:", gameNights);

  return (
    <div className="game-list-box">
      <div className="game-search-bar">
        <input
          type="text"
          placeholder="Search by Title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} className="button-base">
          Search
        </button>
      </div>

      {editingGameNight && (
        <div className="game-edit-box">
          <h3>Edit Game Night</h3>
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
          <div className="game-edit-buttons">
            <button onClick={submitEdit} className="button-base">
              Save
            </button>
            <button
              onClick={() => setEditingGameNight(null)}
              className="button-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="game-table-wrapper">
        <table className="game-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Game</th>
              <th>Location</th>
              <th>Organizer</th>
              <th>RSVP</th>
              <th>Vote</th>
            </tr>
          </thead>

          <tbody>
            {gameNights.map((gn) => (
              <tr key={gn.game_night_id}>
                <td>{gn.title}</td>
                <td>{new Date(gn.event_date).toLocaleString()}</td>
                <td>
                  {gn.games && gn.games.length > 0 ? gn.games[0].title : "—"}
                </td>
                <td>
                  {gn.location_type === "online" ? "Online" : "In-Person"}
                </td>
                <td>{gn.organizer_username}</td>
                {gn.organizer_id === currentUserId ? (
                  <td>
                    <button onClick={() => handleEdit(gn)}>Edit</button>
                    <button onClick={() => handleDelete(gn.game_night_id)}>
                      Delete
                    </button>
                  </td>
                ) : (
                  <td></td>
                )}
                <td>
                  <div>
                    <strong>{gn.attendees.length}</strong> attending
                  </div>
                  {gn.attendees.some((a) => a.user_id === currentUserId) ? (
                    <button onClick={() => handleRSVP(gn.game_night_id, false)}>
                      Cancel RSVP
                    </button>
                  ) : (
                    <button onClick={() => handleRSVP(gn.game_night_id, true)}>
                      RSVP
                    </button>
                  )}
                </td>{" "}
                <td style={{ maxWidth: "220px", overflowWrap: "break-word" }}>
                  {gn.games && gn.games.length > 0 ? (
                    <ul style={{ paddingLeft: "1em", margin: 0 }}>
                      {gn.games.map((game) => (
                        <li key={game.id} style={{ marginBottom: "4px" }}>
                          <div style={{ fontSize: "0.85rem" }}>
                            {game.title} ({game.votes} votes)
                            <div>
                              <button onClick={() => handleVote(game.id)}>
                                👍 Vote
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, color: "#888" }}>
                      No games suggested.
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameNightsList;
