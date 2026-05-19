package com.formation.articlesimy.config;

import com.formation.articlesimy.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/articles/search").permitAll()
                        .requestMatchers("/api/articles/filtre").permitAll()
                        .requestMatchers("/api/articles/smart-filter").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/articles").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/articles/{id}").permitAll()

                        // Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Static uploads
                        .requestMatchers("/uploads/**").permitAll()

                        // WebSocket
                        .requestMatchers("/ws/**").permitAll()

                        // Admin dashboard & analytics
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Catalog management (CRUD)
                        .requestMatchers(HttpMethod.POST, "/api/articles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/articles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/articles/**").hasRole("ADMIN")

                        // Auditing
                        .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")

                        // User management (admin)
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/*/role").hasRole("ADMIN")

                        // Client shopping activities
                        .requestMatchers("/api/panier/**").hasAnyRole("CLIENT", "ADMIN")
                        .requestMatchers("/api/wishlist/**").hasAnyRole("CLIENT", "ADMIN")
                        .requestMatchers("/api/commandes/user/**").hasAnyRole("CLIENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/commandes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/commandes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/commandes/**").hasRole("ADMIN")

                        // Notifications
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Product views & recommendations
                        .requestMatchers("/api/products/*/view").authenticated()
                        .requestMatchers("/api/products/recommended/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}