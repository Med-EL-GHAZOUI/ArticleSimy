import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import type { OrderTimeline, StatusStep, OrderStatus } from "../types";
import { BiPackage, BiCheck, BiCheckCircle, BiXCircle, BiCar, BiBox } from "react-icons/bi";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string }> = {
  CREATED: { label: "Commande créée", icon: <BiPackage size={20} />, color: "#4f46e5" },
  CONFIRMED: { label: "Confirmée", icon: <BiCheck size={20} />, color: "#0ea5e9" },
  PACKED: { label: "Emballée", icon: <BiBox size={20} />, color: "#f59e0b" },
  SHIPPED: { label: "Expédiée", icon: <BiCar size={20} />, color: "#8b5cf6" },
  DELIVERED: { label: "Livrée", icon: <BiCheckCircle size={20} />, color: "#10b981" },
  CANCELLED: { label: "Annulée", icon: <BiXCircle size={20} />, color: "#ef4444" },
};

function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [timeline, setTimeline] = useState<OrderTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/commandes/${id}/timeline`)
        .then(r => setTimeline(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <AppLayout title="Suivi de commande">
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Chargement...
        </div>
      </AppLayout>
    );
  }

  if (!timeline) {
    return (
      <AppLayout title="Suivi de commande">
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Commande introuvable
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Suivi — ${timeline.invoiceNumber}`}
      subtitle={`Statut actuel: ${STATUS_CONFIG[timeline.currentStatus]?.label || timeline.currentStatus}`}
    >
      <div className="card" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div className="card-body" style={{ padding: 32 }}>
          {/* Progress bar */}
          <div style={{ position: "relative", marginBottom: 48 }}>
            <div style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              height: 3,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              zIndex: 0,
            }}>
              {/* Progress fill */}
              {(() => {
                const completedSteps = timeline.timeline.filter(s => s.completed).length;
                const totalSteps = timeline.timeline.length;
                const pct = totalSteps > 1 ? ((completedSteps - 1) / (totalSteps - 1)) * 100 : 0;
                return (
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #4f46e5, #10b981)",
                    borderRadius: 2,
                    transition: "width 1s ease",
                  }} />
                );
              })()}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
              {timeline.timeline.map((step, idx) => {
                const config = STATUS_CONFIG[step.status];
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: step.completed ? config.color : "rgba(255,255,255,0.06)",
                      color: step.completed ? "#fff" : "var(--text-muted)",
                      border: step.current ? `3px solid ${config.color}` : "2px solid transparent",
                      boxShadow: step.current ? `0 0 20px ${config.color}40` : "none",
                      transition: "all 0.5s ease",
                      animation: step.current ? "pulse-dot 2s ease-in-out infinite" : "none",
                    }}>
                      {config.icon}
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: step.current ? 700 : 500,
                      color: step.completed ? "#fff" : "var(--text-muted)",
                      marginTop: 8,
                      textAlign: "center",
                      maxWidth: 80,
                    }}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline details */}
          <div style={{ borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: 24, marginLeft: 16 }}>
            {timeline.timeline.map((step, idx) => {
              const config = STATUS_CONFIG[step.status];
              return (
                <div key={idx} style={{
                  position: "relative",
                  paddingBottom: idx < timeline.timeline.length - 1 ? 24 : 0,
                  opacity: step.completed ? 1 : 0.4,
                }}>
                  {/* Dot on timeline */}
                  <div style={{
                    position: "absolute",
                    left: -31,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: step.completed ? config.color : "rgba(255,255,255,0.1)",
                    border: "2px solid var(--surface)",
                  }} />

                  <div style={{ fontWeight: 600, fontSize: 14, color: step.completed ? "#fff" : "var(--text-muted)" }}>
                    {config.label}
                  </div>
                  {step.timestamp && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(step.timestamp).toLocaleString("fr-FR")}
                    </div>
                  )}
                  {step.changedBy && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      Par: {step.changedBy}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default OrderTracking;
