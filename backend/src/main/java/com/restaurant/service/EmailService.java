package com.restaurant.service;

import com.restaurant.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class EmailService {

    @Value("${mailjet.api.key}")
    private String apiKey;

    @Value("${mailjet.secret.key}")
    private String secretKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

 public void sendResetPasswordEmail(User user, String token) {
    try {
        String resetUrl = frontendUrl + "/reset-password/" + token;

        // 1. Création de l'objet message unique
        Map<String, Object> message = new HashMap<>();
        
        message.put("From", Map.of(
            "Email", "painextazzy@gmail.com", // DOIT être validé sur Mailjet
            "Name", "Petite Bouffe"
        ));
        
        message.put("To", List.of(
            Map.of("Email", user.getEmail(), "Name", user.getNom())
        ));
        
        message.put("Subject", "Réinitialisation de votre mot de passe");
        
        message.put("TextPart", "Cliquez sur le lien pour réinitialiser : " + resetUrl);
        
        message.put("HTMLPart", "<h3>Bonjour " + user.getNom() + ",</h3>" +
                   "<p>Réinitialisez votre mot de passe en cliquant sur <a href='" + resetUrl + "'>ce lien</a>.</p>");

        // 2. Encapsulation dans la clé "Messages" (obligatoire en v3.1)
        Map<String, Object> payload = new HashMap<>();
        payload.put("Messages", List.of(message));

        // Configuration des headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(this.apiKey, this.secretKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        // Appel à l'API Mailjet
        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.mailjet.com/v3.1/send",
                HttpMethod.POST,
                entity,
                String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("✅ Email envoyé avec succès !");
        } else {
            throw new RuntimeException("Erreur API Mailjet: " + response.getBody());
        }

    } catch (Exception e) {
        System.err.println("❌ Erreur lors de l'envoi: " + e.getMessage());
        throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
    }
}}