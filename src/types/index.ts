// ─── Enums ──────────────────────────────────
export type Role = 'ADMIN' | 'CLIENT';

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type NotificationType = 'ORDER_CREATED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NEAR_EXPIRY' | 'ABANDONED_CART' | 'PROMOTION' | 'SYSTEM';

// ─── Entities ───────────────────────────────
export interface User {
  id?: number;
  nom: string;
  email: string;
  role: Role;
  phone?: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
  enabled?: boolean;
  accountLocked?: boolean;
  createdAt?: string;
}

export interface Article {
  id?: number;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;
  dateExpiration: string;
  imageUrls?: string[];
  category?: string;
  viewCount?: number;
}

export interface PanierItem {
  id: number;
  article: Article;
  quantite: number;
}

export interface Panier {
  id: number;
  lignes: PanierItem[];
  lastActivity?: string;
}

export interface CommandeDetail {
  id: number;
  article?: Article;
  quantite: number;
  prixUnitaire: number;
}

export interface Commande {
  id: number;
  dateCommande: string;
  invoiceNumber: string;
  statut: OrderStatus;
  totalAmount: number;
  user?: User;
  lignes: CommandeDetail[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// ─── Order Timeline ─────────────────────────
export interface StatusStep {
  status: OrderStatus;
  timestamp: string | null;
  changedBy: string | null;
  completed: boolean;
  current: boolean;
}

export interface OrderTimeline {
  orderId: number;
  invoiceNumber: string;
  currentStatus: OrderStatus;
  timeline: StatusStep[];
}

// ─── Dashboard Analytics ────────────────────
export interface MonthlySales {
  month: string;
  total: number;
  orderCount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface TopClient {
  userId: number;
  userName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  totalArticles: number;
  totalCommandes: number;
  totalUsers: number;
  stockFaible: number;
  chiffreAffaires: number;
  monthlySales?: MonthlySales[];
  ordersByStatus?: Record<string, number>;
  topProducts?: TopProduct[];
  topClients?: TopClient[];
  dailyRevenue?: DailyRevenue[];
  conversionRate?: number;
}

// ─── Auth ───────────────────────────────────
export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: Role;
  nom: string;
  twoFactorRequired?: boolean;
}

// ─── Request payloads ───────────────────────
export interface ArticleRequest {
  nom: string;
  description: string;
  prix: number;
  dateExpiration?: string;
  quantiteStock: number;
  imageUrls?: string[];
  category?: string;
}

// ─── Audit Log ──────────────────────────────
export interface AuditLog {
  id: number;
  action: string;
  details: string;
  actorEmail: string;
  actorRole: string;
  timestamp: string;
}

// ─── Wishlist ───────────────────────────────
export interface WishlistItem {
  id: number;
  article: Article;
  createdAt: string;
}
