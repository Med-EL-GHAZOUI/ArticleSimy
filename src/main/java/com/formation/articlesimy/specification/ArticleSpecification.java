package com.formation.articlesimy.specification;

import com.formation.articlesimy.entity.Article;
import org.springframework.data.jpa.domain.Specification;

public class ArticleSpecification {

    private ArticleSpecification() {
    }

    public static Specification<Article> hasDescription(String description) {
        return (root, query, cb) -> {

            if (description == null || description.isBlank()) {
                return cb.conjunction();
            }

            return cb.or(
                    cb.like(
                            cb.lower(root.get("description")),
                            "%" + description.toLowerCase() + "%"
                    ),
                    cb.like(
                            cb.lower(root.get("nom")),
                            "%" + description.toLowerCase() + "%"
                    )
            );
        };
    }

    public static Specification<Article> prixMin(Double prixMin) {
        return (root, query, cb) -> {

            if (prixMin == null) {
                return cb.conjunction();
            }

            return cb.greaterThanOrEqualTo(
                    root.get("prix"),
                    prixMin
            );
        };
    }

    public static Specification<Article> prixMax(Double prixMax) {
        return (root, query, cb) -> {

            if (prixMax == null) {
                return cb.conjunction();
            }

            return cb.lessThanOrEqualTo(
                    root.get("prix"),
                    prixMax
            );
        };
    }

    public static Specification<Article> stockMin(Integer stockMin) {
        return (root, query, cb) -> {

            if (stockMin == null) {
                return cb.conjunction();
            }

            return cb.greaterThanOrEqualTo(
                    root.get("quantiteStock"),
                    stockMin
            );
        };
    }

    public static Specification<Article> hasCategory(String category) {
        return (root, query, cb) -> {

            if (category == null || category.isBlank()) {
                return cb.conjunction();
            }

            return cb.equal(
                    cb.lower(root.get("category")),
                    category.toLowerCase()
            );
        };
    }
}