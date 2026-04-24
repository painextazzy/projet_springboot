package com.restaurant.controller;

import com.restaurant.dto.LoginRequest;
import com.restaurant.dto.LoginResponse;
import com.restaurant.dto.UpdateProfileRequest;
import com.restaurant.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://projet-springboot.vercel.app/")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Endpoint de connexion
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Tentative de connexion: " + request.getEmail());

        LoginResponse response = authService.login(request);

        if (response != null) {
            System.out.println("✅ Connexion réussie pour: " + request.getEmail());
            return ResponseEntity.ok(response);
        }

        System.out.println("❌ Échec de connexion pour: " + request.getEmail());
        return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
    }

    /**
     * Endpoint pour modifier le profil utilisateur
     * PUT /api/auth/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        System.out.println("Modification du profil pour l'utilisateur ID: " + request.getId());

        try {
            LoginResponse response = authService.updateProfile(request);

            if (response != null) {
                System.out.println("✅ Profil mis à jour avec succès");
                return ResponseEntity.ok(response);
            }

            System.out.println("❌ Échec de la mise à jour du profil");
            return ResponseEntity.status(400).body("Erreur lors de la mise à jour du profil");
        } catch (Exception e) {
            System.out.println("❌ Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}