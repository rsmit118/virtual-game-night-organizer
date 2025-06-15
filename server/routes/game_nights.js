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

      const { title, description, event_date, organizer_id } = req.body;

      const query = `
  INSERT INTO game_nights (title, description, event_date, organizer_id)
  VALUES ($1, $2, $3, $4)
`;

      await db.query(query, [title, description, event_date, organizer_id]);

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
      "SELECT * FROM game_nights ORDER BY event_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/:id", authorize, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

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
      "UPDATE game_nights SET title = $1, description = $2 WHERE game_night_id = $3",
      [title, description, id]
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
    const result = await pool.query(
      `SELECT 
    game_night_id,
    title, 
    event_date, 
    organizer_id, 
    created_at 
   FROM game_nights 
   ORDER BY event_date DESC`
    );

    res.json({
      report_title: "Game Nights Report",
      generated_at: new Date(),
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
