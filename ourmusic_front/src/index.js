import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider } from "./context/auth-context";
import { AudioProvider } from "./context/audio-context";
import { NotificationProvider } from "./context/notification-context";

import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AudioProvider>
        <NotificationProvider>
          <Router>
            <App />
          </Router>
        </NotificationProvider>
      </AudioProvider>
    </AuthProvider>
  </React.StrictMode>
);
