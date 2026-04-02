package com.restaurant.controller;

import com.restaurant.dto.SauvegardeRequest;
import com.restaurant.service.SauvegardeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sauvegarde")
@CrossOrigin(origins = "http://localhost:3000")
public class SauvegardeController {

    @Autowired
    private SauvegardeService sauvegardeService;

    /**
     * GET /api/sauvegarde/tables
     * Récupère la liste de toutes les tables de la base
     */
    @GetMapping("/tables")
    public ResponseEntity<List<String>> getTables() {
        try {
            List<String> tables = sauvegardeService.getAllTables();
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/sauvegarde/export
     * Exporte les données des tables sélectionnées
     */
    @PostMapping("/export")
    public ResponseEntity<Map<String, Object>> export(@RequestBody SauvegardeRequest request) {
        try {
            List<String> tablesToExport;
            
            if (request.isAllTables()) {
                tablesToExport = sauvegardeService.getAllTables();
            } else {
                tablesToExport = request.getTables();
                if (tablesToExport == null || tablesToExport.isEmpty()) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Aucune table sélectionnée");
                    return ResponseEntity.badRequest().body(error);
                }
            }
            
            Map<String, Object> exportData = sauvegardeService.exportData(tablesToExport);
            return ResponseEntity.ok(exportData);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * POST /api/sauvegarde/import
     * Importe les données depuis un fichier JSON
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importData(@RequestBody Map<String, Object> importData) {
        try {
            Map<String, Object> result = sauvegardeService.importData(importData);
            if ((boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}