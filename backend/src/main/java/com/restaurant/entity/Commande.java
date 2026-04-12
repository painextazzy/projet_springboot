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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "commande_seq")
    @SequenceGenerator(name = "commande_seq", sequenceName = "commande_sequence", allocationSize = 1)
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

    // ✅ Relation correcte
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id")
    private List<LigneCommande> lignes = new ArrayList<>();
}