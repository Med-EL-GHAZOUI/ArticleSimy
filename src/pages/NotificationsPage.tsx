import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import type { Notification, NotificationType } from "../types";
import { BiCheck, BiCheckDouble, BiBell, BiPackage, BiErrorCircle, BiCart, BiVolumeFull } from "react-icons/bi";
import { toast } from "sonner";

const TYPE_CONFIG: Partial<Record<NotificationType, { icon: React.ReactNode; color: string }>> = {
  ORDER_CREATED: { icon: <BiPackage size={18} />, color: "#4f46e5" },
  ORDER_CONFIRMED: { icon: <BiCheck size={18} />, color: "#0ea5e9" },
  ORDER_SHIPPED: { icon: <BiPackage size={18} />, color: "#8b5cf6" },
  ORDER_DELIVERED: { icon: <BiCheck size={18} />, color: "#10b981" },
  ORDER_CANCELLED: { icon: <BiErrorCircle size={18} />, color: "#ef4444" },
  LOW_STOCK: { icon: <BiErrorCircle size={18} />, color: "#f59e0b" },
  OUT_OF_STOCK: { icon: <BiErrorCircle size={18} />, color: "#ef4444" },
  NEAR_EXPIRY: { icon: <BiErrorCircle size={18} />, color: "#f59e0b" },
  ABANDONED_CART: { icon: <BiCart size={18} />, color: "#8b5cf6" },
  PROMOTION: { icon: <BiVolumeFull size={18} />, color: "#10b981" },
  SYSTEM: { icon: <BiBell size={18} />, color: "#94a3b8" },
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const [userRes, broadcastRes] = await Promise.all([
        api.get(`/notifications/user/${userId}`),
        api.get("/notifications/broadcast"),
      ]);
      const combined = [...userRes.data, ...broadcastRes.data];
      combined.sort((a: Notification, b: Notification) => b.id - a.id);
      setNotifications(combined);
    } catch {
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [userId]);

  const handleMarkAsRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    await api.put(`/notifications/user/${userId}/read-all`);
    toast.success("Toutes les notifications marquées comme lues");
    fetchNotifications();
  };

  const filtered = notifications.filter(n => {
    if (filter === "") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppLayout
      title="Notifications"
      subtitle={`${unreadCount} non lue(s) · ${notifications.length} total`}
    >
      {/* Actions bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="form-input"
          style={{ width: 200 }}
        >
          <option value="">Toutes</option>
          <option value="unread">Non lues</option>
          <option value="ORDER_CREATED">Commandes créées</option>
          <option value="ORDER_CONFIRMED">Commandes confirmées</option>
          <option value="ORDER_SHIPPED">Commandes expédiées</option>
          <option value="LOW_STOCK">Stock faible</option>
          <option value="OUT_OF_STOCK">Rupture</option>
          <option value="ABANDONED_CART">Panier abandonné</option>
        </select>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-sm"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--primary)", color: "#fff",
              padding: "8px 16px", borderRadius: 8, border: "none",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}
          >
            <BiCheckDouble size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notification list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            <BiBell size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>Aucune notification</div>
          </div>
        ) : filtered.map(n => {
          const config = TYPE_CONFIG[n.type as NotificationType] || { icon: <BiBell size={18} />, color: "#94a3b8" };
          return (
            <div key={n.id} className="card animate-fade-in" style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "start",
              gap: 14,
              borderLeft: n.read ? "none" : `3px solid ${config.color}`,
              opacity: n.read ? 0.7 : 1,
              transition: "all 0.2s",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: config.color + "18",
                color: config.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {config.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 4 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {new Date(n.createdAt).toLocaleString("fr-FR")}
                  <span style={{
                    marginLeft: 8, padding: "2px 8px", borderRadius: 999,
                    background: config.color + "15", color: config.color,
                    fontSize: 10, fontWeight: 600,
                  }}>{n.type.replace(/_/g, " ")}</span>
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 6, borderRadius: 6,
                    transition: "all 0.15s", flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--primary-50)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                  title="Marquer comme lu"
                >
                  <BiCheck size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

export default NotificationsPage;
