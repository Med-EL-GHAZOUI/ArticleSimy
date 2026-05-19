import React, { useState, useEffect, useRef, useCallback } from "react";
import { BiMenu, BiBell, BiCheck, BiCheckDouble } from "react-icons/bi";
import Sidebar from "./Sidebar";
import ClientNavbar from "./ClientNavbar";
import ClientFooter from "./ClientFooter";
import api from "../api/axiosConfig";
import { useWebSocket } from "../hooks/useWebSocket";
import { toast } from "sonner";
import "../styles/layout.css";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const [userRes, broadcastRes] = await Promise.all([
        api.get(`/notifications/user/${userId}`),
        api.get("/notifications/broadcast")
      ]);
      const combined = [...userRes.data, ...broadcastRes.data];
      combined.sort((a: any, b: any) => b.id - a.id);
      setNotifications(combined);
      
      const unreadRes = await api.get(`/notifications/user/${userId}/unread-count`);
      setUnreadCount(unreadRes.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 60s polling fallback
    return () => clearInterval(interval);
  }, [userId]);

  // WebSocket integration for real-time notifications
  const handleWebSocketNotification = useCallback((notification: any) => {
    toast.success(notification.title || "Nouvelle notification", {
      description: notification.message,
    });
    fetchNotifications();
  }, []);

  useWebSocket({
    userId,
    onNotification: handleWebSocketNotification,
    onAdminAlert: handleWebSocketNotification,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await api.put(`/notifications/user/${userId}/read-all`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="app-shell-client">
      <div className="main-content-client" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        <ClientNavbar />

        <main className="page-body animate-fade-in" style={{ flex: 1, padding: "32px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>{title}</h1>
            {subtitle && <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 16 }}>{subtitle}</p>}
          </div>
          {children}
        </main>
        
        <ClientFooter />
      </div>

      {/* Inline style to show hamburger on mobile */}
      <style>{`
        @media (max-width: 1024px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default AppLayout;
