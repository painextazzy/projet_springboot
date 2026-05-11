package com.restaurant.service;

import com.restaurant.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendResetPasswordEmail(User user, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password/" + token;

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
                        </div>
                    </body>
                    </html>
                    """, user.getNom(), resetUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Réinitialisation de votre mot de passe - Petite Bouffe");
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail, "Petite Bouffe");

            mailSender.send(message);
            System.out.println("✅ Email envoyé avec succès à " + user.getEmail());

        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }
}