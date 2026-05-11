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
            // L'URL pointe vers votre frontend (ex: React sur Render ou localhost)
            String resetUrl = frontendUrl + "/reset-password/" + token;

            Map<String, Object> message = new HashMap<>();

            // Expéditeur fixe exposé
            message.put("From", Map.of(
                    "Email", "painextazzy@gmail.com",
                    "Name", "Petite Bouffe"));

            // Destinataire récupéré de l'objet User
            message.put("To", List.of(
                    Map.of("Email", user.getEmail(), "Name", user.getNom())));

            message.put("Subject", "Réinitialisation de votre mot de passe - Petite Bouffe");

            message.put("TextPart",
                    "Bonjour " + user.getNom() + ", réinitialisez votre mot de passe ici : " + resetUrl);

            message.put("HTMLPart",
                    "<div style='font-family: sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                            "<div style='max-width: 600px; margin: auto; background: white; padding: 40px; border-radius: 8px;'>"
                            +
                            "<h2 style='color: #e67e22; text-align: center;'>Petite Bouffe</h2>" +
                            "<p>Bonjour <strong>" + user.getNom() + "</strong>,</p>" +
                            "<p>Cliquez sur le bouton ci-dessous pour changer votre mot de passe :</p>" +
                            "<div style='text-align: center; margin: 30px 0;'>" +
                            "<a href='" + resetUrl
                            + "' style='background-color: #e67e22; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>"
                            +
                            "Réinitialiser mon mot de passe" +
                            "</a>" +
                            "</div>" +
                            "<p style='font-size: 12px; color: #999; text-align: center;'>Ce lien expirera bientôt.</p>"
                            +
                            "</div>" +
                            "</div>");

            Map<String, Object> payload = Map.of("Messages", List.of(message));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(this.apiKey, this.secretKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            restTemplate.exchange("https://api.mailjet.com/v3.1/send", HttpMethod.POST, entity, String.class);

        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi email: " + e.getMessage());
        }
    }
}