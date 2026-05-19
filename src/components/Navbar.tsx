import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axiosConfig";
import { BiCube, BiCart, BiHeart, BiUser, BiLogOut, BiGlobe, BiGridAlt, BiBookOpen } from "react-icons/bi";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const nom = localStorage.getItem("nom");
  const { itemCount } = useCart();
  const { language, setLanguage, t, isRtl } = useLanguage();

  const logout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Safe backend logout invalidation
        await api.post(`/auth/logout?userId=${userId}`);
      }
    } catch (err) {
      console.error("Logout invalidation failed:", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      padding: "12px 24px",
      background: "rgba(30, 41, 59, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      direction: isRtl ? "rtl" : "ltr"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
        <div style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          borderRadius: "8px",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <BiCube size={20} color="white" />
        </div>
        <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>
          ArticleSimy
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginLeft: isRtl ? "0" : "auto", marginRight: isRtl ? "auto" : "0" }}>
        {token && (
          <Link to="/articles" className="nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {t("navArticles")}
          </Link>
        )}

        {token && role === "ADMIN" && (
          <Link to="/dashboard" className="nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BiGridAlt size={16} />
            {t("navDashboard")}
          </Link>
        )}

        {token && role === "ADMIN" && (
          <Link to="/audit-logs" className="nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BiBookOpen size={16} />
            {t("navAudit")}
          </Link>
        )}

        {token && role === "USER" && (
          <Link to="/panier" className="nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BiCart size={18} />
            {t("navCart")}
            {itemCount > 0 && (
              <span className="badge badge-primary" style={{
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "99px"
              }}>{itemCount}</span>
            )}
          </Link>
        )}

        {token && role === "USER" && (
          <Link to="/wishlist" className="nav-link" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BiHeart size={16} />
            {t("navWishlist")}
          </Link>
        )}

        {token && (
          <Link to="/commandes" className="nav-link">
            {t("navOrders")}
          </Link>
        )}

        {/* Language selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255, 255, 255, 0.7)" }}>
          <BiGlobe size={16} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="fr" style={{ color: "#000" }}>Français</option>
            <option value="en" style={{ color: "#000" }}>English</option>
            <option value="ar" style={{ color: "#000" }}>العربية</option>
          </select>
        </div>

        <div className="divider-v" style={{ height: "20px", width: "1px", background: "rgba(255,255,255,0.15)" }} />

        {token ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#fff" }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <BiUser size={16} color="rgba(255,255,255,0.8)" />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{nom || email}</span>
            </Link>
            <button onClick={logout} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", padding: "6px 12px" }}>
              <BiLogOut size={16} />
              {t("navLogout")}
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: "8px 16px", textDecoration: "none", color: "#fff" }}>
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
