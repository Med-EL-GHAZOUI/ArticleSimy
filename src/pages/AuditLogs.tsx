import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axiosConfig";
import { useLanguage } from "../context/LanguageContext";
import { BiBookOpen, BiSearch, BiLoaderAlt, BiTime } from "react-icons/bi";
import { AuditLog } from "../types";
import "../styles/layout.css";

function AuditLogs() {
  const { t, isRtl } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/audit-logs");
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchLogs();
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get(`/audit-logs/search?query=${encodeURIComponent(search)}`);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes("AJOUT")) return "badge badge-success";
    if (action.includes("MODIF")) return "badge badge-warning";
    if (action.includes("SUPPR")) return "badge badge-danger";
    return "badge badge-primary";
  };

  return (
    <AppLayout title={t("navAudit")} subtitle="Journal d'audit de l'activité des administrateurs">
      {/* Search toolbar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, width: "100%", maxWidth: 400 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <BiSearch className="input-icon-left" size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Rechercher une action..."
              className="form-control has-icon-left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BiSearch size={16} />
            Rechercher
          </button>
        </form>
      </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <BiLoaderAlt size={32} className="animate-spin" color="var(--primary)" />
          </div>
        ) : logs.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <BiBookOpen size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: "0 0 8px", fontWeight: 800 }}>Aucun log d'audit trouvé</h3>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Modifiez des produits ou le catalogue pour voir les logs d'activité !</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Détails</th>
                    <th>Email Acteur</th>
                    <th>Rôle Acteur</th>
                    <th>Date / Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="animate-fade-in">
                      <td style={{ fontWeight: 700 }}>
                        <span className={getActionBadgeClass(log.action)}>{log.action}</span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13.5, maxWidth: 300, whiteSpace: "normal" }}>
                        {log.details}
                      </td>
                      <td>{log.actorEmail}</td>
                      <td>
                        <span className={`badge ${log.actorRole === "ADMIN" ? "badge-primary" : "badge-success"}`}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                          <BiTime size={14} />
                          {new Date(log.timestamp).toLocaleString("fr-FR")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </AppLayout>
  );
}

export default AuditLogs;
