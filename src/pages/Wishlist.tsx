import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axiosConfig";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { BiHeart, BiTrash, BiCart, BiLoaderAlt, BiCheckCircle } from "react-icons/bi";
import { Article, WishlistItem } from "../types";
import "../styles/layout.css";

function Wishlist() {
  const { t, isRtl } = useLanguage();
  const userId = localStorage.getItem("userId");
  const { fetchCart } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || Number.isNaN(Number(userId))) {
      setError("Utilisateur introuvable. Veuillez vous reconnecter.");
      setWishlist([]);
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      if (!userId || Number.isNaN(Number(userId))) {
        throw new Error("Utilisateur introuvable");
      }
      const { data } = await api.get(`/wishlists/user/${userId}`);
      setWishlist(data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setError("Erreur de chargement des favoris.");
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (articleId: number) => {
    if (!userId || Number.isNaN(Number(userId))) {
      setError("Utilisateur introuvable. Veuillez vous reconnecter.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      await api.delete(`/wishlists?userId=${userId}&articleId=${articleId}`);
      setWishlist(prev => prev.filter(item => item.article.id !== articleId));
      setMessage("Article retiré de vos favoris !");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Impossible de retirer l'article des favoris.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const addToCart = async (article: Article) => {
    const userIdNum = userId ? Number(userId) : NaN;
    if (!userId || Number.isNaN(userIdNum)) {
      setError("Vous devez être connecté pour ajouter au panier.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      await api.post("/panier/add", {
        userId: userIdNum,
        articleId: article.id,
        quantite: 1
      });
      fetchCart(); // Sync Navbar badge
      setMessage(`"${article.nom}" ajouté au panier !`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Impossible d'ajouter au panier.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <AppLayout title={t("navWishlist")} subtitle="Vos articles et produits favoris">

        {message && (
          <div className="alert alert-success animate-fade-in" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BiCheckCircle size={16} />
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger animate-shake" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <BiLoaderAlt size={32} className="animate-spin" color="var(--primary)" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
            <BiHeart size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: "0 0 8px", fontWeight: 800 }}>Votre liste de favoris est vide</h3>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>Parcourez les articles et ajoutez-les pour les retrouver ici !</p>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: 24 }}>
            {wishlist.map((item) => {
              const art = item.article;
              const isOutOfStock = art.quantiteStock === 0;

              return (
                <div className="card animate-fade-in" key={item.id} style={{ display: "flex", flexFlow: "column", height: "100%" }}>
                  <div style={{
                    height: 180,
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {art.imageUrls && art.imageUrls.length > 0 ? (
                      <img
                        src={`http://localhost:8080${art.imageUrls[0]}`}
                        alt={art.nom}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <BiHeart size={48} color="rgba(255,255,255,0.08)" />
                    )}

                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      {isOutOfStock ? (
                        <span className="badge badge-danger">{t("artOut")}</span>
                      ) : art.quantiteStock <= 5 ? (
                        <span className="badge badge-warning">{t("artLow")}</span>
                      ) : (
                        <span className="badge badge-success">{t("artActive")}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: 20, display: "flex", flexFlow: "column", flexGrow: 1 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>{art.nom}</h3>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", marginBottom: 20 }}>
                      {art.prix.toFixed(2)} DH
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                      <button
                        onClick={() => addToCart(art)}
                        className="btn btn-primary"
                        style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        disabled={isOutOfStock}
                      >
                        <BiCart size={16} />
                        Ajouter au Panier
                      </button>

                      <button
                        onClick={() => removeFromWishlist(art.id)}
                        className="btn btn-danger"
                        style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Retirer des favoris"
                      >
                        <BiTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </AppLayout>
  );
}

export default Wishlist;
