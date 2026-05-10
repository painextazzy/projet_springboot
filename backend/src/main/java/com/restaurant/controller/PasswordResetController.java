package com.restaurant.controller;

import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "https://projet-springboot.vercel.app"
})
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Étape 1: Demander la réinitialisation (envoi email)
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        System.out.println("Demande de réinitialisation pour: " + email);

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            try {
                emailService.sendResetPasswordEmail(user, token);
                return ResponseEntity.ok(Map.of("message", "Email de réinitialisation envoyé"));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Erreur envoi email: " + e.getMessage()));
            }
        }

        return ResponseEntity.ok(Map.of("message", "Si cet email existe, vous recevrez un lien"));
    }

    // Étape 2: Vérifier si le token est valide
    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Token invalide"));
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Lien expiré"));
        }

        return ResponseEntity.ok(Map.of("valid", true));
    }

    // Étape 3: Réinitialiser le mot de passe
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "8 caractères minimum"));
        }

        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token invalide"));
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lien expiré"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
    }
}