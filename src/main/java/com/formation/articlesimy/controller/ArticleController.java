package com.formation.articlesimy.controller;

import com.formation.articlesimy.dto.ArticleRequest;
import com.formation.articlesimy.entity.Article;
import com.formation.articlesimy.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
@Tag(name = "Products", description = "Product catalog management, search, and recommendations")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    @Operation(summary = "Get all products (paginated)")
    public ResponseEntity<?> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Boolean paginated
    ) {
        if (Boolean.TRUE.equals(paginated)) {
            Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Article> result = articleService.getAllArticlesPaginated(pageable);
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.ok(articleService.getAllArticles());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<Article> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<Article> createArticle(@Valid @RequestBody ArticleRequest request) {
        return ResponseEntity.ok(articleService.createArticle(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        return ResponseEntity.ok(articleService.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a product")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by keyword (full-text)")
    public ResponseEntity<Page<Article>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.fullTextSearch(q, pageable));
    }

    @GetMapping("/filtre")
    @Operation(summary = "Multi-criteria filter")
    public ResponseEntity<List<Article>> filtrer(
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Double prixMin,
            @RequestParam(required = false) Double prixMax,
            @RequestParam(required = false) Integer stockMin
    ) {
        return ResponseEntity.ok(articleService.rechercheMulticritere(description, prixMin, prixMax, stockMin));
    }

    @PutMapping("/{id}/images")
    @Operation(summary = "Update product image URLs")
    public ResponseEntity<Article> updateImages(@PathVariable Long id, @RequestBody Map<String, List<String>> body) {
        return ResponseEntity.ok(articleService.updateProductImages(id, body.get("imageUrls")));
    }

    // ─── Smart Filters ──────────────────────────────
    @GetMapping("/smart-filter")
    @Operation(summary = "Smart product filters (trending, cheap, best quality)")
    public ResponseEntity<List<Article>> smartFilter(
            @RequestParam String type,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "100") double maxPrice
    ) {
        return switch (type.toLowerCase()) {
            case "trending" -> ResponseEntity.ok(articleService.findTrending(limit));
            case "cheap" -> ResponseEntity.ok(articleService.findCheap(maxPrice, limit));
            case "best" -> ResponseEntity.ok(articleService.findBestQuality(limit));
            default -> ResponseEntity.badRequest().build();
        };
    }

    // ─── Product Views & Recommendations ────────────
    @PostMapping("/{id}/view")
    @Operation(summary = "Record a product view")
    public ResponseEntity<Void> recordView(@PathVariable Long id, @RequestParam Long userId) {
        articleService.recordView(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recommended/{userId}")
    @Operation(summary = "Get personalized product recommendations")
    public ResponseEntity<List<Article>> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(articleService.getRecommendations(userId, limit));
    }
}