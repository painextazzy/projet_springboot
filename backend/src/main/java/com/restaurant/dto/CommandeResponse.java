package com.restaurant.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommandeResponse {
    private Long id;
    private String numeroFacture;
    private Long tableId;
    private String tableNom;
    private LocalDateTime dateOuverture;
    private LocalDateTime dateCloture;
    private String statut;
    private Double total;
    private List<LigneCommandeDTO> lignes;
    
    @Data
    public static class LigneCommandeDTO {
        private Long id;
        private Long platId;
        private String platNom;
        private Integer quantite;
        private Double prixUnitaire;
        private Double total;
    }
}