import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Scope reveal-hiding to JS-on visits. The prerendered HTML is visible without it.
document.documentElement.classList.add("js");

hydrateRoot(document.getElementById("root"), <App />);
