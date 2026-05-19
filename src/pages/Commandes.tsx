import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import { useLanguage } from "../context/LanguageContext";
import { BiTimeFive, BiCheckCircle, BiPackage, BiXCircle, BiLoaderAlt, BiReceipt, BiChevronDown, BiTrash, BiDownload, BiMapPin, BiBox, BiCar } from "react-icons/bi";
import { Commande, CommandeDetail } from "../types";
import { toast } from "sonner";
import "../styles/commandes.css";

interface StatutMetaDetail {
  label: string;
  badge: string;
  icon: React.ReactNode;
  textIcon: string;
  step: number;
}

const STATUT_META: Record<string, StatutMetaDetail> = {
  CREATED:   { label:"Créée",      badge:"badge-warning",  icon: <BiTimeFive size={20} color="var(--warning)" />,     textIcon: "🕐", step:0 },
  CONFIRMED: { label:"Confirmée",  badge:"badge-info",     icon: <BiCheckCircle size={20} color="var(--info)" />,     textIcon: "✅", step:1 },
  PACKED:    { label:"Emballée",   badge:"badge-purple",   icon: <BiBox size={20} color="#8b5cf6" />,                 textIcon: "📦", step:2 },
  SHIPPED:   { label:"Expédiée",   badge:"badge-primary",  icon: <BiCar size={20} color="var(--primary)" />,        textIcon: "🚚", step:3 },
  DELIVERED: { label:"Livrée",     badge:"badge-success",  icon: <BiPackage size={20} color="var(--success)" />,      textIcon: "📦", step:4 },
  CANCELLED: { label:"Annulée",    badge:"badge-danger",   icon: <BiXCircle size={20} color="var(--danger)" />,       textIcon: "❌", step:-1 },
};

