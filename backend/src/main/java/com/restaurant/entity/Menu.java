package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "menu")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double prix;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    private Integer quantite;
    
    private Boolean disponible;
    
    // AJOUTER CETTE LIGNE
    private String categorie;  // ENTREE, PLAT, DESSERT, BOISSON
}