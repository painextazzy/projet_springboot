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
@CrossOrigin(origins = { "https://projet-springboot.vercel.app" })
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ÉTAPE 1: L'utilisateur entre son email → on lui envoie un lien
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Générer un token unique
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));

            userRepository.save(user);

            // Envoyer l'email avec le lien
            try {
                emailService.sendResetPasswordEmail(user, token);
                return ResponseEntity.ok(Map.of("message", "Un email de réinitialisation a été envoyé"));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Erreur lors de l'envoi de l'email"));
            }
        }

        // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
        return ResponseEntity.ok(Map.of("message", "Si l'email existe, vous recevrez un lien de réinitialisation"));
    }

    // ÉTAPE 2: Vérifier si le token est valide (quand l'utilisateur clique sur le
    // lien)
    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Token invalide"));
        }

        User user = userOpt.get();

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Ce lien a expiré"));
        }

        return ResponseEntity.ok(Map.of("valid", true));
    }

    // ÉTAPE 3: L'utilisateur choisit son nouveau mot de passe
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le mot de passe doit contenir au moins 8 caractères"));
        }

        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token invalide"));
        }

        User user = userOpt.get();

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ce lien a expiré"));
        }

        // Mettre à jour le mot de passe (sans toucher au localStorage)
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
    }
}