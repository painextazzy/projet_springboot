package com.restaurant.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private Long id;
    private String nom;
    private String email;
    private String motDePasseActuel;
    private String nouveauMotDePasse;
}