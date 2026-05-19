import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useLanguage } from "../context/LanguageContext";
import { BiCube, BiPackage, BiCart, BiGridAlt, BiErrorCircle, BiEnvelope, BiLockAlt, BiShow, BiHide, BiLoaderAlt } from "react-icons/bi";
import "../styles/auth.css";

function Login() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = localStorage.getItem("role");
      const isAdmin = role === "ADMIN";
      navigate(isAdmin ? "/dashboard" : "/articles", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    setIsLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Check if 2FA is required
      if (data.twoFactorRequired) {
        setTwoFactorRequired(true);
        setIsLoading(false);
        return;
      }

      completeLogin(data);
    } catch (err: any) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.status === 401) setError("Email ou mot de passe incorrect.");
      else if (err.request) setError("Serveur inaccessible. Vérifiez votre connexion.");
      else setError("Une erreur inattendue s'est produite.");
    } finally { setIsLoading(false); }
  };

  const completeLogin = (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("nom", data.nom || data.email);
    const isAdmin = data.role === "ADMIN";
    navigate(isAdmin ? "/dashboard" : "/articles", { replace: true });
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/2fa/verify", {
        email: form.email.trim().toLowerCase(),
        code: twoFactorCode,
      });
      completeLogin(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Code 2FA invalide ou expiré.");
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
            ArticleSimy
          </h1>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, marginBottom: 40, lineHeight: 1.7 }}>
            Gérez vos articles, commandes et stocks en toute simplicité.
          </p>

          {[
            { icon: <BiPackage size={18} />, title: t("navArticles"), desc: "Catalogue complet de produits" },
            { icon: <BiCart size={18} />, title: t("navCart"), desc: "Suivi en temps réel de votre panier" },
            { icon: <BiGridAlt size={18} />, title: t("navDashboard"), desc: "Statistiques et indicateurs" },
          ].map((f) => (
            <div className="auth-feature" key={f.title} style={{ flexDirection: isRtl ? "row-reverse" : "row" }}>
              <div className="auth-feature-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.icon}
              </div>
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
              {t("navLogin")}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Connectez-vous à votre compte pour continuer.
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
              <label className="form-label">Adresse email</label>
              <div className="input-group">
                <BiEnvelope className="input-icon-left" size={16} color="var(--text-muted)" style={{ top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  name="email"
                  className="form-control has-icon-left"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right btn-ghost"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {showPassword
                    ? <BiHide size={16} color="var(--text-muted)" />
                    : <BiShow size={16} color="var(--text-muted)" />
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={isLoading}>
              {isLoading ? (
                <>
                  <BiLoaderAlt className="animate-spin" size={17} />
                  Connexion…
                </>
              ) : `${t("navLogin")} →`}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }} />
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13.5 }}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
