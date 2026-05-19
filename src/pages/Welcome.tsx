import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { BiCube, BiPackage, BiCart, BiGridAlt, BiLogIn, BiUserPlus } from "react-icons/bi";
import "../styles/welcome.css";

function Welcome() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="welcome-page" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Blurred glowing background blobs */}
      <div className="welcome-bg-blob welcome-bg-blob-1" />
      <div className="welcome-bg-blob welcome-bg-blob-2" />
      <div className="welcome-bg-blob welcome-bg-blob-3" />

      <div className="welcome-container">
        <div className="welcome-card">
          {/* Glowing central logo */}
          <div className="welcome-logo-container animate-float">
            <BiCube size={36} />
          </div>

          {/* Main Title with futuristic colored text-clip */}
          <h1 className="welcome-title">
            {t("welcomeTitle")}<br />
            <span>élégance & simplicité</span>
          </h1>

          {/* Descriptive slogan */}
          <p className="welcome-subtitle animate-fade-in">
            {t("welcomeSubtitle")}
          </p>

          {/* High-end Feature Grid */}
          <div className="welcome-features-grid">
            <div className="welcome-feature-card" style={{ animationDelay: "0.1s" }}>
              <div className="welcome-feature-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BiPackage size={22} />
              </div>
              <h3 className="welcome-feature-title">{t("navArticles")}</h3>
              <p className="welcome-feature-desc">
                Suivez votre catalogue complet, recherchez instantanément vos articles et recevez des alertes de péremption automatiques.
              </p>
            </div>

            <div className="welcome-feature-card" style={{ animationDelay: "0.2s" }}>
              <div className="welcome-feature-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BiCart size={22} />
              </div>
              <h3 className="welcome-feature-title">{t("navCart")}</h3>
              <p className="welcome-feature-desc">
                Permettez à vos collaborateurs d'ajouter facilement des articles au panier et de passer leurs commandes en un clic.
              </p>
            </div>

            <div className="welcome-feature-card" style={{ animationDelay: "0.3s" }}>
              <div className="welcome-feature-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BiGridAlt size={22} />
              </div>
              <h3 className="welcome-feature-title">{t("navDashboard")}</h3>
              <p className="welcome-feature-desc">
                Supervisez en un coup d'œil votre chiffre d'affaires, gérez les alertes de stock faible et pilotez votre activité globale.
              </p>
            </div>
          </div>

          {/* Interactive CTAs */}
          <div className="welcome-actions animate-fade-in" style={{ animationDelay: "0.45s" }}>
            <button className="welcome-btn-primary" onClick={() => navigate("/login")}>
              Se connecter
              <BiLogIn size={18} />
            </button>
            <button className="welcome-btn-secondary" onClick={() => navigate("/register")}>
              Créer un compte
              <BiUserPlus size={18} />
            </button>
          </div>

          {/* Micro Footer copyright */}
          <footer className="welcome-footer animate-fade-in" style={{ animationDelay: "0.6s" }}>
            &copy; 2026 SmartStock Manager. Tous droits réservés.
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
