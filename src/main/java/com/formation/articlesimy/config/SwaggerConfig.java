package com.formation.articlesimy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()
                .info(new Info()
                        .title("ArticleSimy E-Commerce API")
                        .description("""
                                Enterprise-grade e-commerce REST API built with Spring Boot 3.
                                
                                **Modules:**
                                - 🔐 Authentication & 2FA
                                - 👤 User Management
                                - 📦 Product Catalog
                                - 🛒 Shopping Cart
                                - 📋 Order Management
                                - ❤️ Wishlist
                                - 🔔 Notifications (REST + WebSocket)
                                - 📊 Admin Dashboard & Analytics
                                - 📝 Audit Logs
                                - 📄 PDF Invoicing
                                """)
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("ArticleSimy Team")
                                .email("contact@articlesimy.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token")));
    }
}
