package com.restaurant.controller;

import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;
import com.restaurant.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "https://projet-springboot.vercel.app",
        "http://localhost:3000"
})
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // ✅ PAS de BCryptPasswordEncoder - mots de passe en clair

    // Étape 1 : Vérifier si l'email existe
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        System.out.println("🔍 Vérification email : " + email);

        Optional<User> userOpt = userRepository.findByEmail(email);

        return ResponseEntity.ok(Map.of(
                "exists", userOpt.isPresent(),
                "message", userOpt.isPresent() ? "Email trouvé" : "Aucun compte trouvé"));
    }

    // Étape 2 : Demander la réinitialisation
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        System.out.println("📧 Demande de réinitialisation pour : " + email);

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Si cet email existe, vous recevrez un lien",
                    "emailExists", false));
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        try {
            emailService.sendResetPasswordEmail(user, token);

            return ResponseEntity.ok(Map.of(
                    "message", "Email de réinitialisation envoyé",
                    "emailExists", true,
                    "userId", user.getId()));
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email : " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Erreur lors de l'envoi de l'email"));
        }
    }

    // Étape 3 : RÉINITIALISER LE MOT DE PASSE (EN CLAIR)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        String userIdStr = request.get("userId");

        System.out.println("🔑 Réinitialisation mot de passe");
        System.out.println("   Token reçu : " + (token != null ? token.substring(0, 8) + "..." : "null"));
        System.out.println("   Nouveau mot de passe : " + (newPassword != null ? newPassword : "null"));
        System.out.println("   UserID : " + userIdStr);

        // Validation
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le mot de passe est requis"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le mot de passe doit contenir au moins 8 caractères"));
        }

        // Trouver l'utilisateur par token
        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty()) {
            System.out.println("❌ Token invalide ou déjà utilisé");
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Token invalide ou déjà utilisé"));
        }

        User user = userOpt.get();

        // Vérifier userId si fourni
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                Long userId = Long.parseLong(userIdStr);
                if (!user.getId().equals(userId)) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Token ne correspond pas à l'utilisateur"));
                }
            } catch (NumberFormatException e) {
                System.out.println("⚠️ UserId invalide ignoré : " + userIdStr);
            }
        }

        // Vérifier l'expiration du token
        if (user.getResetTokenExpiry() != null &&
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            System.out.println("❌ Token expiré");
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Lien expiré (valable 1 heure)"));
        }

        // ✅ ENREGISTRER LE MOT DE PASSE EN CLAIR (PAS DE HASHAGE)
        user.setPassword(newPassword); // Mot de passe stocké tel quel

        // Nettoyer le token
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        System.out.println("✅ Mot de passe réinitialisé avec succès pour : " + user.getEmail());
        System.out.println("   Nouveau mot de passe : " + newPassword);

        return ResponseEntity.ok(Map.of(
                "message", "Mot de passe réinitialisé avec succès"));
    }

    // Étape 4 : Vérifier le token (optionnel)
    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token,
            @RequestParam(required = false) Long userId) {
        Optional<User> userOpt = userRepository.findByResetToken(token);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Token invalide ou déjà utilisé"));
        }

        User user = userOpt.get();

        if (userId != null && !user.getId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Token ne correspond pas à l'utilisateur"));
        }

        if (user.getResetTokenExpiry() != null &&
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Lien expiré"));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "message", "Token valide"));
    }
}