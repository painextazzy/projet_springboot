package com.restaurant.controller;

import com.restaurant.dto.LoginRequest;
import com.restaurant.dto.LoginResponse;
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
}