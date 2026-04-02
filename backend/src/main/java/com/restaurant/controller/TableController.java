package com.restaurant.controller;

import com.restaurant.dto.TableDTO;
import com.restaurant.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "http://localhost:5173")
public class TableController {
    
    @Autowired
    private TableService tableService;
    
    // GET /api/tables - Récupérer toutes les tables
    @GetMapping
    public List<TableDTO> getAllTables() {
        System.out.println("📋 Récupération de toutes les tables");
        return tableService.getAllTables();
    }
    
    // GET /api/tables/{id} - Récupérer une table par ID
    @GetMapping("/{id}")
    public ResponseEntity<TableDTO> getTableById(@PathVariable Long id) {
        System.out.println("🔍 Récupération de la table ID: " + id);
        TableDTO table = tableService.getTableById(id);
        if (table != null) {
            return ResponseEntity.ok(table);
        }
        return ResponseEntity.notFound().build();
    }
    
    // POST /api/tables - Créer une nouvelle table
    @PostMapping
    public ResponseEntity<TableDTO> createTable(@RequestBody TableDTO tableDTO) {
        System.out.println("➕ Création d'une nouvelle table: " + tableDTO.getNom());
        TableDTO created = tableService.createTable(tableDTO);
        return ResponseEntity.ok(created);
    }
    
    // PUT /api/tables/{id} - Mettre à jour une table
    @PutMapping("/{id}")
    public ResponseEntity<TableDTO> updateTable(@PathVariable Long id, @RequestBody TableDTO tableDTO) {
        System.out.println("✏️ Mise à jour de la table ID: " + id);
        TableDTO updated = tableService.updateTable(id, tableDTO);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
    
    // PATCH /api/tables/{id}/status - Mettre à jour le statut
    @PatchMapping("/{id}/status")
    public ResponseEntity<TableDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        System.out.println("🔄 Changement du statut de la table ID: " + id + " -> " + status);
        TableDTO updated = tableService.updateStatus(id, status);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE /api/tables/{id} - Supprimer une table
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        System.out.println("🗑️ Suppression de la table ID: " + id);
        if (tableService.deleteTable(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}