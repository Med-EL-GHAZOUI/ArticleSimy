import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  BiPackage, BiCart, BiReceipt, BiBarChartAlt2,
  BiHeart, BiUser, BiLogOut, BiShieldAlt2,
  BiGroup, BiX, BiBell, BiCog
} from "react-icons/bi";
import type { Role } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "CLIENT") as Role;

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        await api.post(`/auth/logout?userId=${userId}`);
      }
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const isAdmin = role === "ADMIN";
  const isClient = role === "CLIENT";

  type NavItem = {
    icon: React.ReactNode;
    label: string;
    to: string;
    show: boolean;
  };

  type NavSection = {
    title: string;
    show: boolean;
    items: NavItem[];
  };

  const sections: NavSection[] = [
    {
      title: "Menu Principal",
      show: true,
      items: [
        { icon: <BiBarChartAlt2 size={20} />, label: t("navDashboard"), to: "/dashboard", show: isAdmin },
        { icon: <BiPackage size={20} />, label: t("navArticles"), to: "/articles", show: true },
      ]
    },
    {
      title: "Votre Espace",
      show: true,
      items: [
        { icon: <BiCart size={20} />, label: t("navCart"), to: "/panier", show: isClient || isAdmin },
        { icon: <BiHeart size={20} />, label: t("navWishlist"), to: "/wishlist", show: isClient || isAdmin },
        { icon: <BiReceipt size={20} />, label: t("navOrders"), to: "/commandes", show: true },
        { icon: <BiBell size={20} />, label: "Notifications", to: "/notifications", show: true },
        { icon: <BiUser size={20} />, label: t("navProfile"), to: "/profile", show: true },
      ]
    },
    {
      title: "Administration",
      show: isAdmin,
      items: [
        { icon: <BiGroup size={20} />, label: "Utilisateurs", to: "/users", show: isAdmin },
        { icon: <BiShieldAlt2 size={20} />, label: t("navAudit"), to: "/audit-logs", show: isAdmin },
      ]
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BiPackage size={22} />
          </div>
          <span className="sidebar-logo-text">ArticleSimy</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close">
            <BiX size={20} />
          </button>
        </div>

        {/* Role badge */}
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div className={`role-badge role-badge-${role.toLowerCase()}`}>
            {isAdmin ? <BiShieldAlt2 size={16} /> : <BiUser size={16} />}
            <span style={{ fontWeight: 700, letterSpacing: 0.5 }}>ESPACE {role}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {sections.filter(sec => sec.show).map((section, idx) => {
            const visibleItems = section.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={idx} className="sidebar-section">
                <div className="sidebar-section-title">{section.title}</div>
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-link sidebar-item ${isActive ? "active" : ""}`}
                    onClick={onClose}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon"><BiLogOut size={20} /></span>
            <span>{t("navLogout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
