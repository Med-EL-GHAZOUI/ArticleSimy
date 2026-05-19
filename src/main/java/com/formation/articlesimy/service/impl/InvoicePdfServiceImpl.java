package com.formation.articlesimy.service.impl;

import com.formation.articlesimy.entity.Commande;
import com.formation.articlesimy.entity.LigneCommande;
import com.formation.articlesimy.repository.CommandeRepository;
import com.formation.articlesimy.service.InvoicePdfService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfServiceImpl implements InvoicePdfService {

    private final CommandeRepository commandeRepository;

    public InvoicePdfServiceImpl(CommandeRepository commandeRepository) {
        this.commandeRepository = commandeRepository;
    }

    @Override
    public byte[] generateInvoicePdf(Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fonts
            Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD, new Color(79, 70, 229));
            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
            Font bodyFont = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.DARK_GRAY);
            Font boldFont = new Font(Font.HELVETICA, 11, Font.BOLD, Color.DARK_GRAY);
            Font totalFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(79, 70, 229));

            // Title
            Paragraph title = new Paragraph("FACTURE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Paragraph subtitle = new Paragraph("ArticleSimy E-Commerce", new Font(Font.HELVETICA, 10, Font.NORMAL, Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(30);
            document.add(subtitle);

            // Invoice details
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            document.add(new Paragraph("Facture N°: " + commande.getInvoiceNumber(), boldFont));
            document.add(new Paragraph("Date: " + commande.getDateCommande().format(formatter), bodyFont));
            document.add(new Paragraph("Statut: " + commande.getStatut().name(), bodyFont));

            if (commande.getUser() != null) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Client: " + commande.getUser().getNom(), boldFont));
                document.add(new Paragraph("Email: " + commande.getUser().getEmail(), bodyFont));
            }

            document.add(new Paragraph(" "));

            // Products table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.5f, 2.5f, 1f, 1f, 1.2f});
            table.setSpacingBefore(10);

            // Headers
            String[] headers = {"#", "Produit", "Prix Unit.", "Qté", "Sous-total"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(79, 70, 229));
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBorderWidth(0);
                table.addCell(cell);
            }

            // Rows
            int index = 1;
            double grandTotal = 0;
            for (LigneCommande ligne : commande.getLignes()) {
                double sousTotal = ligne.getPrixUnitaire() * ligne.getQuantite();
                grandTotal += sousTotal;

                Color rowColor = index % 2 == 0 ? new Color(245, 247, 250) : Color.WHITE;

                addTableCell(table, String.valueOf(index), bodyFont, rowColor);
                addTableCell(table, ligne.getArticle() != null ? ligne.getArticle().getNom() : "N/A", bodyFont, rowColor);
                addTableCell(table, String.format("%.2f DH", ligne.getPrixUnitaire()), bodyFont, rowColor);
                addTableCell(table, String.valueOf(ligne.getQuantite()), bodyFont, rowColor);
                addTableCell(table, String.format("%.2f DH", sousTotal), boldFont, rowColor);
                index++;
            }

            document.add(table);

            // Total
            Paragraph totalParagraph = new Paragraph();
            totalParagraph.setSpacingBefore(20);
            totalParagraph.setAlignment(Element.ALIGN_RIGHT);
            totalParagraph.add(new Chunk("Total: " + String.format("%.2f DH", grandTotal), totalFont));
            document.add(totalParagraph);

            // Footer
            Paragraph footer = new Paragraph(
                    "\n\nMerci pour votre confiance!\nArticleSimy © " + java.time.Year.now().getValue(),
                    new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY)
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(40);
            document.add(footer);

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }
}
