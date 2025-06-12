// /server/routes/game_nights.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { body, validationResult } = require("express-validator");

// Create Game Night
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, event_date, organizer_id } = req.body;

    try {
      const result = await pool.query(
        "INSERT INTO game_nights (title, description, event_date, organizer_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, event_date, organizer_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Get All Game Nights
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

// Update Game Night
router.put(
  "/:id",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("event_date")
      .notEmpty()
      .withMessage("Event date is required")
      .isISO8601()
      .withMessage("Event date must be a valid date"),
    body("organizer_id").isInt().withMessage("Organizer ID must be an integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, event_date, organizer_id } = req.body;
    const { id } = req.params;

    try {
      const result = await pool.query(
        "UPDATE game_nights SET title = $1, description = $2, event_date = $3, organizer_id = $4 WHERE game_night_id = $5 RETURNING *",
        [title, description, event_date, organizer_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Game night not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Delete Game Night
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM game_nights WHERE game_night_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Game night not found" });
    }

    res.json({ message: "Game night deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Search Game Nights by Title
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

// Report: Game Nights Report
router.get("/report", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
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
