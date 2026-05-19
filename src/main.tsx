import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";

/* ── Styles globaux ─────────────────────── */
import "./index.css";               // Variables CSS, reset, utilitaires
import "./styles/animations.css";  // Keyframes & classes d'animation
import "./styles/components.css";  // Boutons, formulaires, cards, table, modal, badges, alerts

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </LanguageProvider>
  </React.StrictMode>
);
