package com.restaurant.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String nom;
    private String email;
    private String role;
    
    public UserResponse(Long id, String nom, String email, String role) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.role = role;
    }
}