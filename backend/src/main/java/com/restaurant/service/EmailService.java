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

    @Value("${keplars.api.key}")
    private String apiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendResetPasswordEmail(User user, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password/" + token;

            // Contenu HTML de l'email
            String htmlContent = String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"></head>
                    <body style="font-family: Arial, sans-serif;">
                        <div style="max-width: 600px; margin: auto; padding: 20px;">
                            <div style="background: #00307d; color: white; padding: 20px; text-align: center;">
                                <h2>Petite Bouffe</h2>
                            </div>
                            <div style="padding: 30px; background: #f9f9f9;">
                                <h3>Bonjour %s,</h3>
                                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                                <div style="text-align: center;">
                                    <a href="%s" style="display: inline-block; padding: 12px 24px;
                                        background: #00307d; color: white; text-decoration: none;
                                        border-radius: 5px;">Réinitialiser mon mot de passe</a>
                                </div>
                                <p>Ce lien expirera dans 1 heure.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """, user.getNom(), resetUrl);

            // Construction du payload selon la documentation Keplars
            Map<String, Object> payload = new HashMap<>();
            payload.put("to", user.getEmail());
            payload.put("subject", "Réinitialisation de votre mot de passe - Petite Bouffe");
            payload.put("html", htmlContent);

            // ⚠️ Ajoutez votre email expéditeur (celui connecté à Keplars)
            payload.put("from", "painextazzy@gmail.com");

            // Configuration des headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Authentification - vérifiez le format exact sur votre dashboard
            // Option 1: Bearer token
            headers.set("Authorization", "Bearer " + apiKey);
            // Option 2: Clé API directe (si Bearer ne fonctionne pas)
            // headers.set("X-API-Key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // ⭐ UTILISEZ LE BON ENDPOINT - Format complet
            String apiUrl = "https://api.keplars.com/send-email/instant";

            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Email envoyé avec succès à " + user.getEmail());
                System.out.println("   Réponse: " + response.getBody());
            } else {
                System.err.println("❌ Erreur Keplars: " + response.getBody());
                throw new RuntimeException("Erreur API Keplars: " + response.getBody());
            }

        } catch (Exception e) {
            System.err.println("❌ Erreur: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }
}