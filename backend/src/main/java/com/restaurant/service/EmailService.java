package com.restaurant.service;

import com.restaurant.entity.User;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Email expéditeur (vérifié par Resend par défaut)
    private final String fromEmail = "onboarding@resend.dev";

    public void sendResetPasswordEmail(User user, String token) {
        try {
            // Créer le client Resend
            Resend resend = new Resend(apiKey);

            // Construire le lien de réinitialisation
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
                                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                            </div>
                            <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
                                <p>© 2024 Petite Bouffe</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """, user.getNom(), resetUrl);

            // Construire l'email
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(user.getEmail())
                    .subject("Réinitialisation de votre mot de passe - Petite Bouffe")
                    .html(htmlContent)
                    .build();

            // Envoyer
            CreateEmailResponse response = resend.emails().send(params);

            System.out.println("✅ Email envoyé à " + user.getEmail());
            System.out.println("   ID Resend: " + response.getId());

        } catch (ResendException e) {
            System.err.println("❌ Erreur Resend: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }
}