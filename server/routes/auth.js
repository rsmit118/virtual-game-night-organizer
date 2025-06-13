// /server/routes/auth.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// POST /register
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user exists
      const userCheck = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user
      await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
        [username, email, hashedPassword]
      );

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// POST /login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user
      const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const user = userResult.rows[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      res.json({
        message: "Login successful",
        user_id: user.user_id,
        username: user.username,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Get all organizers
router.get("/organizers", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, username, email, role FROM users WHERE role = $1",
      ["organizer"]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Demo: Users with polymorphism
router.get("/demo/users", (req, res) => {
  const User = require("../models/User");
  const Organizer = require("../models/Organizer");

  const user = new User(1, "RegularUser", "user@example.com");
  const organizer = new Organizer(
    2,
    "GameMaster",
    "organizer@example.com",
    1001
  );

  const users = [
    {
      type: "User",
      role: user.getRole(),
      summary: user.getSummary(),
    },
    {
      type: "Organizer",
      role: organizer.getRole(),
      summary: organizer.getSummary(),
      organizerSummary: organizer.getOrganizerSummary(),
    },
  ];

  res.json(users);
});

module.exports = router;
