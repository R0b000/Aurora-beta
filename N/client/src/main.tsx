import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import RouterConfig from "./config/RouterConfig";
import './style.css'
import { AppProvider } from "./context/AppContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <SocketProvider>
        <ToastContainer
          position={'top-center'}
          autoClose={3000}
        />
        <RouterConfig />
      </SocketProvider>
    </AppProvider>
  </StrictMode>
)