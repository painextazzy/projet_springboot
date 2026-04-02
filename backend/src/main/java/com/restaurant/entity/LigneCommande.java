package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lignes_commande")
@Data
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commande_id")
    private Long commandeId;

    @Column(name = "plat_id")
    private Long platId;

    private Integer quantite;

    @Column(name = "prix_unitaire")
    private Double prixUnitaire;

    private Double total;  // Plus de GENERATED, on calcule en Java
}