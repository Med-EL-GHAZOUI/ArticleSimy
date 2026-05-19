import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import { useLanguage } from "../context/LanguageContext";
import { BiPackage, BiReceipt, BiGroup, BiErrorCircle, BiWallet, BiTrendingUp } from "react-icons/bi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import type { DashboardStats } from "../types";
import "../styles/dashboard.css";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
  trendUp?: boolean;
  delay: string;
}

const StatCard = ({ icon, label, value, color, trend, trendUp, delay }: StatCardProps) => (
  <div className="stat-card" style={{ animationDelay: delay }}>
    <div className="stat-card-icon" style={{ background: `${color}18`, color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon}
    </div>
    <div className="stat-card-label">{label}</div>
    <div className="stat-card-value">{value}</div>
    {trend && (
      <div className="stat-card-trend" style={{ color: trendUp ? "var(--success)" : "var(--danger)" }}>
        {trendUp ? "↑" : "↓"} {trend}
      </div>
    )}
    <div className="stat-card-glow" style={{ background: color }}/>
  </div>
);

const CHART_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function Dashboard() {
  const { t, isRtl } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0, totalCommandes: 0, totalUsers: 0,
    stockFaible: 0, chiffreAffaires: 0,
  });
  const [analytics, setAnalytics] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics")
      .then((res) => {
        setStats(res.data);
        setAnalytics(res.data);
      })
      .catch((error) => {
        console.error("Erreur chargement analytics", error);
        return api.get("/admin/dashboard").then((res) => {
          setStats(res.data);
          setAnalytics(null);
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards: StatCardProps[] = [
    { icon: <BiPackage size={22} />, label: t("dashArticles"), value: loading ? "—" : stats.totalArticles, color: "#4f46e5", trend: "actif", trendUp: true, delay: "0s" },
    { icon: <BiReceipt size={22} />, label: t("dashOrders"), value: loading ? "—" : stats.totalCommandes, color: "#0ea5e9", trend: "ce mois", trendUp: true, delay: ".05s" },
    { icon: <BiGroup size={22} />, label: t("dashUsers"), value: loading ? "—" : stats.totalUsers, color: "#10b981", trend: "inscrits", trendUp: true, delay: ".10s" },
    { icon: <BiErrorCircle size={22} />, label: t("dashStockFaible"), value: loading ? "—" : stats.stockFaible, color: "#f59e0b", trend: "à réapprovisionner", trendUp: false, delay: ".15s" },
    { icon: <BiWallet size={22} />, label: t("dashCA"), value: loading ? "—" : `${Number(stats.chiffreAffaires).toLocaleString("fr-MA")} DH`, color: "#8b5cf6", trend: "total", trendUp: true, delay: ".20s" },
  ];

  // Prepare chart data
  const monthlySalesData = analytics?.monthlySales?.map(s => ({
    name: s.month.split("-")[1] + "/" + s.month.split("-")[0].slice(2),
    ventes: s.total,
    commandes: s.orderCount,
  })) || [];

  const orderStatusData = analytics?.ordersByStatus
    ? Object.entries(analytics.ordersByStatus).filter(([, count]) => count > 0).map(([status, count]) => ({
        name: status, value: count,
      }))
    : [];

  return (
    <AppLayout title={t("dashTitle")} subtitle="Statistiques et indicateurs administratifs en temps réel">
      
      {/* Premium Welcome Banner */}
      <div className="dashboard-banner">
        <div className="dashboard-banner-content">
          <h1 className="dashboard-banner-title">
            Bienvenue sur votre <span className="text-gradient">Centre de Contrôle</span>
          </h1>
          <p className="dashboard-banner-subtitle">
            Voici un aperçu de l'activité de votre boutique aujourd'hui. Toutes vos métriques clés sont réunies ici.
          </p>
        </div>
        <div className="dashboard-banner-decoration"></div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 28, direction: isRtl ? "rtl" : "ltr" }}>
        {cards.map(c => <StatCard key={c.label} {...c}/>)}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20, marginBottom: 24 }}>
        {/* Monthly Sales Line Chart */}
        <div className="card animate-fade-in" style={{ animationDelay: ".25s" }}>
          <div className="card-header">
            <div>
              <div className="card-title"><BiTrendingUp style={{ marginRight: 8, verticalAlign: "middle" }} />{t("dashSalesTrend")}</div>
              <div className="card-subtitle">Revenus mensuels (12 derniers mois)</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            {monthlySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="ventes" stroke="#4f46e5" strokeWidth={2.5} dot={{ fill: "#4f46e5", r: 4 }} />
                  <Line type="monotone" dataKey="commandes" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13 }}>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="card animate-fade-in" style={{ animationDelay: ".30s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Commandes par Statut</div>
              <div className="card-subtitle">Répartition des commandes</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {orderStatusData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13 }}>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients & Daily Revenue */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
        {/* Top Clients */}
        <div className="card animate-fade-in" style={{ animationDelay: ".35s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">🏆 Top Clients</div>
              <div className="card-subtitle">Meilleurs clients par dépenses</div>
            </div>
          </div>
          <div className="card-body">
            {analytics?.topClients && analytics.topClients.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "8px 0", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Client</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Commandes</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topClients.map((client, idx) => (
                    <tr key={client.userId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: CHART_COLORS[idx % CHART_COLORS.length] + "20",
                            color: CHART_COLORS[idx % CHART_COLORS.length],
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700,
                          }}>{idx + 1}</span>
                          {client.userName}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontSize: 13, color: "var(--text-secondary)" }}>{client.totalOrders}</td>
                      <td style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{client.totalSpent.toLocaleString("fr-MA")} DH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Daily Revenue Bar Chart */}
        <div className="card animate-fade-in" style={{ animationDelay: ".40s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">📈 Revenus Journaliers</div>
              <div className="card-subtitle">30 derniers jours</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyRevenue.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} tickFormatter={(v: string) => v.split("-").slice(1).join("/")} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13 }}>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
