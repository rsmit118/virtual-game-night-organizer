import React from "react";
import CreateGameNightForm from "./components/CreateGameNightForm";
import GameNightsList from "./components/GameNightsList";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  return (
    <div>
      <h1>Virtual Game Night Organizer</h1>
      <RegisterForm />
      <LoginForm />
      <CreateGameNightForm />
      <GameNightsList />
    </div>
  );
}

export default App;
