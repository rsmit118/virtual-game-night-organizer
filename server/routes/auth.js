require("dotenv").config();

const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authorize = require("../middleware/authorize");

const validatePassword = require("../utils/validatePassword");

const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  message: {
    message: "Too many attempts. Try again in 15 minutes.",
  },
});

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/
      )
      .withMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const usernameRaw = req.body.username;
    const usernameLc = usernameRaw.toLowerCase();
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    try {
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE username_lc = $1 OR email = $2",
        [usernameLc, email]
      );

      if (existingUser.rows.length > 0) {
        const taken = existingUser.rows[0];
        if (taken.username === username && taken.email === email) {
          return res
            .status(400)
            .json({ message: "Username and email already in use." });
        } else if (taken.username === username) {
          return res.status(400).json({ message: "Username already in use." });
        } else if (taken.email === email) {
          return res.status(400).json({ message: "Email already in use." });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await pool.query(
        "INSERT INTO users (username, username_lc, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id, username",
        [usernameRaw, usernameLc, email, hashedPassword]
      );

      const user = result.rows[0];

      const payload = {
        userId: user.user_id,
        username: user.username,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

      res.status(201).json({
        message: "User registered successfully",
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authLimiter,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const usernameLc = req.body.username.toLowerCase();
    const password = req.body.password;

    try {
      const userResult = await pool.query(
        "SELECT * FROM users WHERE username_lc = $1",
        [usernameLc]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const user = userResult.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const payload = {
        userId: user.user_id,
        username: user.username,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      res.json({
        message: "Login successful",
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

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

router.get("/me", authorize, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, username, email FROM users WHERE user_id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.patch("/me", authorize, async (req, res) => {
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: "Nothing to update." });
  }

  try {
    const userId = req.user.userId;

    if (username) {
      const checkUsername = await pool.query(
        "SELECT user_id FROM users WHERE username = $1 AND user_id != $2",
        [username, userId]
      );

      if (checkUsername.rows.length > 0) {
        return res
          .status(409)
          .json({ message: "That username is already in use." });
      }
    }

    if (email) {
      const checkEmail = await pool.query(
        "SELECT user_id FROM users WHERE email = $1 AND user_id != $2",
        [email, userId]
      );

      if (checkEmail.rows.length > 0) {
        return res
          .status(409)
          .json({ message: "That email is already in use." });
      }
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (username) {
      updates.push(`username = $${idx++}`);
      values.push(username);
    }

    if (email) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(
        ", "
      )} WHERE user_id = $${idx} RETURNING user_id, username, email`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile." });
  }
});

router.patch("/change-password", authLimiter, authorize, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Both current and new passwords are required.",
    });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password_hash = $1 WHERE user_id = $2", [
      hashedPassword,
      req.user.userId,
    ]);

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error changing password." });
  }
});

module.exports = router;
