# Virtual Game Night Planner

The **Virtual Game Night Planner** is a full-stack web application that helps users organize game nights, manage attendees, and keep track of upcoming events.  
This project was originally built and tested locally and then deployed entirely online using free cloud services.

---

## Project Overview

- **Frontend**: React (Vite) hosted on **Netlify**
- **Backend**: Node.js / Express hosted on **Render**
- **Database**: PostgreSQL hosted on **Render**

The goal is to allow anyone to plan and coordinate online or in-person game nights, register and log in, and view or add events.

---

## Tech Stack

- **Frontend**: React, Vite, Fetch API
- **Backend**: Node.js, Express, CORS, dotenv
- **Database**: PostgreSQL
- **Deployment**:
  - **Render** for backend and database
  - **Netlify** for frontend
  - **GitHub** and **GitLab** for version control

---

## Features

✅ User registration with unique username and email  
✅ Login and authentication  
✅ Ability to create game nights (online or in-person)  
✅ View all game nights in a table or list view  
✅ Basic protected routes for logged-in users

---

## Deployment Details

This project is fully hosted online:

- **Frontend**: [Netlify Live Site](https://virtual-game-night-organizer.netlify.app)
- **Backend API**: [Render Backend](https://virtual-game-night-backend.onrender.com)
- **Database**: Cloud PostgreSQL on Render, migrated from local development

The frontend uses an environment variable `VITE_API_BASE_URL` to point to the deployed backend.

---

## Running Locally

To run the app locally for development:

1. **Clone the repo**

   git clone https://gitlab.com/yourusername/virtual-game-night-planner.git

2. **Install backend dependencies**

   cd server
   npm install

3. **Install frontend dependencies**

   cd ../client
   npm install

4. **Set environment variables**

   Create a .env file in the backend: `DATABASE_URL=your-local-postgres-url`

   And a .env file in the frontend: `VITE_API_BASE_URL=http://localhost:5000`

5. **Run the backend**

   cd server
   npm start

6. **Run the frontend**

   cd ../client
   npm run dev
   Visit `http://localhost:5173` to view the app locally.

---

## Credits

Created by Ryan Smith.
Original design, database schema, backend routes, and frontend built from scratch for educational purposes.

---

## License

This project was created for educational purposes. Do not use without permission.
