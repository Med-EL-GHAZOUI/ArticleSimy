package com.formation.articlesimy.service;

import com.formation.articlesimy.dto.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboardStats();

    DashboardResponse getFullAnalytics();
}