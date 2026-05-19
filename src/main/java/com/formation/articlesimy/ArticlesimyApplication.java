package com.formation.articlesimy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class ArticlesimyApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArticlesimyApplication.class, args);
    }

}

