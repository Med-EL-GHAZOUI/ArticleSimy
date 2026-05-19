package com.formation.articlesimy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalArticles;
    private long totalCommandes;
    private long totalUsers;
    private long stockFaible;
    private double chiffreAffaires;

    // Advanced analytics
    private List<MonthlySales> monthlySales;
    private Map<String, Long> ordersByStatus;
    private List<TopProduct> topProducts;
    private List<TopClient> topClients;
    private List<DailyRevenue> dailyRevenue;
    private double conversionRate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlySales {
        private String month;
        private double total;
        private long orderCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProduct {
        private Long productId;
        private String productName;
        private long totalSold;
        private double totalRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopClient {
        private Long userId;
        private String userName;
        private String email;
        private long totalOrders;
        private double totalSpent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRevenue {
        private String date;
        private double revenue;
        private long orders;
    }
}