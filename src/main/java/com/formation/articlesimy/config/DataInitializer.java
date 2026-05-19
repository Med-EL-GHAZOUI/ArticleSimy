package com.formation.articlesimy.config;

import com.formation.articlesimy.entity.User;
import com.formation.articlesimy.entity.enums.Role;
import com.formation.articlesimy.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        return args -> {
            // Fix legacy roles
            try {
                jdbcTemplate.update("UPDATE users SET role = 'ADMIN' WHERE role IN ('SUPER_ADMIN', 'MANAGER')");
                jdbcTemplate.update("UPDATE users SET role = 'CLIENT' WHERE role NOT IN ('ADMIN', 'CLIENT')");
                System.out.println("✅ All legacy roles migrated to ADMIN or CLIENT.");
            } catch (Exception e) {
                System.out.println("⚠️ Could not update legacy roles: " + e.getMessage());
            }

            // Fix legacy order statuses stored by older versions of the app.
            try {
                jdbcTemplate.update("UPDATE commande SET statut = 'CREATED' WHERE statut IN ('EN_ATTENTE', 'PENDING')");
                jdbcTemplate.update("UPDATE commande SET statut = 'CONFIRMED' WHERE statut IN ('VALIDEE', 'VALIDÉE', 'CONFIRMEE', 'CONFIRMÉE')");
                jdbcTemplate.update("UPDATE commande SET statut = 'PACKED' WHERE statut IN ('EMBALLEE', 'EMBALLÉE', 'PREPAREE', 'PRÉPARÉE')");
                jdbcTemplate.update("UPDATE commande SET statut = 'SHIPPED' WHERE statut IN ('EXPEDIEE', 'EXPÉDIÉE', 'EXPEDIE', 'EXPÉDIÉ', 'EN_COURS')");
                jdbcTemplate.update("UPDATE commande SET statut = 'DELIVERED' WHERE statut IN ('LIVREE', 'LIVRÉE')");
                jdbcTemplate.update("UPDATE commande SET statut = 'CANCELLED' WHERE statut IN ('ANNULEE', 'ANNULÉE', 'CANCELED')");

                jdbcTemplate.update("UPDATE order_status_history SET status = 'CREATED' WHERE status IN ('EN_ATTENTE', 'PENDING')");
                jdbcTemplate.update("UPDATE order_status_history SET status = 'CONFIRMED' WHERE status IN ('VALIDEE', 'VALIDÉE', 'CONFIRMEE', 'CONFIRMÉE')");
                jdbcTemplate.update("UPDATE order_status_history SET status = 'PACKED' WHERE status IN ('EMBALLEE', 'EMBALLÉE', 'PREPAREE', 'PRÉPARÉE')");
                jdbcTemplate.update("UPDATE order_status_history SET status = 'SHIPPED' WHERE status IN ('EXPEDIEE', 'EXPÉDIÉE', 'EXPEDIE', 'EXPÉDIÉ', 'EN_COURS')");
                jdbcTemplate.update("UPDATE order_status_history SET status = 'DELIVERED' WHERE status IN ('LIVREE', 'LIVRÉE')");
                jdbcTemplate.update("UPDATE order_status_history SET status = 'CANCELLED' WHERE status IN ('ANNULEE', 'ANNULÉE', 'CANCELED')");
                System.out.println("✅ Legacy order statuses migrated to tracking statuses.");
            } catch (Exception e) {
                System.out.println("⚠️ Could not update legacy order statuses: " + e.getMessage());
            }

            // Create Admin if not exists
            if (userRepository.findByEmail("admin@articlesimy.com").isEmpty()) {
                User admin = new User();
                admin.setNom("Admin");
                admin.setEmail("admin@articlesimy.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                userRepository.save(admin);
                System.out.println("✅ Admin created: admin@articlesimy.com / admin123");
            }

            // Create Client if not exists
            if (userRepository.findByEmail("client@articlesimy.com").isEmpty()) {
                User client = new User();
                client.setNom("Client Test");
                client.setEmail("client@articlesimy.com");
                client.setPassword(passwordEncoder.encode("client123"));
                client.setRole(Role.CLIENT);
                client.setEnabled(true);
                userRepository.save(client);
                System.out.println("✅ Client created: client@articlesimy.com / client123");
            }
        };
    }
}
