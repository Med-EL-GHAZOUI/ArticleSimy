import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import AppLayout from "../components/AppLayout";
import { useLanguage } from "../context/LanguageContext";
import { 
  BiCheckCircle, 
  BiErrorCircle, 
  BiSearch, 
  BiPlus, 
  BiLoaderAlt, 
  BiTimeFive, 
  BiCartAdd, 
  BiEditAlt, 
  BiTrash, 
  BiX, 
  BiPackage 
} from "react-icons/bi";
import { Article, ArticleRequest } from "../types";
import { useCart } from "../context/CartContext";
import "../styles/articles.css";

const isExpired = (d?: string) => d ? new Date(d) < new Date() : false;
const isExpiringSoon = (d?: string) => {
  if (!d) return false;
  const diff = (new Date(d).getTime() - new Date().getTime()) / 864e5;
  return diff >= 0 && diff <= 30;
};

interface ArticleForm extends Omit<ArticleRequest, "prix" | "quantiteStock"> {
  prix: string | number;
  quantiteStock: string | number;
  imageUrls: string[];
}

interface ToastState {
  msg: string;
  type: "success" | "error";
}

function Articles() {
  const { t, isRtl } = useLanguage();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const { refreshCart } = useCart();

  const [articles, setArticles] = useState<Article[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Article | null>(null);

  const emptyForm: ArticleForm = { nom:"", description:"", prix:"", dateExpiration:"", quantiteStock:"", imageUrls: [] };
  const [form, setForm] = useState<ArticleForm>(emptyForm);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const r = await api.get("/articles/filtre");
      setArticles(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadArticles(); }, []);

  const search = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/articles/filtre?description=${keyword}`);
      setArticles(r.data);
    } finally { setLoading(false); }
  };

  const openModal = (article: Article | null = null) => {
    if (article) {
      setEditTarget(article);
      setForm({
        nom: article.nom,
        description: article.description || "",
        prix: article.prix,
        dateExpiration: article.dateExpiration || "",
        quantiteStock: article.quantiteStock,
        imageUrls: article.imageUrls || [],
      });
    } else {
      setEditTarget(null);
      setForm(emptyForm);
    }
    setModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ArticleRequest = {
      nom: form.nom,
      description: form.description,
      prix: Number(form.prix),
      dateExpiration: form.dateExpiration,
      quantiteStock: Number(form.quantiteStock),
      imageUrls: form.imageUrls,
    };
    try {
      if (editTarget) {
        await api.put(`/articles/${editTarget.id}`, payload);
        showToast("Article mis à jour avec succès.");
      } else {
        await api.post("/articles", payload);
        showToast("Article ajouté avec succès.");
      }
      setModal(false);
      loadArticles();
    } catch (err: any) {
      console.error("Article save error:", err);
      showToast(err.response?.data?.message || err.message || "Une erreur est survenue.", "error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("files", e.target.files[i]);
    }
    try {
      setLoading(true);
      const res = await api.post("/upload/images", formData);
      setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...res.data] }));
      showToast("Images uploadées avec succès.");
    } catch {
      showToast("Erreur lors de l'upload.", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const newUrls = [...prev.imageUrls];
      newUrls.splice(index, 1);
      return { ...prev, imageUrls: newUrls };
    });
  };

  const deleteArticle = async (id: number) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    try {
      await api.delete(`/articles/${id}`);
      showToast("Article supprimé.");
      loadArticles();
    } catch { showToast("Erreur lors de la suppression.", "error"); }
  };

  const addToPanier = async (articleId: number) => {
    const userIdNum = userId ? Number(userId) : NaN;
    if (!userId || Number.isNaN(userIdNum)) {
      showToast("Vous devez être connecté pour ajouter au panier.", "error");
      return;
    }
    try {
      await api.post("/panier/add", { userId: userIdNum, articleId, quantite: 1 });
      showToast("Article ajouté au panier 🛒");
      refreshCart();
    } catch (err: any) {
      console.error("Add to cart error:", err);
      showToast(err.response?.data?.message || "Erreur lors de l'ajout.", "error");
    }
  };

  const stockBadge = (q: number) => {
    if (q === 0) return <span className="badge badge-danger">{t("artOut")}</span>;
    if (q <= 5) return <span className="badge badge-warning">{t("artLow")} ({q})</span>;
    return <span className="badge badge-success">{t("artActive")} ({q})</span>;
  };

  return (
    <AppLayout title={t("artTitle")} subtitle="Catalogue des articles & produits">
      {/* Toast */}
      {toast && (
        <div className={`alert alert-${toast.type === "error" ? "danger" : "success"} animate-slide-in`}
          style={{ position:"fixed", top:20, right:20, zIndex:999, minWidth:280, maxWidth:380, boxShadow:"var(--shadow-xl)", display:"flex", alignItems:"center", gap:8, direction: isRtl ? "rtl" : "ltr" }}>
          {toast.type === "error"
            ? <BiErrorCircle size={18} />
            : <BiCheckCircle size={18} />
          }
          {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap", direction: isRtl ? "rtl" : "ltr" }}>
        <div className="search-bar" style={{ flex:1, minWidth:220, display:"flex", alignItems:"center" }}>
          <BiSearch size={18} color="var(--text-muted)" />
          <input
            placeholder={t("artSearch")}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
          />
        </div>
        <button className="btn btn-outline" onClick={search}>Rechercher</button>
        <button className="btn btn-ghost" onClick={() => { setKeyword(""); loadArticles(); }}>Réinitialiser</button>
        {role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => openModal()} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <BiPlus size={16} />
            {t("artAdd")}
          </button>
        )}
      </div>

      {/* Table */}
        <div className="grid-4" style={{ gap: 24, direction: isRtl ? "rtl" : "ltr" }}>
          {loading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "80px 0", gridColumn: "1 / -1" }}>
               <BiLoaderAlt size={32} className="animate-spin" color="var(--primary)" />
             </div>
          ) : articles.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center", gridColumn: "1 / -1" }}>
              <BiPackage size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: "0 0 8px", fontWeight: 800 }}>Aucun produit trouvé</h3>
            </div>
          ) : (
            articles.map(a => {
              const isOutOfStock = a.quantiteStock === 0;
              const expired = isExpired(a.dateExpiration);
              const expiring = isExpiringSoon(a.dateExpiration);
              
              return (
                <div className="card article-card animate-fade-in" key={a.id} style={{ display: "flex", flexFlow: "column", height: "100%", border: expired ? "1px solid rgba(239,68,68,.3)" : expiring ? "1px solid rgba(245,158,11,.3)" : undefined }}>
                  <div className="article-card-image">
                    {a.imageUrls && a.imageUrls.length > 0 ? (
                      <img src={`http://localhost:8080${a.imageUrls[0]}`} alt={a.nom} />
                    ) : (
                      <BiPackage size={48} color="rgba(255,255,255,0.08)" />
                    )}
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      {stockBadge(a.quantiteStock)}
                    </div>
                  </div>
                  <div style={{ padding: 20, display: "flex", flexFlow: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{a.nom}</h3>
                    </div>
                    {expired && <span className="badge badge-danger" style={{ marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}><BiTimeFive size={13} /> {t("artExpired")}</span>}
                    {!expired && expiring && <span className="badge badge-warning" style={{ marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}><BiTimeFive size={13} /> Bientôt expiré</span>}
                    
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", marginBottom: 20 }}>
                      {Number(a.prix).toLocaleString("fr-MA")} DH
                    </div>
                    
                    <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                      {role === "ADMIN" ? (
                        <>
                          <button
                            onClick={() => openModal(a)}
                            className="btn btn-outline"
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", fontSize: 14 }}
                          >
                            <BiEditAlt size={18} /> Modifier
                          </button>
                          <button
                            onClick={() => deleteArticle(a.id!)}
                            className="btn btn-danger"
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", fontSize: 14 }}
                          >
                            <BiTrash size={18} /> Supprimer
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => addToPanier(a.id!)}
                          className="btn btn-primary"
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", fontSize: 15 }}
                          disabled={isOutOfStock}
                        >
                          <BiCartAdd size={20} />
                          {isOutOfStock ? "Rupture de stock" : "Ajouter au Panier"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ direction: isRtl ? "rtl" : "ltr" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
                {editTarget ? <BiEditAlt size={18} /> : <BiPackage size={18} />}
                {editTarget ? "Modifier l'article" : t("artAdd")}
              </h3>
              <button className="btn-icon" onClick={() => setModal(false)} style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                <BiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom du produit *</label>
                  <input name="nom" className="form-control" value={form.nom} onChange={handleChange} placeholder="Nom du produit" required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description du produit"
                    rows={3}
                  />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div className="form-group">
                    <label className="form-label">Prix (DH) *</label>
                    <input name="prix" type="number" step="0.01" min="0" className="form-control" value={form.prix} onChange={handleChange} placeholder="0.00" required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantité en stock *</label>
                    <input name="quantiteStock" type="number" min="0" className="form-control" value={form.quantiteStock} onChange={handleChange} placeholder="0" required/>
                  </div>
                </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Date d'expiration *</label>
                    <input name="dateExpiration" type="date" className="form-control" value={form.dateExpiration} onChange={handleChange} required/>
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Images du produit</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                      {form.imageUrls.map((url, idx) => (
                        <div key={idx} style={{ position: "relative", width: 60, height: 60 }}>
                          <img src={`http://localhost:8080${url}`} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                          <button type="button" onClick={() => removeImage(idx)} style={{ position: "absolute", top: -6, right: -6, background: "var(--danger)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <BiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <BiPlus size={16} />
                      Ajouter des images
                      <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editTarget ? "Mettre à jour" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Articles;
