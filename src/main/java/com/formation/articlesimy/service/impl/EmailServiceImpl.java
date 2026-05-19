package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@articlesimy.com}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void sendWelcomeEmail(String to, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Bienvenue sur ArticleSimy! 🎉");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                "Bienvenue sur ArticleSimy, votre plateforme e-commerce de confiance!\n\n" +
                "Votre compte a été créé avec succès.\n" +
                "Commencez dès maintenant à explorer notre catalogue.\n\n" +
                "À bientôt,\n" +
                "L'équipe ArticleSimy"
        );
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log but don't fail
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendOrderConfirmation(String to, String orderNumber, double total) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Commande confirmée — " + orderNumber);
        message.setText(
                "Votre commande " + orderNumber + " a été confirmée!\n\n" +
                "Montant total: " + String.format("%.2f", total) + " DH\n\n" +
                "Vous recevrez une notification lorsque votre commande sera expédiée.\n\n" +
                "Merci pour votre confiance,\n" +
                "L'équipe ArticleSimy"
        );
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTwoFactorCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Code de vérification ArticleSimy");
        message.setText(
                "Votre code de vérification est: " + code + "\n\n" +
                "Ce code expire dans 5 minutes.\n\n" +
                "Si vous n'avez pas demandé ce code, ignorez cet email.\n\n" +
                "L'équipe ArticleSimy"
        );
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send 2FA code: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendStockAlert(String to, String productName, int currentStock) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("⚠️ Alerte Stock — " + productName);
        message.setText(
                "Alerte stock pour le produit: " + productName + "\n" +
                "Stock actuel: " + currentStock + " unités\n\n" +
                "Veuillez réapprovisionner ce produit dès que possible.\n\n" +
                "Système ArticleSimy"
        );
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send stock alert: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendAbandonedCartReminder(String to, String userName, int itemCount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Vous avez oublié quelque chose! 🛒");
        message.setText(
                "Bonjour " + userName + ",\n\n" +
                "Vous avez " + itemCount + " article(s) dans votre panier.\n\n" +
                "N'oubliez pas de finaliser votre commande!\n\n" +
                "L'équipe ArticleSimy"
        );
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send abandoned cart reminder: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendInvoiceEmail(String to, String orderNumber, byte[] pdfAttachment) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Facture — " + orderNumber);
            helper.setText(
                    "Veuillez trouver ci-joint la facture pour votre commande " + orderNumber + ".\n\n" +
                    "Merci pour votre confiance,\n" +
                    "L'équipe ArticleSimy"
            );

            helper.addAttachment("facture_" + orderNumber + ".pdf",
                    new ByteArrayResource(pdfAttachment),
                    "application/pdf");

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Failed to send invoice email: " + e.getMessage());
        }
    }
}
