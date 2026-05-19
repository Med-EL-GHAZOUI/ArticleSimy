import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axiosConfig";
import { useLanguage } from "../context/LanguageContext";
import { BiUser, BiEnvelope, BiLockAlt, BiImage, BiBadgeCheck, BiCalendar, BiSave, BiLoaderAlt, BiCheckCircle } from "react-icons/bi";
import { User } from "../types";
import "../styles/layout.css";

function Profile() {
  const { t, isRtl } = useLanguage();
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState({ nom: "", email: "", password: "", profileImage: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${userId}`);
      setProfile(data);
      setForm({
        nom: data.nom || "",
        email: data.email || "",
        password: "",
        profileImage: data.profileImage || ""
      });
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données du profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (success) setSuccess("");
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      // 1. Update basic information
      const updateData = {
        nom: form.nom,
        email: form.email,
        password: form.password || undefined,
        role: profile?.role
      };
      await api.put(`/users/${userId}`, updateData);

      // 2. Update profile picture if modified
      if (form.profileImage !== profile?.profileImage) {
        await api.put(`/users/${userId}/image?imageUrl=${encodeURIComponent(form.profileImage)}`);
      }

      localStorage.setItem("nom", form.nom);
      localStorage.setItem("email", form.email);
      setSuccess("Profil mis à jour avec succès !");
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title={t("profileTitle")} subtitle="Gérez vos informations personnelles">

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <BiLoaderAlt size={32} className="animate-spin" color="var(--primary)" />
          </div>
        ) : (
          <div className="grid-2" style={{ gap: 32, alignItems: "start" }}>
            {/* Avatar Column */}
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <div style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                margin: "0 auto 20px",
                border: "4px solid rgba(255,255,255,0.06)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
                    }}
                  />
                ) : (
                  <BiUser size={64} color="var(--text-muted)" />
                )}
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>{profile?.nom}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 20px" }}>{profile?.email}</p>

              <div style={{ display: "flex", flexFlow: "column", gap: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                  <BiBadgeCheck size={16} color="var(--primary)" />
                  <span><strong>{t("profileRole")}:</strong> <span className="badge badge-success">{profile?.role}</span></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                  <BiCalendar size={16} color="var(--text-muted)" />
                  <span><strong>{t("profileDate")}:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="card" style={{ padding: 32 }}>
              {success && (
                <div className="alert alert-success animate-fade-in" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <BiCheckCircle size={16} />
                  {success}
                </div>
              )}

              {error && (
                <div className="alert alert-danger animate-shake" style={{ marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">{t("profileName")}</label>
                  <div className="input-group">
                    <BiUser className="input-icon-left" size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      name="nom"
                      className="form-control has-icon-left"
                      value={form.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profileEmail")}</label>
                  <div className="input-group">
                    <BiEnvelope className="input-icon-left" size={16} color="var(--text-muted)" />
                    <input
                      type="email"
                      name="email"
                      className="form-control has-icon-left"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("profileImage")}</label>
                  <div className="input-group">
                    <BiImage className="input-icon-left" size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      name="profileImage"
                      className="form-control has-icon-left"
                      placeholder={t("profilePlaceholder")}
                      value={form.profileImage}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe (laisser vide pour inchangé)</label>
                  <div className="input-group">
                    <BiLockAlt className="input-icon-left" size={16} color="var(--text-muted)" />
                    <input
                      type="password"
                      name="password"
                      className="form-control has-icon-left"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={saving}>
                  {saving ? (
                    <>
                      <BiLoaderAlt className="animate-spin" size={16} />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <BiSave size={18} />
                      {t("profileSave")}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
    </AppLayout>
  );
}

export default Profile;
