import Tooltip from "@mui/material/Tooltip";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function GameNightsList({ reload }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gameNights, setGameNights] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGameNight, setEditingGameNight] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [allGameNights, setAllGameNights] = useState([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

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
        `${import.meta.env.VITE_API_BASE_URL}/api/game_nights/report`
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

    const filtered = allGameNights.filter((gn) => {
      const title = gn.title?.toLowerCase() || "";
      const location = gn.location_type?.toLowerCase() || "";
      const game = gn.games?.[0]?.title?.toLowerCase() || "";
      const organizer = gn.organizer_username?.toLowerCase() || "";
      const attendees = gn.attendees
        .map((a) => (a.username || "").toLowerCase())
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
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/game_nights/${id}`,
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
    setEditDate(new Date(fixedGameNight.event_date));
  };

  function toUTCISOString(date) {
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString();
  }

  const submitEdit = async () => {
    try {
      console.log("EditingGameNight object:", editingGameNight);
      console.log("Editing ID:", editingGameNight.game_night_id);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/game_nights/${
          editingGameNight.game_night_id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: editTitle,
            event_date: editDate ? toUTCISOString(editDate) : null,
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
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/game_nights/${gameNightId}/rsvp`,
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

  function getTimeUntil(eventDate) {
    const now = new Date();
    const target = new Date(eventDate);
    const diff = target - now;

    if (diff <= 0) return { text: "Already started", isToday: false };

    const isSameDay = now.toDateString() === target.toDateString();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let text = "";
    if (days > 0) {
      text = `Starts in ${days} day${days !== 1 ? "s" : ""}`;
    } else if (hours > 0) {
      text = `Starts in ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      text = `Starts in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else {
      text = "Starts soon";
    }

    return { text, isToday: isSameDay };
  }

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

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
          <div style={{ width: "100%" }}>
            <DatePicker
              selected={new Date(editDate)}
              onChange={(date) => setEditDate(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              minTime={
                editDate && isToday(editDate)
                  ? new Date()
                  : new Date(0, 0, 0, 0, 0)
              }
              maxTime={new Date(0, 0, 0, 23, 59)}
              className="custom-datepicker-input"
              wrapperClassName="datepicker-wrapper"
              popperPlacement="top"
            />
          </div>

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
              <th style={{ width: "30%" }}>Event Name</th>
              <th style={{ width: "15%" }}>Date</th>
              <th style={{ width: "15%" }}>Game</th>
              <th style={{ width: "10%" }}>Location</th>
              <th style={{ width: "15%" }}>Host</th>
              <th style={{ width: "15%" }}>RSVP</th>
            </tr>
          </thead>

          <tbody>
            {[...gameNights]
              .sort((a, b) => {
                const now = new Date();
                const aDate = new Date(a.event_date);
                const bDate = new Date(b.event_date);

                const aIsPast = aDate <= now;
                const bIsPast = bDate <= now;

                if (aIsPast && !bIsPast) return 1;
                if (!aIsPast && bIsPast) return -1;

                return aDate - bDate;
              })
              .map((gn) => (
                <tr
                  key={gn.game_night_id}
                  className={
                    new Date(gn.event_date) <= new Date()
                      ? "past-event-row"
                      : ""
                  }
                >
                  <td>
                    <div>{gn.title}</div>
                    {gn.organizer_id === currentUserId &&
                      new Date(gn.event_date) > new Date() && (
                        <div style={{ marginTop: "4px" }}>
                          <button
                            className="game-button"
                            onClick={() => handleEdit(gn)}
                            style={{ marginRight: "6px" }}
                          >
                            Edit
                          </button>
                          <div className="delete-button-wrapper">
                            <button
                              className="game-button delete-button"
                              onClick={() =>
                                setConfirmingDeleteId(gn.game_night_id)
                              }
                            >
                              Delete
                            </button>

                            {confirmingDeleteId === gn.game_night_id && (
                              <div className="popover-confirm">
                                <p>Are you sure?</p>
                                <div className="popover-buttons">
                                  <button
                                    className="game-button"
                                    onClick={() => {
                                      handleDelete(gn.game_night_id);
                                      setConfirmingDeleteId(null);
                                    }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className="game-button"
                                    onClick={() => setConfirmingDeleteId(null)}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
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
                    <br />
                    {(() => {
                      const { text, isToday } = getTimeUntil(gn.event_date);
                      return (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: isToday ? "#00cc66" : "#ccc",
                            fontWeight: isToday ? "bold" : "normal",
                          }}
                        >
                          {text}
                        </span>
                      );
                    })()}
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

                    {new Date(gn.event_date) > new Date() &&
                      (gn.attendees.some((a) => a.user_id === currentUserId) ? (
                        <button
                          className="game-button"
                          onClick={() => handleRSVP(gn.game_night_id)}
                        >
                          Cancel RSVP
                        </button>
                      ) : (
                        <button
                          className="game-button"
                          onClick={() => handleRSVP(gn.game_night_id)}
                        >
                          RSVP
                        </button>
                      ))}
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
