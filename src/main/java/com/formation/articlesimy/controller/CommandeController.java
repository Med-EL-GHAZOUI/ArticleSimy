package com.formation.articlesimy.controller;

import com.formation.articlesimy.dto.OrderTimelineDTO;
import com.formation.articlesimy.entity.Commande;
import com.formation.articlesimy.entity.enums.OrderStatus;
import com.formation.articlesimy.service.CommandeService;
import com.formation.articlesimy.service.InvoicePdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commandes")
@Tag(name = "Orders", description = "Order management, status tracking, and invoicing")
public class CommandeController {

    private final CommandeService commandeService;
    private final InvoicePdfService invoicePdfService;

    public CommandeController(CommandeService commandeService, InvoicePdfService invoicePdfService) {
        this.commandeService = commandeService;
        this.invoicePdfService = invoicePdfService;
    }

    @GetMapping
    @Operation(summary = "Get all orders")
    public ResponseEntity<List<Commande>> getAllCommandes() {
        return ResponseEntity.ok(commandeService.getAllCommandes());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<Commande> getCommandeById(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.getCommandeById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get orders by user")
    public ResponseEntity<List<Commande>> getCommandesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(commandeService.getCommandesByUser(userId));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status with validation")
    public ResponseEntity<Commande> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        OrderStatus newStatus = OrderStatus.valueOf(body.get("status").toUpperCase());
        String changedBy = auth != null ? auth.getName() : "SYSTEM";
        return ResponseEntity.ok(commandeService.modifierStatut(id, newStatus, changedBy));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get order tracking timeline (Amazon-style)")
    public ResponseEntity<OrderTimelineDTO> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.getOrderTimeline(id));
    }

    @GetMapping("/{id}/invoice")
    @Operation(summary = "Download PDF invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(id);

        Commande commande = commandeService.getCommandeById(id);
        String filename = "facture_" + commande.getInvoiceNumber() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an order")
    public ResponseEntity<Void> deleteCommande(@PathVariable Long id) {
        commandeService.supprimerCommande(id);
        return ResponseEntity.noContent().build();
    }
}