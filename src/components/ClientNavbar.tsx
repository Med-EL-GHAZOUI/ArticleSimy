import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiCart, BiHeart, BiLogOutCircle, BiUser, BiShoppingBag, BiGridAlt, BiPackage, BiReceipt, BiBell, BiGroup, BiHistory, BiUserCircle } from "react-icons/bi";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axiosConfig";

function ClientNavbar() {
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await api.post(`/auth/logout?userId=${userId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const clientLinks = [
    { path: "/articles", label: "Boutique", icon: <BiShoppingBag size={18} /> },
    { path: "/panier", label: "Panier", icon: <BiCart size={18} />, badge: cartCount },
    { path: "/wishlist", label: "Favoris", icon: <BiHeart size={18} /> },
    { path: "/commandes", label: "Mes Achats", icon: <BiShoppingBag size={18} /> },
    { path: "/profile", label: "Mon Compte", icon: <BiUser size={18} /> },
  ];

  const adminLinks = [
    { path: "/", label: "Dashboard", icon: <BiGridAlt size={18} /> },
    { path: "/articles", label: "Produits", icon: <BiPackage size={18} /> },
    { path: "/commandes", label: "Commandes", icon: <BiReceipt size={18} /> },
    { path: "/users", label: "Utilisateurs", icon: <BiGroup size={18} /> },
    { path: "/profile", label: "Mon Profil", icon: <BiUserCircle size={18} /> },
  ];

  const navLinks = role === "ADMIN" ? adminLinks : clientLinks;

  return (
    <header style={{ 
      background: "rgba(15, 23, 42, 0.85)", 
      backdropFilter: "blur(12px)", 
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      position: "sticky", top: 0, zIndex: 1000 
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Logo */}
        <Link to="/articles" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, var(--primary), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>
            A
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Article<span style={{ color: "var(--primary)" }}>Simy</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: 32 }}>
          {navLinks.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                style={{ 
                  textDecoration: "none", 
                  color: isActive ? "#fff" : "var(--text-muted)", 
                  fontWeight: isActive ? 600 : 500,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "color 0.2s"
                }}
              >
                {link.icon}
                {link.label}
                {link.badge !== undefined && link.badge > 0 && (
                  <span style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 10 }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline" 
            style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}
          >
            <BiLogOutCircle size={18} />
            Déconnexion
          </button>
        </div>

      </div>
    </header>
  );
}

export default ClientNavbar;
