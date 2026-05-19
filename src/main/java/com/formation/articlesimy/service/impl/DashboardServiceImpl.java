package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.dto.DashboardResponse;
import com.formation.articlesimy.entity.enums.OrderStatus;
import com.formation.articlesimy.repository.ArticleRepository;
import com.formation.articlesimy.repository.CommandeRepository;
import com.formation.articlesimy.repository.LigneCommandeRepository;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.service.DashboardService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final ArticleRepository articleRepository;
    private final CommandeRepository commandeRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final UserRepository userRepository;

    public DashboardServiceImpl(ArticleRepository articleRepository,
                                CommandeRepository commandeRepository,
                                LigneCommandeRepository ligneCommandeRepository,
                                UserRepository userRepository) {
        this.articleRepository = articleRepository;
        this.commandeRepository = commandeRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Cacheable(value = "dashboard", key = "'stats'")
    public DashboardResponse getDashboardStats() {
        long totalArticles = articleRepository.count();
        long totalCommandes = commandeRepository.count();
        long totalUsers = userRepository.count();
        long stockFaible = articleRepository.countByQuantiteStockLessThan(5);
        Double ca = commandeRepository.calculateTotalRevenue();

        return DashboardResponse.builder()
                .totalArticles(totalArticles)
                .totalCommandes(totalCommandes)
                .totalUsers(totalUsers)
                .stockFaible(stockFaible)
                .chiffreAffaires(ca != null ? ca : 0.0)
                .build();
    }

    @Override
    public DashboardResponse getFullAnalytics() {
        DashboardResponse summary = getDashboardStats();
        DashboardResponse stats = DashboardResponse.builder()
                .totalArticles(summary.getTotalArticles())
                .totalCommandes(summary.getTotalCommandes())
                .totalUsers(summary.getTotalUsers())
                .stockFaible(summary.getStockFaible())
                .chiffreAffaires(summary.getChiffreAffaires())
                .build();

        // Monthly sales (last 12 months)
        List<DashboardResponse.MonthlySales> monthlySales = calculateMonthlySales();
        stats.setMonthlySales(monthlySales);

        // Orders by status
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = commandeRepository.countByStatut(status);
            if (count > 0) {
                ordersByStatus.put(status.name(), count);
            }
        }
        stats.setOrdersByStatus(ordersByStatus);

        // Top products (from order items)
        List<DashboardResponse.TopProduct> topProducts = ligneCommandeRepository.findTopProducts(PageRequest.of(0, 5))
                .stream()
                .map(row -> DashboardResponse.TopProduct.builder()
                        .productId((Long) row[0])
                        .productName((String) row[1])
                        .totalSold(row[2] != null ? ((Number) row[2]).longValue() : 0)
                        .totalRevenue(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                        .build())
                .collect(Collectors.toList());
        stats.setTopProducts(topProducts);

        // Top clients
        List<Object[]> topClientsRaw = commandeRepository.findTopClients(PageRequest.of(0, 5));
        List<DashboardResponse.TopClient> topClients = topClientsRaw.stream()
                .map(row -> DashboardResponse.TopClient.builder()
                        .userId((Long) row[0])
                        .userName((String) row[1])
                        .email((String) row[2])
                        .totalOrders((Long) row[3])
                        .totalSpent(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                        .build())
                .collect(Collectors.toList());
        stats.setTopClients(topClients);

        // Daily revenue (last 30 days)
        List<DashboardResponse.DailyRevenue> dailyRevenue = calculateDailyRevenue();
        stats.setDailyRevenue(dailyRevenue);

        // Conversion rate
        long totalUsersForRate = stats.getTotalUsers();
        stats.setConversionRate(totalUsersForRate > 0 ?
                (double) stats.getTotalCommandes() / totalUsersForRate * 100 : 0);

        return stats;
    }

    private List<DashboardResponse.MonthlySales> calculateMonthlySales() {
        List<DashboardResponse.MonthlySales> sales = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        LocalDate referenceDate = getAnalyticsReferenceDate();

        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = referenceDate.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1);

            Double revenue = commandeRepository.calculateRevenueForPeriod(
                    monthStart.atStartOfDay(),
                    monthEnd.atStartOfDay()
            );

            long orderCount = commandeRepository.countOrdersForPeriod(
                    monthStart.atStartOfDay(),
                    monthEnd.atStartOfDay()
            );

            sales.add(DashboardResponse.MonthlySales.builder()
                    .month(monthStart.format(formatter))
                    .total(revenue != null ? revenue : 0.0)
                    .orderCount(orderCount)
                    .build());
        }
        return sales;
    }

    private List<DashboardResponse.DailyRevenue> calculateDailyRevenue() {
        List<DashboardResponse.DailyRevenue> dailyRevenue = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate referenceDate = getAnalyticsReferenceDate();

        for (int i = 29; i >= 0; i--) {
            LocalDate day = referenceDate.minusDays(i);
            LocalDateTime dayStart = day.atStartOfDay();
            LocalDateTime dayEnd = day.plusDays(1).atStartOfDay();

            Double revenue = commandeRepository.calculateRevenueForPeriod(dayStart, dayEnd);
            long orders = commandeRepository.countOrdersForPeriod(dayStart, dayEnd);

            dailyRevenue.add(DashboardResponse.DailyRevenue.builder()
                    .date(day.format(formatter))
                    .revenue(revenue != null ? revenue : 0.0)
                    .orders(orders)
                    .build());
        }
        return dailyRevenue;
    }

    private LocalDate getAnalyticsReferenceDate() {
        return commandeRepository.findTopByOrderByDateCommandeDesc()
                .map(commande -> commande.getDateCommande().toLocalDate())
                .orElse(LocalDate.now());
    }
}
