import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import type { User, Role } from "../types";
import { BiSearch, BiTrash, BiShieldAlt2 } from "react-icons/bi";
import { toast } from "sonner";

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "#4f46e5",
  CLIENT: "#10b981",
};

const ALL_ROLES: Role[] = ["ADMIN", "CLIENT"];

function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");

  const fetchUsers = () => {
    api.get("/admin/users")
      .then(r => setUsers(r.data))
      .catch(() => toast.error("Erreur lors du chargement des utilisateurs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("Rôle modifié avec succès");
      fetchUsers();
    } catch {
      toast.error("Erreur lors de la modification du rôle");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("Utilisateur supprimé");
      fetchUsers();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = search === "" ||
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <AppLayout title="Gestion des Utilisateurs" subtitle={`${users.length} utilisateurs enregistrés`}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <BiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, width: "100%" }}
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="form-input"
          style={{ width: 180 }}
        >
          <option value="">Tous les rôles</option>
          {ALL_ROLES.map(r => (
            <option key={r} value={r}>{r.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["#", "Nom", "Email", "Rôle", "Téléphone", "Statut", "Créé le", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucun utilisateur trouvé</td></tr>
              ) : filtered.map((user, idx) => (
                <tr key={user.id} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s",
                }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                   onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{idx + 1}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: ROLE_COLORS[user.role] + "20",
                          color: ROLE_COLORS[user.role],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700,
                        }}>{user.nom.charAt(0).toUpperCase()}</div>
                      )}
                      {user.nom}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{user.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id!, e.target.value)}
                      style={{
                        background: ROLE_COLORS[user.role] + "18",
                        color: ROLE_COLORS[user.role],
                        border: `1px solid ${ROLE_COLORS[user.role]}40`,
                        borderRadius: 999,
                        padding: "4px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {ALL_ROLES.map(r => (
                        <option key={r} value={r}>{r.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{user.phone || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                      background: user.enabled !== false ? "var(--success-bg)" : "var(--danger-bg)",
                      color: user.enabled !== false ? "var(--success)" : "var(--danger)",
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: user.enabled !== false ? "var(--success)" : "var(--danger)",
                      }} />
                      {user.enabled !== false ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => handleDelete(user.id!)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-muted)", padding: 6, borderRadius: 6,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-bg)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                      title="Supprimer"
                    >
                      <BiTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default UsersManagement;
