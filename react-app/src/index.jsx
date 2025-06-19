import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW, setupPWAInstall } from "./utils/pwa";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

// Enregistrement du service worker et configuration PWA
registerSW();
setupPWAInstall();
