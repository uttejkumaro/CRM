import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Toasts from "./components/Toasts";

const root = createRoot(document.getElementById("root"));
root.render(
  <>
    <App />
    <Toasts />
  </>
);
