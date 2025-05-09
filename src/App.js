import React from "react";
import Configurator from "./components/Configurator/Configurator";
import "./index.css"; // Ensure Tailwind CSS is imported

function App() {
  return (
    <div className="App h-screen flex flex-col bg-dark-bg text-gray-200">
      <Configurator />
    </div>
  );
}

export default App;
