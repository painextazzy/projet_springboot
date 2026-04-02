package com.restaurant.dto;

import lombok.Data;
import java.util.List;

@Data
public class CommandeRequest {
    private Long tableId;
    private List<LigneRequest> lignes;
    
    @Data
    public static class LigneRequest {
        private Long platId;
        private Integer quantite;
        private Double prixUnitaire;
    }
}