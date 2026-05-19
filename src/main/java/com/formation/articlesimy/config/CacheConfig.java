package com.formation.articlesimy.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // Using simple in-memory cache (spring.cache.type=simple)
    // For production, configure Redis:
    // spring.cache.type=redis
    // spring.data.redis.host=localhost
    // spring.data.redis.port=6379
}
