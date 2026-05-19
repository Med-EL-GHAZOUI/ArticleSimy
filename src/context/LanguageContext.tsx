import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "en" | "ar";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    navArticles: "Produits",
    navCart: "Panier",
    navOrders: "Commandes",
    navDashboard: "Dashboard",
    navWishlist: "Favoris",
    navProfile: "Mon Profil",
    navLogout: "Déconnexion",
    navAudit: "Logs d'Audit",
    navLogin: "Connexion",
    navUsers: "Utilisateurs",
    navNotifications: "Notifications",
    // Welcome
    welcomeTitle: "Bienvenue sur ArticleSimy",
    welcomeSubtitle: "Votre plateforme e-commerce modernisée avec Spring Boot et React.",
    welcomeStart: "Commencer mes achats",
    // Articles page
    artTitle: "Catalogue des Produits",
    artAdd: "Ajouter un Produit",
    artSearch: "Rechercher un produit...",
    artName: "Nom",
    artPrix: "Prix",
    artStock: "Quantité en Stock",
    artExpiry: "Date d'expiration",
    artStatus: "Statut",
    artActions: "Actions",
    artOut: "En rupture",
    artLow: "Stock faible",
    artExpired: "Expiré",
    artActive: "Disponible",
    artCategory: "Catégorie",
    artViews: "Vues",
    artTrending: "Tendance",
    artCheap: "Bon marché",
    artBestQuality: "Meilleure qualité",
    // Cart page
    cartTitle: "Mon Panier",
    cartEmpty: "Votre panier est vide.",
    cartCheckout: "Valider ma commande",
    cartTotal: "Total Général",
    // Orders page
    orderTitle: "Mes Commandes",
    orderInvoice: "Facture N°",
    orderDate: "Date",
    orderStatus: "Statut",
    orderDownload: "Télécharger Facture PDF",
    orderTracking: "Suivre la commande",
    orderTimeline: "Suivi de commande",
    // Order statuses
    statusCreated: "Créée",
    statusConfirmed: "Confirmée",
    statusPacked: "Emballée",
    statusShipped: "Expédiée",
    statusDelivered: "Livrée",
    statusCancelled: "Annulée",
    // Dashboard page
    dashTitle: "Tableau de Bord Administratif",
    dashArticles: "Total Produits",
    dashOrders: "Total Commandes",
    dashUsers: "Total Utilisateurs",
    dashStockFaible: "Stocks Faibles",
    dashCA: "Chiffre d'Affaires",
    dashLatestOrders: "Dernières Commandes",
    dashSalesTrend: "Tendance des Ventes",
    dashTopClients: "Top Clients",
    dashDailyRevenue: "Revenus Journaliers",
    dashConversion: "Taux de Conversion",
    // Profile page
    profileTitle: "Profil Utilisateur",
    profileName: "Nom complet",
    profileEmail: "Adresse email",
    profileRole: "Rôle de compte",
    profileDate: "Date de création",
    profileSave: "Enregistrer les modifications",
    profileImage: "Photo de Profil Link (URL)",
    profilePlaceholder: "Entrez l'URL d'une image...",
    profilePhone: "Téléphone",
    profile2FA: "Authentification 2FA",
    // Users management
    usersTitle: "Gestion des Utilisateurs",
    usersSearch: "Rechercher par nom ou email...",
    usersRole: "Rôle",
    usersStatus: "Statut",
    usersCreated: "Créé le",
    // Notifications
    notifTitle: "Notifications",
    notifAll: "Toutes",
    notifUnread: "Non lues",
    notifMarkAll: "Tout marquer comme lu",
    notifEmpty: "Aucune notification",
    // General
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    search: "Rechercher",
    loading: "Chargement...",
    noData: "Aucune donnée",
    actions: "Actions",
  },
  en: {
    // Navigation
    navArticles: "Products",
    navCart: "Cart",
    navOrders: "Orders",
    navDashboard: "Dashboard",
    navWishlist: "Wishlist",
    navProfile: "My Profile",
    navLogout: "Sign Out",
    navAudit: "Audit Logs",
    navLogin: "Sign In",
    navUsers: "Users",
    navNotifications: "Notifications",
    // Welcome
    welcomeTitle: "Welcome to ArticleSimy",
    welcomeSubtitle: "Your modern e-commerce platform built with Spring Boot and React.",
    welcomeStart: "Start Shopping",
    // Articles page
    artTitle: "Product Catalog",
    artAdd: "Add New Product",
    artSearch: "Search products...",
    artName: "Name",
    artPrix: "Price",
    artStock: "Stock Quantity",
    artExpiry: "Expiration Date",
    artStatus: "Status",
    artActions: "Actions",
    artOut: "Out of Stock",
    artLow: "Low Stock",
    artExpired: "Expired",
    artActive: "Available",
    artCategory: "Category",
    artViews: "Views",
    artTrending: "Trending",
    artCheap: "Affordable",
    artBestQuality: "Best Quality",
    // Cart page
    cartTitle: "Shopping Cart",
    cartEmpty: "Your cart is empty.",
    cartCheckout: "Validate Order",
    cartTotal: "Grand Total",
    // Orders page
    orderTitle: "My Orders",
    orderInvoice: "Invoice No.",
    orderDate: "Date",
    orderStatus: "Status",
    orderDownload: "Download PDF Invoice",
    orderTracking: "Track Order",
    orderTimeline: "Order Tracking",
    // Order statuses
    statusCreated: "Created",
    statusConfirmed: "Confirmed",
    statusPacked: "Packed",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    // Dashboard page
    dashTitle: "Admin Dashboard Analytics",
    dashArticles: "Total Products",
    dashOrders: "Total Orders",
    dashUsers: "Total Users",
    dashStockFaible: "Low Stock Items",
    dashCA: "Total Revenue",
    dashLatestOrders: "Latest Orders",
    dashSalesTrend: "Sales Trends",
    dashTopClients: "Top Clients",
    dashDailyRevenue: "Daily Revenue",
    dashConversion: "Conversion Rate",
    // Profile page
    profileTitle: "User Profile Settings",
    profileName: "Full Name",
    profileEmail: "Email Address",
    profileRole: "Account Role",
    profileDate: "Joined Date",
    profileSave: "Save Changes",
    profileImage: "Profile Photo URL Link",
    profilePlaceholder: "Enter image URL address...",
    profilePhone: "Phone",
    profile2FA: "Two-Factor Authentication",
    // Users management
    usersTitle: "User Management",
    usersSearch: "Search by name or email...",
    usersRole: "Role",
    usersStatus: "Status",
    usersCreated: "Created",
    // Notifications
    notifTitle: "Notifications",
    notifAll: "All",
    notifUnread: "Unread",
    notifMarkAll: "Mark all as read",
    notifEmpty: "No notifications",
    // General
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    loading: "Loading...",
    noData: "No data",
    actions: "Actions",
  },
  ar: {
    // Navigation
    navArticles: "المنتجات",
    navCart: "السلة",
    navOrders: "الطلبات",
    navDashboard: "لوحة التحكم",
    navWishlist: "المفضلة",
    navProfile: "الملف الشخصي",
    navLogout: "تسجيل الخروج",
    navAudit: "سجلات المراجعة",
    navLogin: "تسجيل الدخول",
    navUsers: "المستخدمون",
    navNotifications: "الإشعارات",
    // Welcome
    welcomeTitle: "مرحباً بكم في ArticleSimy",
    welcomeSubtitle: "منصتكم الحديثة للتجارة الإلكترونية المصممة بـ Spring Boot و React.",
    welcomeStart: "ابدأ التسوق",
    // Articles page
    artTitle: "كتالوج المنتجات",
    artAdd: "إضافة منتج جديد",
    artSearch: "البحث عن منتج...",
    artName: "الاسم",
    artPrix: "السعر",
    artStock: "الكمية في المخزون",
    artExpiry: "تاريخ انتهاء الصلاحية",
    artStatus: "الحالة",
    artActions: "الإجراءات",
    artOut: "نفذت الكمية",
    artLow: "مخزون منخفض",
    artExpired: "منتهي الصلاحية",
    artActive: "متوفر",
    artCategory: "الفئة",
    artViews: "المشاهدات",
    artTrending: "الأكثر رواجاً",
    artCheap: "اقتصادي",
    artBestQuality: "أفضل جودة",
    // Cart page
    cartTitle: "سلة التسوق",
    cartEmpty: "سلتك فارغة حالياً.",
    cartCheckout: "تأكيد الطلب",
    cartTotal: "المجموع الكلي",
    // Orders page
    orderTitle: "طلباتي",
    orderInvoice: "رقم الفاتورة",
    orderDate: "التاريخ",
    orderStatus: "الحالة",
    orderDownload: "تحميل الفاتورة PDF",
    orderTracking: "تتبع الطلب",
    orderTimeline: "تتبع الطلب",
    // Order statuses
    statusCreated: "تم الإنشاء",
    statusConfirmed: "مؤكد",
    statusPacked: "تم التغليف",
    statusShipped: "تم الشحن",
    statusDelivered: "تم التسليم",
    statusCancelled: "ملغى",
    // Dashboard page
    dashTitle: "لوحة تحكم الإدارة",
    dashArticles: "إجمالي المنتجات",
    dashOrders: "إجمالي الطلبات",
    dashUsers: "إجمالي المستخدمين",
    dashStockFaible: "مخزون منخفض",
    dashCA: "إجمالي الإيرادات",
    dashLatestOrders: "أحدث الطلبات",
    dashSalesTrend: "اتجاهات المبيعات",
    dashTopClients: "أفضل العملاء",
    dashDailyRevenue: "الإيرادات اليومية",
    dashConversion: "معدل التحويل",
    // Profile page
    profileTitle: "إعدادات الملف الشخصي",
    profileName: "الاسم الكامل",
    profileEmail: "البريد الإلكتروني",
    profileRole: "صلاحية الحساب",
    profileDate: "تاريخ الانضمام",
    profileSave: "حفظ التغييرات",
    profileImage: "رابط صورة الملف الشخصي",
    profilePlaceholder: "أدخل رابط الصورة...",
    profilePhone: "الهاتف",
    profile2FA: "التحقق بخطوتين",
    // Users management
    usersTitle: "إدارة المستخدمين",
    usersSearch: "البحث بالاسم أو البريد الإلكتروني...",
    usersRole: "الدور",
    usersStatus: "الحالة",
    usersCreated: "تاريخ الإنشاء",
    // Notifications
    notifTitle: "الإشعارات",
    notifAll: "الكل",
    notifUnread: "غير مقروءة",
    notifMarkAll: "تحديد الكل كمقروء",
    notifEmpty: "لا توجد إشعارات",
    // General
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات",
    actions: "الإجراءات",
  },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const isRtl = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
