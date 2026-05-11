package com.restaurant.service;

import com.restaurant.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

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

            // Création du corps de la requête pour l'API Mailjet
            Map<String, Object> payload = new HashMap<>();
            payload.put("FromEmail", "votre-email-valide@mailjet.com"); // À remplacer par un email validé
            payload.put("FromName", "Petite Bouffe");
            payload.put("Subject", "Réinitialisation de votre mot de passe");
            payload.put("Text-part", "Cliquez sur le lien pour réinitialiser votre mot de passe : " + resetUrl);
            payload.put("Html-part",
                    "<h3>Bonjour " + user.getNom()
                            + ",</h3><p>Réinitialisez votre mot de passe en cliquant sur <a href='" + resetUrl
                            + "'>ce lien</a>.</p>");
            payload.put("Recipients", new Object[] {
                    Map.of("Email", user.getEmail())
            });

            // Configuration des headers pour l'authentification Basic
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(this.apiKey, this.secretKey); // Utilise vos identifiants Mailjet

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Appel à l'API REST de Mailjet sur le port 443
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.mailjet.com/v3.1/send",
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Email envoyé avec succès à " + user.getEmail() + " via l'API Mailjet.");
            } else {
                System.err.println("❌ Erreur de l'API Mailjet: " + response.getBody());
                throw new RuntimeException("Erreur lors de l'envoi de l'email");
            }

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }
}