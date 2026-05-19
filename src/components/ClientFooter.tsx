import React from "react";

function ClientFooter() {
  return (
    <footer style={{ 
      background: "var(--bg-dark)", 
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "48px 24px",
      marginTop: "auto"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
        
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Article<span style={{ color: "var(--primary)" }}>Simy</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
            La plateforme e-commerce moderne pour une gestion fluide de vos produits et une expérience d'achat inégalée.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Liens Rapides</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="/articles" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Boutique</a>
            <a href="/panier" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Panier</a>
            <a href="/commandes" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Mes Commandes</a>
            <a href="/profile" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Mon Compte</a>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Support</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>FAQ</a>
            <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Contactez-nous</a>
            <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Politique de confidentialité</a>
            <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>Conditions d'utilisation</a>
          </div>
        </div>

      </div>

      <div style={{ maxWidth: 1200, margin: "40px auto 0", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        © {new Date().getFullYear()} ArticleSimy. Tous droits réservés.
      </div>
    </footer>
  );
}

export default ClientFooter;
