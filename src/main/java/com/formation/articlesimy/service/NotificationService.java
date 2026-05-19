package com.formation.articlesimy.service;

import com.formation.articlesimy.entity.Notification;
import com.formation.articlesimy.entity.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    Notification createNotification(Long userId, String title, String message, NotificationType type);

    Notification createBroadcastNotification(String title, String message, NotificationType type);

    List<Notification> getNotificationsByUser(Long userId);

    List<Notification> getBroadcastNotifications();

    long getUnreadCount(Long userId);

    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    // Notify admins
    void notifyAdmins(String title, String message, NotificationType type);
}