function Commandes() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER";

  const load = async () => {
    setLoading(true);
    try {
      if (!isAdmin && (!userId || Number.isNaN(Number(userId)))) {
        toast.error("Utilisateur introuvable. Veuillez vous reconnecter.");
        setCommandes([]);
        return;
      }

      const url = isAdmin ? "/commandes" : `/commandes/user/${userId}`;
      const r = await api.get(url);
      setCommandes(Array.isArray(r.data) ? r.data : []);
    } catch (error) {
      console.error("Erreur chargement commandes", error);
      toast.error("Impossible de charger les commandes.");
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAdmin, userId]);

  const modifierStatut = async (id: number, statut: string) => {
    try {
      await api.put(`/commandes/${id}/status`, { status: statut });
      toast.success("Statut mis à jour.");
      load();
    } catch { toast.error("Erreur lors de la mise à jour."); }
  };

  const supprimer = async (id: number) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await api.delete(`/commandes/${id}`);
      toast.success("Commande supprimée.");
      load();
    } catch { toast.error("Erreur lors de la suppression."); }
  };

  const downloadFacture = async (id: number, invoiceNumber: string) => {
    try {
      toast.info("Préparation de la facture...");
      const response = await api.get(`/commandes/${id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${invoiceNumber || 'facture-' + id}.pdf`;
      link.click();
      toast.success("Facture PDF téléchargée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du téléchargement.");
    }
  };

  const totalAmount = (c: Commande) =>
    c.totalAmount || (c.lignes || []).reduce((s, l) => s + (l.prixUnitaire || 0) * (l.quantite || 0), 0);

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";

  return (
    <AppLayout title={t("orderTitle")} subtitle={isAdmin ? "Toutes les commandes du système" : "Historique de mes achats"}>
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
          <BiLoaderAlt className="animate-spin" size={32} style={{ margin:"0 auto 12px", display:"block", color:"var(--primary)" }} />
          Chargement des commandes…
        </div>
      ) : commandes.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:"64px 32px", direction: isRtl ? "rtl" : "ltr" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <BiReceipt size={48} color="var(--text-muted)" />
          </div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Aucune commande</div>
          <div style={{ color:"var(--text-muted)" }}>Vos commandes apparaîtront ici une fois passées.</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14, direction: isRtl ? "rtl" : "ltr" }}>
          {commandes.map((c, i) => {
            const meta = STATUT_META[c.statut] || STATUT_META.CREATED;
            const isExp = expanded === c.id;
            const montant = totalAmount(c);

            return (
              <div key={c.id} className="card animate-fade-in" style={{ animationDelay:`${i * .04}s`, overflow:"hidden" }}>
                {/* Card header */}
                <div
                  style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 22px", cursor:"pointer" }}
                  onClick={() => setExpanded(isExp ? null : c.id)}
                >
                  {/* Icon */}
                  <div style={{
                    width:42, height:42, borderRadius:12, flexShrink:0,
                    background: c.statut === "DELIVERED" ? "rgba(16,185,129,0.1)" : c.statut === "CANCELLED" ? "rgba(239,68,68,0.1)" : "rgba(79,70,229,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>
                    {meta.icon}
                  </div>

                  <div style={{ flex:1, minWidth:0, textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, color:"var(--text-primary)" }}>
                        {c.invoiceNumber ? `${t("orderInvoice")} ${c.invoiceNumber}` : `Commande #${c.id}`}
                      </span>
                      <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    </div>
                    <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:3 }}>
                      {fmtDate(c.dateCommande)}
                      {isAdmin && c.user && <> · <span style={{ fontWeight:600 }}>{c.user.nom}</span> ({c.user.email})</>}
                    </div>
                  </div>

                  <div style={{ textAlign: isRtl ? "left" : "right", flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"var(--primary)" }}>
                      {montant.toLocaleString("fr-MA")} DH
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>{(c.lignes || []).length} article{(c.lignes?.length||0)>1?"s":""}</div>
                  </div>

                  <BiChevronDown
                    size={18}
                    style={{ transition:"transform .25s", transform: isExp ? "rotate(180deg)" : "rotate(0)", flexShrink:0, color:"var(--text-muted)" }}
                  />
                </div>

                {/* Expandable detail */}
                {isExp && (
                  <div style={{ borderTop:"1px solid var(--border)", padding:"18px 22px" }}>
                    {/* Progress tracking timeline */}
                    {meta.step >= 0 && (
                      <div className="order-timeline" style={{ display: "flex", justifyContent: "space-between", position: "relative", margin: "24px 0", padding: "0 10px" }}>
                        <div style={{ position: "absolute", top: 10, left: 10, right: 10, height: 4, background: "rgba(255,255,255,0.06)", zIndex: 0 }} />
                        <div style={{ position: "absolute", top: 10, left: 10, width: `${(meta.step / 4) * 100}%`, height: 4, background: "linear-gradient(90deg, var(--primary), #10b981)", zIndex: 0, transition: "width 0.4s ease" }} />
                        {["CREATED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].map((st) => {
                          const itemMeta = STATUT_META[st];
                          const isActive = meta.step >= itemMeta.step;
                          const isCurrent = c.statut === st;
                          return (
                            <div key={st} style={{ display: "flex", flexFlow: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                              <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: isActive ? "var(--primary)" : "rgba(30, 41, 59, 0.9)",
                                border: isCurrent ? "2px solid #fff" : isActive ? "2px solid var(--primary)" : "2px solid rgba(255,255,255,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#fff",
                                boxShadow: isCurrent ? "0 0 12px rgba(79,70,229,0.5)" : "none",
                              }}>
                                {itemMeta.step + 1}
                              </div>
                              <span style={{ fontSize: 10, marginTop: 6, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--primary)" : "var(--text-muted)" }}>
                                {itemMeta.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Lines */}
                    {(c.lignes || []).length > 0 ? (
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"var(--text-muted)", marginBottom:10, textAlign: isRtl ? "right" : "left" }}>
                          Détails des articles achetés
                        </div>
                        {c.lignes.map(l => (
                          <div key={l.id} style={{
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"10px 14px", borderRadius:"var(--radius-sm)",
                            background:"rgba(255,255,255,0.02)", marginBottom:6,
                            fontSize:13.5,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {l.article?.imageUrls && l.article.imageUrls.length > 0 ? (
                                <img src={`http://localhost:8080${l.article.imageUrls[0]}`} alt={l.article.nom || l.article.description} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <BiPackage size={16} color="rgba(255,255,255,0.2)" />
                                </div>
                              )}
                              <span style={{ fontWeight:600, color:"var(--text-primary)" }}>{l.article?.nom || l.article?.description || "—"}</span>
                            </div>
                            <div style={{ display:"flex", gap:20, color:"var(--text-muted)" }}>
                              <span>Qte: <strong style={{ color:"var(--text-primary)" }}>{l.quantite}</strong></span>
                              <span>{l.prixUnitaire} DH/u</span>
                              <span style={{ fontWeight:700, color:"var(--primary)" }}>
                                {(l.prixUnitaire * l.quantite).toLocaleString("fr-MA")} DH
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color:"var(--text-muted)", fontSize:13.5 }}>Aucun article dans cette commande.</p>
                    )}

                    {/* Actions panel */}
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                      {/* Invoice PDF download */}
                      <button
                        onClick={() => downloadFacture(c.id, c.invoiceNumber || `facture-${c.id}`)}
                        className="btn btn-outline"
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}
                      >
                        <BiDownload size={15} />
                        {t("orderDownload")}
                      </button>

                      {/* Order Tracking */}
                      <button
                        onClick={() => navigate(`/commandes/${c.id}/tracking`)}
                        className="btn btn-outline"
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 14px" }}
                      >
                        <BiMapPin size={15} />
                        {t("orderTracking")}
                      </button>

                      {/* Admin updates */}
                      {isAdmin && (
                        <>
                          <select
                            value={c.statut}
                            onChange={e => modifierStatut(c.id, e.target.value)}
                            className="form-control"
                            style={{ width:"auto", paddingRight:32, cursor:"pointer", fontSize: 13 }}
                          >
                            {Object.entries(STATUT_META).map(([v, m]) => (
                              <option key={v} value={v}>{m.textIcon} {m.label}</option>
                            ))}
                          </select>

                          <button className="btn btn-danger btn-sm" onClick={() => supprimer(c.id)} style={{ display:"inline-flex", alignItems:"center", gap:4, height: 36 }}>
                            <BiTrash size={13} />
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default Commandes;
