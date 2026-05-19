package com.formation.articlesimy.repository;

import com.formation.articlesimy.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

    List<OrderStatusHistory> findByCommandeIdOrderByTimestampAsc(Long commandeId);
}
