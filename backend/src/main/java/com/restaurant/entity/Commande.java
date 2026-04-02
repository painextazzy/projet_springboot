package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "commandes")
@Data
public class Commande {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String numeroFacture;
    
    @Column(name = "table_id")
    private Long tableId;
    
    @Column(name = "date_ouverture")
    private LocalDateTime dateOuverture;
    
    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;
    
    private String statut; // EN_COURS, TERMINEE, PAYEE
    
    private Double total;
}