package com.formation.articlesimy.service;

public interface InvoicePdfService {

    byte[] generateInvoicePdf(Long commandeId);
}
