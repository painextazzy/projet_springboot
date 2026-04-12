package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lignes_commande")
@Data
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lignes_commande_seq")
    @SequenceGenerator(name = "lignes_commande_seq", sequenceName = "lignes_commande_sequence", allocationSize = 1)
    private Long id;

    @Column(name = "commande_id")
    private Long commandeId;

    @Column(name = "plat_id")
    private Long platId;

    private Integer quantite;

    @Column(name = "prix_unitaire")
    private Double prixUnitaire;

    private Double total;

    // ✅ AJOUTEZ CETTE RELATION
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plat_id", insertable = false, updatable = false)
    private Menu plat;
}