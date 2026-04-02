package com.restaurant.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuDTO {
    private Long id;
    private String nom;
    private String description;
    private Double prix;
    private String imageUrl;
    private Integer quantite;
    private Boolean disponible;
    private String categorie;  // AJOUTER CETTE LIGNE
}