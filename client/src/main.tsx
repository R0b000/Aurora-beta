import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import RouterConfig from "./config/RouterConfig";
import './style.css'
import { AppProvider } from "./context/AppContext";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ToastContainer
        position={'top-center'}
        autoClose={3000}
      />
      <RouterConfig />
    </AppProvider>
  </StrictMode>
)