import React from "react";
import Configurator from "./components/Configurator/Configurator";
import "./index.css"; // Ensure Tailwind CSS is imported

// Для ModularMode и других режимов может понадобиться ToastContainer, если будете использовать toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Если решите вынести ProjectInfo и HelpPanel на уровень App
// import ProjectInfo from './components/Configurator/ProjectInfo';
// import HelpPanel from './components/Configurator/HelpPanel';

// Если будете управлять режимами из App.js
// import { DEFAULT_MODE, MODES } from './components/Configurator/appConstants';
// import FramelessMode from './components/Configurator/modes/FramelessMode';
// import FrameMode from './components/Configurator/modes/FrameMode';
// import ModularMode from './components/Configurator/modes/ModularMode';

function App() {
  // Пример управления состоянием, если вынести его в App.js
  // const [activeMode, setActiveMode] = React.useState(DEFAULT_MODE);
  // const [projectInfoData, setProjectInfoData] = React.useState({ area: 0, cost: 0, elements: [] });

  // const renderModeSpecificUIForApp = (configuratorInterface) => {
  //   switch (activeMode) {
  //     case MODES.FRAMELESS:
  //       return <FramelessMode {...configuratorInterface} />;
  //     case MODES.FRAMED:
  //       return <FrameMode {...configuratorInterface} />;
  //     case MODES.MODULAR:
  //       return <ModularMode {...configuratorInterface} />;
  //     default:
  //       return null;
  //   }
  // };

  return (
    <div className="App h-screen flex flex-col bg-dark-bg text-gray-200">
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} newestOnTop />
      <Configurator
      // activeMode={activeMode} // Передаем, если управляем из App
      // setProjectInfoData={setProjectInfoData} // Передаем, если управляем из App
      // renderModeSpecificUI={renderModeSpecificUIForApp} // Передаем, если управляем из App
      />
      {/* <ProjectInfo {...projectInfoData} /> */}
      {/* <HelpPanel /> */}
    </div>
  );
}

export default App;