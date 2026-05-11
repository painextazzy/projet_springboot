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
            // ✅ Inclure l'ID utilisateur dans le lien
            String resetUrl = frontendUrl + "/new-password?token=" + token + "&userId=" + user.getId();

            Map<String, Object> message = new HashMap<>();

            // Expéditeur
            message.put("From", Map.of(
                    "Email", "painextazzy@gmail.com",
                    "Name", "Petite Bouffe"));

            // Destinataire
            message.put("To", List.of(
                    Map.of("Email", user.getEmail(), "Name", user.getNom())));

            // Sujet
            message.put("Subject", "Réinitialisation de votre mot de passe - Petite Bouffe");

            // Version texte
            message.put("TextPart",
                    "Bonjour " + user.getNom() + ",\n\n" +
                            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                            "Cliquez sur ce lien pour réinitialiser votre mot de passe :\n" + resetUrl + "\n\n" +
                            "Ce lien expirera dans 1 heure.\n\n" +
                            "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                            "Cordialement,\nL'équipe Petite Bouffe");

            // Version HTML améliorée
            String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                        <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                            <tr>
                                <td align="center" style="padding: 20px;">
                                    <table role="presentation" style="max-width: 600px; width: 100%%; border-collapse: collapse; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #e67e22, #d35400); padding: 30px; text-align: center;">
                                                <h1 style="color: white; margin: 0; font-size: 28px;">🍽️ Petite Bouffe</h1>
                                                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">Restaurant Management</p>
                                            </td>
                                        </tr>

                                        <!-- Contenu -->
                                        <tr>
                                            <td style="padding: 40px 30px;">
                                                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>

                                                <p style="color: #666; line-height: 1.6; font-size: 14px;">
                                                    Bonjour <strong>%s</strong>,
                                                </p>

                                                <p style="color: #666; line-height: 1.6; font-size: 14px;">
                                                    Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.
                                                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                                                </p>

                                                <!-- Bouton -->
                                                <div style="text-align: center; margin: 35px 0;">
                                                    <a href="%s"
                                                       style="background: #e67e22;
                                                              color: white;
                                                              padding: 15px 35px;
                                                              text-decoration: none;
                                                              border-radius: 30px;
                                                              font-weight: bold;
                                                              font-size: 16px;
                                                              display: inline-block;
                                                              box-shadow: 0 4px 10px rgba(230, 126, 34, 0.3);">
                                                        Réinitialiser mon mot de passe
                                                    </a>
                                                </div>

                                                <!-- Lien de secours -->
                                                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; word-break: break-all;">
                                                    <p style="color: #888; font-size: 11px; margin: 0; text-align: center;">
                                                        Si le bouton ne fonctionne pas, copiez ce lien :<br>
                                                        <a href="%s" style="color: #e67e22; font-size: 11px;">%s</a>
                                                    </p>
                                                </div>

                                                <!-- Avertissement -->
                                                <div style="border-left: 4px solid #f39c12; padding: 12px 15px; background: #fff8e1; border-radius: 5px; margin: 25px 0;">
                                                    <p style="color: #e67e22; font-size: 12px; margin: 0;">
                                                        ⚠️ <strong>Important :</strong> Ce lien expirera dans <strong>1 heure</strong>.<br>
                                                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                                                <p style="color: #999; font-size: 11px; margin: 0;">
                                                    © 2024 Petite Bouffe. Tous droits réservés.<br>
                                                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """
                    .formatted(
                            user.getNom(), // Nom de l'utilisateur
                            resetUrl, // Lien principal
                            resetUrl, // Lien de secours (texte)
                            resetUrl // Lien de secours (URL)
                    );

            message.put("HTMLPart", htmlContent);

            // Construction de la requête Mailjet
            Map<String, Object> payload = Map.of("Messages", List.of(message));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(this.apiKey, this.secretKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Envoi via Mailjet
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.mailjet.com/v3.1/send",
                    HttpMethod.POST,
                    entity,
                    String.class);

            // Log du succès
            System.out.println("✅ Email envoyé avec succès à : " + user.getEmail());
            System.out.println("   Lien de réinitialisation : " + resetUrl);
            System.out.println("   UserID : " + user.getId());
            System.out.println("   Token : " + token.substring(0, 8) + "...");
            System.out.println("   Réponse Mailjet : " + response.getStatusCode());

        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email Mailjet : " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email : " + e.getMessage());
        }
    }
}