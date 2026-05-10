package com.restaurant.service;

import com.restaurant.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendResetPasswordEmail(User user, String token) {
        try {
            // 1. Construire le lien de réinitialisation
            String resetUrl = frontendUrl + "/reset-password/" + token;

            // 2. Construire le contenu HTML de l'email
            String htmlContent = String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: Arial, sans-serif; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #00307d; color: white; padding: 20px; text-align: center; }
                            .content { padding: 30px; background: #f9f9f9; }
                            .button {
                                display: inline-block;
                                padding: 12px 24px;
                                background: #00307d;
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                                margin: 20px 0;
                            }
                            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Petite Bouffe</h2>
                            </div>
                            <div class="content">
                                <h3>Bonjour %s,</h3>
                                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                                <div style="text-align: center;">
                                    <a href="%s" class="button">Réinitialiser mon mot de passe</a>
                                </div>
                                <p>Ce lien expirera dans 1 heure.</p>
                                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Petite Bouffe - Tous droits réservés</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """, user.getNom(), resetUrl);

            // 3. Construire le payload JSON pour l'API Brevo
            Map<String, Object> payload = new HashMap<>();

            // Expéditeur
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "Petite Bouffe");
            sender.put("email", "painextazzy@gmail.com");
            payload.put("sender", sender);

            // Destinataire
            Map<String, String> toContact = new HashMap<>();
            toContact.put("email", user.getEmail());
            toContact.put("name", user.getNom());
            payload.put("to", List.of(toContact));

            // Sujet et contenu
            payload.put("subject", "Réinitialisation de votre mot de passe - Petite Bouffe");
            payload.put("htmlContent", htmlContent);

            // 4. Configurer les en-têtes HTTP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", this.apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // 5. Envoyer la requête à l'API Brevo
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Email envoyé avec succès à " + user.getEmail());
            } else {
                System.err.println("❌ Erreur API Brevo: " + response.getBody());
                throw new RuntimeException("L'API Brevo a retourné une erreur");
            }

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }
}