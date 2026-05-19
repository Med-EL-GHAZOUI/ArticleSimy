package com.formation.articlesimy.dto;

import com.formation.articlesimy.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTimelineDTO {
    private Long orderId;
    private String invoiceNumber;
    private OrderStatus currentStatus;
    private List<StatusStep> timeline;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusStep {
        private OrderStatus status;
        private LocalDateTime timestamp;
        private String changedBy;
        private boolean completed;
        private boolean current;
    }
}
