// /server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const pool = require("./db");

app.use(cors());
app.use(express.json());

// Test route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Backend is running! DB time: ${result.rows[0].now}`);
  } catch (err) {
    console.error("Database error:", err); // force label the error
    res.status(500).send(`Database error: ${err.message}`); // show error message on page too
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
