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
@GeneratedValue(strategy = GenerationType.AUTO)
private Long id;

    private String numeroFacture;
    
    @Column(name = "table_id")
    private Long tableId;
    
    @Column(name = "date_ouverture")
    private LocalDateTime dateOuverture;
    
    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;
    
    private String statut;
    private Double total;
    
    // ✅ AJOUTEZ CETTE RELATION (unidirectionnelle)
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id")  // ← correspond à commandeId dans LigneCommande
    private List<LigneCommande> lignes = new ArrayList<>();
}