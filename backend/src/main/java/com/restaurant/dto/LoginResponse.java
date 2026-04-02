package com.restaurant.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String nom;
    private String email;
    private String role;
    private String token;
    
    // Constructeur utilisé par AuthService
    public LoginResponse(String role, String nom, String email) {
        this.role = role;
        this.nom = nom;
        this.email = email;
    }
}