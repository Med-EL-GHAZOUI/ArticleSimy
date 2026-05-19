import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import { useLanguage } from "../context/LanguageContext";
import { BiCart, BiPackage, BiTrash, BiLoaderAlt, BiCheck } from "react-icons/bi";
import { Panier as PanierType, PanierItem } from "../types";
import { useCart } from "../context/CartContext";
import "../styles/panier.css";

interface ToastState {
  msg: string;
  type: "success" | "error";
}

function Panier() {
  const { t, isRtl } = useLanguage();
  const userId = localStorage.getItem("userId");
  const { refreshCart } = useCart();
  const [panier, setPanier] = useState<PanierType | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [validating, setValidating] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    if (!userId || Number.isNaN(Number(userId))) {
      setPanier(null);
      return;
    }
    try {
      const r = await api.get(`/panier/${userId}`);
      setPanier(r.data);
    } catch { setPanier(null); }
  };

  useEffect(() => { load(); }, [userId]);

  const changeQty = async (ligneId: number, delta: number, current: number) => {
    const next = current + delta;
    if (next < 1) return;
    const userIdNum = userId ? Number(userId) : NaN;
    if (!userId || Number.isNaN(userIdNum)) {
      showToast("Utilisateur introuvable. Veuillez vous reconnecter.", "error");
      return;
    }
    try {
      await api.put(`/panier/update`, {
        userId: userIdNum,
        ligneId,
        quantite: next,
      });
      load();
      refreshCart();
    } catch {
      showToast("Erreur lors de la mise à jour du panier.", "error");
    }
  };

  const removeItem = async (ligneId: number) => {
    if (!userId || Number.isNaN(Number(userId))) {
      showToast("Utilisateur introuvable. Veuillez vous reconnecter.", "error");
      return;
    }
    try {
      await api.delete(`/panier/remove/${userId}/${ligneId}`);
      load();
      refreshCart();
    } catch {
      showToast("Erreur lors de la suppression du produit.", "error");
    }
  };

  const valider = async () => {
    if (!userId || Number.isNaN(Number(userId))) {
      showToast("Utilisateur introuvable. Veuillez vous reconnecter.", "error");
      return;
    }
    setValidating(true);
    try {
      await api.post(`/panier/checkout/${userId}`);
      showToast("🎉 Commande passée avec succès !");
      setPanier(null);
      refreshCart();
    } catch {
      showToast("Erreur lors de la validation.", "error");
    } finally { setValidating(false); }
  };

  const lignes: PanierItem[] = panier?.lignes || [];
  const total = lignes.reduce((s, l) => s + l.article.prix * l.quantite, 0);
  const itemCount = lignes.reduce((s, l) => s + l.quantite, 0);

  return (
    <AppLayout title={t("cartTitle")} subtitle={`${itemCount} article${itemCount !== 1 ? "s" : ""} dans votre panier`}>
      {toast && (
        <div className={`alert alert-${toast.type === "error" ? "danger" : "success"} animate-slide-in`}
          style={{ position:"fixed", top:20, right:20, zIndex:999, minWidth:280, boxShadow:"var(--shadow-xl)", direction: isRtl ? "rtl" : "ltr" }}>
          {toast.msg}
        </div>
      )}

      {lignes.length === 0 ? (
        <div className="card animate-fade-in" style={{ textAlign:"center", padding:"80px 32px", direction: isRtl ? "rtl" : "ltr" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
            <BiCart size={64} color="var(--text-muted)" />
          </div>
          <div style={{ fontWeight:700, fontSize:20, marginBottom:8, color:"var(--text-primary)" }}>{t("cartEmpty")}</div>
          <div style={{ color:"var(--text-muted)", marginBottom:28 }}>Ajoutez des articles depuis le catalogue pour commencer.</div>
          <a href="/articles" className="btn btn-primary" style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
            Voir le catalogue →
          </a>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: isRtl ? "320px 1fr" : "1fr 320px", gap:24, alignItems:"start", direction: isRtl ? "rtl" : "ltr" }}>
          {/* Items */}
          <div>
            <div style={{ marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Articles ({lignes.length})</span>
              <button className="btn btn-ghost btn-sm" style={{ color:"var(--danger)", fontSize:12.5 }}
                onClick={() => window.confirm("Vider le panier ?") && lignes.forEach(l => removeItem(l.id))}>
                Vider le panier
              </button>
            </div>

            {lignes.map(l => (
              <div key={l.id} className="panier-item animate-fade-in">
                <div className="panier-item-img" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {l.article.imageUrls && l.article.imageUrls.length > 0 ? (
                    <img src={`http://localhost:8080${l.article.imageUrls[0]}`} alt={l.article.description} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <BiPackage size={24} color="var(--text-muted)" />
                  )}
                </div>

                <div style={{ flex:1, minWidth:0, textAlign: isRtl ? "right" : "left" }}>
                  <div style={{ fontWeight:700, color:"var(--text-primary)", marginBottom:2, fontSize:14 }}>
                    {l.article.description}
                  </div>
                  <div style={{ color:"var(--text-muted)", fontSize:12.5 }}>
                    Prix unitaire : <strong style={{ color:"var(--primary)" }}>{l.article.prix} DH</strong>
                  </div>
                </div>

                <div className="qty-control">
                  <button className="qty-btn" onClick={() => changeQty(l.id, -1, l.quantite)}>−</button>
                  <span className="qty-value">{l.quantite}</span>
                  <button className="qty-btn" onClick={() => changeQty(l.id, +1, l.quantite)}>+</button>
                </div>

                <div style={{ minWidth:80, textAlign: isRtl ? "left" : "right" }}>
                  <div style={{ fontWeight:800, fontSize:15, color:"var(--text-primary)" }}>
                    {(l.article.prix * l.quantite).toLocaleString("fr-MA")} DH
                  </div>
                </div>

                <button className="btn-icon danger" onClick={() => removeItem(l.id)} title="Supprimer" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <BiTrash size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card animate-fade-in" style={{ position:"sticky", top:88 }}>
            <div className="card-header">
              <div className="card-title">Résumé de commande</div>
            </div>
            <div className="card-body">
              {lignes.map(l => (
                <div key={l.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:13 }}>
                  <span style={{ color:"var(--text-secondary)" }}>
                    {l.article.description} <span style={{ color:"var(--text-muted)" }}>×{l.quantite}</span>
                  </span>
                  <span style={{ fontWeight:600 }}>{(l.article.prix * l.quantite).toLocaleString("fr-MA")} DH</span>
                </div>
              ))}

              <div className="divider"/>

              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:"var(--text-muted)", fontSize:13 }}>Sous-total</span>
                <span style={{ fontWeight:600 }}>{total.toLocaleString("fr-MA")} DH</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ color:"var(--text-muted)", fontSize:13 }}>Livraison</span>
                <span className="badge badge-success">Gratuite</span>
              </div>

              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"14px 0", borderTop:"2px solid var(--border)",
                marginBottom:20,
              }}>
                <span style={{ fontWeight:700, fontSize:15 }}>{t("cartTotal")}</span>
                <span style={{ fontWeight:800, fontSize:20, color:"var(--primary)" }}>
                  {total.toLocaleString("fr-MA")} DH
                </span>
              </div>

              <button
                className="btn btn-success btn-lg"
                style={{ width:"100%" }}
                onClick={valider}
                disabled={validating}
              >
                {validating ? (
                  <>
                    <BiLoaderAlt className="animate-spin" size={16} />
                    Validation…
                  </>
                ) : (
                  <>
                    <BiCheck size={18} />
                    {t("cartCheckout")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Panier;
