const express = require("express");
const router = express.Router();
const pool = require("../db");
const { body, validationResult } = require("express-validator");
const authorize = require("../middleware/authorize");
const db = require("../db");

router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("event_date")
      .notEmpty()
      .withMessage("Event date is required")
      .isISO8601()
      .withMessage("Event date must be a valid date"),
    body("organizer_id").isInt().withMessage("Organizer ID must be an integer"),
  ],
  authorize,
  async (req, res) => {
    try {
      if (req.user.userId !== req.body.organizer_id) {
        return res.status(403).json({ message: "User ID mismatch" });
      }
      const { title, event_date, organizer_id, selected_game, location_type } =
        req.body;

      const query = `
  INSERT INTO game_nights (title, event_date, organizer_id, location_type)
  VALUES ($1, $2, $3, $4)
  RETURNING game_night_id
`;

      const result = await db.query(query, [
        title,
        event_date,
        organizer_id,
        location_type,
      ]);

      const gameNightId = result.rows[0].game_night_id;

      await db.query(
        `INSERT INTO game_night_attendees (game_night_id, user_id) VALUES ($1, $2)`,
        [gameNightId, organizer_id]
      );

      if (selected_game) {
        await db.query(
          `INSERT INTO game_night_games (game_night_id, title) VALUES ($1, $2)`,
          [gameNightId, selected_game]
        );
      }

      res.status(201).json({ message: "Game night created" });
    } catch (err) {
      console.error("Failed to create game night:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM game_nights ORDER BY event_date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/:id", authorize, async (req, res) => {
  const { id } = req.params;
  const { title, event_date, organizer_id } = req.body;

  try {
    const result = await pool.query(
      "SELECT organizer_id FROM game_nights WHERE game_night_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = result.rows[0];

    if (event.organizer_id !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this event." });
    }

    await pool.query(
      "UPDATE game_nights SET title = $1, event_date = $2, organizer_id = $3 WHERE game_night_id = $4",
      [title, event_date, organizer_id, id]
    );

    res.status(200).json({ message: "Event updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/:id", authorize, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM game_nights WHERE game_night_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Game night not found" });
    }

    const gameNight = result.rows[0];
    if (gameNight.organizer_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await pool.query("DELETE FROM game_nights WHERE game_night_id = $1", [id]);
    res.json({ message: "Game night deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/search", async (req, res) => {
  const { title } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM game_nights WHERE LOWER(title) LIKE LOWER($1) ORDER BY event_date DESC",
      [`%${title}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/report", async (req, res) => {
  try {
    const gameNightsRes = await pool.query(`
      SELECT 
        gn.game_night_id,
        gn.title,
        gn.event_date,
        gn.organizer_id,
        gn.location_type,
        gn.created_at,
        u.username AS organizer_username
      FROM game_nights gn
      LEFT JOIN users u ON gn.organizer_id = u.user_id
      ORDER BY gn.event_date DESC
    `);

    const gameNightIds = gameNightsRes.rows.map((row) => row.game_night_id);

    const attendeesRes = await pool.query(
      `
  SELECT 
    gna.game_night_id,
    u.user_id AS user_id,
    u.username
  FROM game_night_attendees gna
  JOIN users u ON gna.user_id = u.user_id
  WHERE gna.game_night_id = ANY($1)
`,
      [gameNightIds]
    );

    const gamesRes = await pool.query(
      `
  SELECT 
    id, 
    game_night_id, 
    title
  FROM game_night_games
  WHERE game_night_id = ANY($1)
  `,
      [gameNightIds]
    );

    const gamesMap = {};
    for (const game of gamesRes.rows) {
      if (!gamesMap[game.game_night_id]) {
        gamesMap[game.game_night_id] = [];
      }
      gamesMap[game.game_night_id].push({
        id: game.id,
        title: game.title,
      });
    }

    const attendeesMap = {};
    for (const row of attendeesRes.rows) {
      if (!attendeesMap[row.game_night_id]) {
        attendeesMap[row.game_night_id] = [];
      }
      attendeesMap[row.game_night_id].push({
        user_id: row.user_id,
        username: row.username,
      });
    }

    const data = gameNightsRes.rows.map((gn) => ({
      ...gn,
      attendees: attendeesMap[gn.game_night_id] || [],
      games: gamesMap[gn.game_night_id] || [],
    }));

    res.json({
      report_title: "Game Nights Report",
      generated_at: new Date(),
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/:id/rsvp", authorize, async (req, res) => {
  const gameNightId = parseInt(req.params.id);
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      "SELECT * FROM game_night_attendees WHERE game_night_id = $1 AND user_id = $2",
      [gameNightId, userId]
    );

    if (check.rows.length > 0) {
      await pool.query(
        "DELETE FROM game_night_attendees WHERE game_night_id = $1 AND user_id = $2",
        [gameNightId, userId]
      );
      return res.json({ message: "RSVP removed", status: "unjoined" });
    } else {
      await pool.query(
        "INSERT INTO game_night_attendees (game_night_id, user_id) VALUES ($1, $2)",
        [gameNightId, userId]
      );
      return res.json({ message: "RSVP added", status: "joined" });
    }
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(500).json({ message: "Server error during RSVP" });
  }
});

module.exports = router;
