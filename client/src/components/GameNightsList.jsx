import Tooltip from "@mui/material/Tooltip";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

function GameNightsList({ reload }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gameNights, setGameNights] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGameNight, setEditingGameNight] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [allGameNights, setAllGameNights] = useState([]);

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
      setAllGameNights(data.data);
    } catch (error) {
      console.error("Failed to fetch game nights:", error);
    }
  };

  const handleSearch = () => {
    const query = searchTerm.toLowerCase();

    const filtered = gameNights.filter((gn) => {
      const title = gn.title?.toLowerCase() || "";
      const location = gn.location_type?.toLowerCase() || "";
      const game = gn.games?.[0]?.title?.toLowerCase() || "";
      const organizer = gn.organizer_username?.toLowerCase() || "";
      const attendees = gn.attendees
        .map((a) => a.username.toLowerCase())
        .join(" ");

      return (
        title.includes(query) ||
        location.includes(query) ||
        game.includes(query) ||
        organizer.includes(query) ||
        attendees.includes(query)
      );
    });

    setGameNights(filtered);
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

  const handleRSVP = async (gameNightId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/game_nights/${gameNightId}/rsvp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const updatedGameNights = gameNights.map((gn) => {
          if (gn.game_night_id === gameNightId) {
            const alreadyJoined = gn.attendees.some(
              (a) => a.user_id === currentUserId
            );
            let updatedAttendees;

            if (!alreadyJoined) {
              updatedAttendees = [
                ...gn.attendees,
                { user_id: currentUserId, username: "You" },
              ];
            } else {
              updatedAttendees = gn.attendees.filter(
                (a) => a.user_id !== currentUserId
              );
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

  const handleClearSearch = () => {
    setSearchTerm("");
    setGameNights(allGameNights);
  };

  useEffect(() => {
    fetchGameNights();
  }, [reload]);

  console.log("Game nights:", gameNights);

  return (
    <div className="game-list-box">
      <div className="game-search-bar">
        <input
          type="text"
          placeholder="Search by title, game, location, or attendee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            } else if (e.key === "Escape") {
              handleClearSearch();
            }
          }}
        />
        <button onClick={handleSearch} className="button-base">
          Search
        </button>

        <button onClick={handleClearSearch} className="clear-btn">
          Clear
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
              <th style={{ width: "30%" }}>Title</th>
              <th style={{ width: "15%" }}>Date</th>
              <th style={{ width: "15%" }}>Game</th>
              <th style={{ width: "10%" }}>Location</th>
              <th style={{ width: "15%" }}>Organizer</th>
              <th style={{ width: "15%" }}>RSVP</th>
            </tr>
          </thead>

          <tbody>
            {[...gameNights]
              .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
              .map((gn) => (
                <tr key={gn.game_night_id}>
                  <td>
                    <div>{gn.title}</div>
                    {gn.organizer_id === currentUserId && (
                      <div style={{ marginTop: "4px" }}>
                        <button
                          onClick={() => handleEdit(gn)}
                          style={{ marginRight: "6px" }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(gn.game_night_id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    {new Date(gn.event_date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                    <br />
                    {new Date(gn.event_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                    <br />
                    {new Date(gn.event_date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>

                  <td>
                    {gn.games && gn.games.length > 0 ? gn.games[0].title : "—"}
                  </td>
                  <td>
                    {gn.location_type === "online" ? "Online" : "In-Person"}
                  </td>
                  <td>{gn.organizer_username}</td>
                  <td>
                    <Tooltip
                      title={
                        gn.attendees.length > 0 ? (
                          <div>
                            {gn.attendees
                              .map((a) => a.username)
                              .sort((a, b) => a.localeCompare(b))
                              .map((name, index) => (
                                <div key={index}>{name}</div>
                              ))}
                          </div>
                        ) : (
                          "No attendees yet"
                        )
                      }
                      arrow
                      placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            maxWidth: 400,
                            padding: "12px 16px",
                            lineHeight: 1.6,
                            backgroundColor: "#3f9ddb",
                            color: "#fff",
                          },
                        },
                        arrow: {
                          sx: {
                            color: "#3f9ddb",
                          },
                        },
                      }}
                    >
                      <div
                        style={{
                          cursor: "help",
                          textDecoration: "underline dotted",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        <strong>{gn.attendees.length}</strong> attending
                      </div>
                    </Tooltip>

                    {gn.attendees.some((a) => a.user_id === currentUserId) ? (
                      <button onClick={() => handleRSVP(gn.game_night_id)}>
                        Cancel RSVP
                      </button>
                    ) : (
                      <button onClick={() => handleRSVP(gn.game_night_id)}>
                        RSVP
                      </button>
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
