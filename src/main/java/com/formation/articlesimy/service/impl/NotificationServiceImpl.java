package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.entity.Notification;
import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.enums.NotificationType;
import com.formation.articlesimy.entity.enums.Role;
import com.formation.articlesimy.repository.NotificationRepository;
import com.formation.articlesimy.repository.UserRepository;
import com.formation.articlesimy.service.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public Notification createNotification(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId).orElse(null);

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Broadcast via WebSocket
        if (userId != null) {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId,
                    saved
            );
        }

        return saved;
    }

    @Override
    public Notification createBroadcastNotification(String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(null)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Broadcast to all
        messagingTemplate.convertAndSend("/topic/notifications/broadcast", saved);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getBroadcastNotifications() {
        return notificationRepository.findByUserIsNullOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void notifyAdmins(String title, String message, NotificationType type) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {
            createNotification(admin.getId(), title, message, type);
        }

        // Also broadcast to admin topic
        messagingTemplate.convertAndSend("/topic/admin/alerts", 
                Notification.builder().title(title).message(message).type(type).build());
    }
}
