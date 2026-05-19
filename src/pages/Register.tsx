import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useLanguage } from "../context/LanguageContext";
import { BiCube, BiRocket, BiLockAlt, BiTargetLock, BiErrorCircle, BiUser, BiEnvelope, BiShow, BiHide, BiLoaderAlt } from "react-icons/bi";
import "../styles/auth.css";

function Register() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: "", email: "", password: "", role: "CLIENT" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.password) { setError("Tous les champs sont requis."); return; }
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setIsLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);
      localStorage.setItem("nom", data.nom || form.nom);
      const isAdmin = data.role === "ADMIN";
      navigate(isAdmin ? "/dashboard" : "/articles", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 409) setError("Un compte avec cet email existe déjà.");
      else if (err.request) setError("Serveur inaccessible. Vérifiez votre connexion.");
      else setError("Une erreur inattendue s'est produite.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="auth-page" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Left panel */}
      <div className="auth-left">
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360, textAlign: isRtl ? "right" : "left" }}>
          <div className="auth-logo animate-float" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BiCube size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>
            Rejoignez<br />ArticleSimy
          </h1>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, marginBottom: 40, lineHeight: 1.7 }}>
            Créez votre compte et commencez à gérer votre stock intelligemment.
          </p>
          {[
            { icon: <BiRocket size={18} />, title: "Démarrage rapide", desc: "Compte actif en quelques secondes" },
            { icon: <BiLockAlt size={18} />, title: "Sécurisé", desc: "Authentification JWT robuste" },
            { icon: <BiTargetLock size={18} />, title: "Intuitif", desc: "Interface pensée pour la productivité" },
          ].map(f => (
            <div className="auth-feature" key={f.title} style={{ flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div className="auth-feature-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon}</div>
              <div style={{ textAlign: isRtl ? "right" : "left" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12.5, marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 32, textAlign: isRtl ? "right" : "left" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
              Créer un compte ✨
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Remplissez le formulaire ci-dessous pour commencer.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger animate-shake" style={{ display: "flex", alignItems: "center", gap: 8, direction: isRtl ? "rtl" : "ltr" }}>
              <BiErrorCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: isRtl ? "right" : "left" }}>
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <div className="input-group">
                <BiUser className="input-icon-left" size={16} color="var(--text-muted)" style={{ top: "50%", transform: "translateY(-50%)" }} />
                <input type="text" name="nom" className="form-control has-icon-left" placeholder="Votre nom complet" value={form.nom} onChange={handleChange} disabled={isLoading} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <div className="input-group">
                <BiEnvelope className="input-icon-left" size={16} color="var(--text-muted)" style={{ top: "50%", transform: "translateY(-50%)" }} />
                <input type="email" name="email" className="form-control has-icon-left" placeholder="exemple@email.com" value={form.email} onChange={handleChange} disabled={isLoading} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="input-group">
                <BiLockAlt className="input-icon-left" size={16} color="var(--text-muted)" style={{ top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control has-icon-left has-icon-right"
                  placeholder="Min. 6 caractères"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <button type="button" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  className="input-icon-right btn-ghost" onClick={() => setShowPassword(v => !v)}>
                  {showPassword
                    ? <BiHide size={16} color="var(--text-muted)" />
                    : <BiShow size={16} color="var(--text-muted)" />
                  }
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rôle</label>
              <select name="role" className="form-control" value={form.role} onChange={handleChange} disabled={isLoading}>
                <option value="CLIENT">👤 Client</option>
                <option value="ADMIN">🛡️ Administrateur</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={isLoading}>
              {isLoading ? (
                <>
                  <BiLoaderAlt className="animate-spin" size={17} />
                  Création du compte…
                </>
              ) : "Créer mon compte →"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }} />
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13.5 }}>
            Déjà un compte ?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
