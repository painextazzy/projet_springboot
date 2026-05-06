package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
@Data
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // ← Changé pour Railway (MySQL)
    private Long id;

    @Column(name = "numero_facture")
    private String numeroFacture;

    @Column(name = "table_id")
    private Long tableId;

    @Column(name = "date_ouverture")
    private LocalDateTime dateOuverture;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    private String statut;
    private Double total;

    // ✅ Relation correcte pour Railway
    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "commande_id", referencedColumnName = "id")
    private List<LigneCommande> lignes = new ArrayList<>();
}