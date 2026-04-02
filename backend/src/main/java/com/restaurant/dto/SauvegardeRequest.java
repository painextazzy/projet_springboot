package com.restaurant.dto;

import lombok.Data;
import java.util.List;

@Data
public class SauvegardeRequest {
    private boolean allTables;        // true = toutes les tables, false = sélection
    private List<String> tables;      // Liste des tables à sauvegarder (si allTables = false)
}