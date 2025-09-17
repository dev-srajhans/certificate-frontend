import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RefreshHandler from "./RefreshHandler";
import { AccessControlProvider } from "./contexts/AccessControlContext";
import CentralizedRouter from "./Components/CentralizedRouter";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <AccessControlProvider>
      <div className="App">
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
        <CentralizedRouter
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </AccessControlProvider>
  );
}

export default App;
