package com.formation.articlesimy.service;

public interface EmailService {

    void sendWelcomeEmail(String to, String name);

    void sendOrderConfirmation(String to, String orderNumber, double total);

    void sendTwoFactorCode(String to, String code);

    void sendStockAlert(String to, String productName, int currentStock);

    void sendAbandonedCartReminder(String to, String userName, int itemCount);

    void sendInvoiceEmail(String to, String orderNumber, byte[] pdfAttachment);
}
