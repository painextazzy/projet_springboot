package com.restaurant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SauvegardeService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Récupère toutes les tables de la base de données
     */
    public List<String> getAllTables() {
        try {
            // MySQL: SHOW TABLES
            return jdbcTemplate.queryForList("SHOW TABLES", String.class);
        } catch (Exception e) {
            try {
                // Alternative: information_schema
                return jdbcTemplate.queryForList(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()", 
                    String.class
                );
            } catch (Exception ex) {
                System.err.println("Erreur récupération tables: " + ex.getMessage());
                // Tables par défaut
                return Arrays.asList("commandes", "menu", "tables", "users", "lignes_commande", "promotions", "promotion_plats");
            }
        }
    }

    /**
     * Exporte les données des tables sélectionnées au format JSON
     */
    public Map<String, Object> exportData(List<String> tables) {
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("exportDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        exportData.put("version", "1.0");
        exportData.put("format", "JSON");
        
        Map<String, List<Map<String, Object>>> data = new HashMap<>();
        
        for (String table : tables) {
            try {
                String sql = "SELECT * FROM " + table;
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
                data.put(table, rows);
                System.out.println("✅ Exportée: " + table + " (" + rows.size() + " lignes)");
            } catch (Exception e) {
                System.err.println("❌ Erreur exportation " + table + ": " + e.getMessage());
                data.put(table, new ArrayList<>());
            }
        }
        
        exportData.put("data", data);
        return exportData;
    }

    /**
     * Importe les données depuis un fichier JSON
     */
    @Transactional
    public Map<String, Object> importData(Map<String, Object> importData) {
        Map<String, Object> result = new HashMap<>();
        List<String> success = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, List<Map<String, Object>>> data = 
                (Map<String, List<Map<String, Object>>>) importData.get("data");
            
            if (data == null) {
                throw new RuntimeException("Format de fichier invalide: champ 'data' manquant");
            }
            
            for (Map.Entry<String, List<Map<String, Object>>> entry : data.entrySet()) {
                String tableName = entry.getKey();
                List<Map<String, Object>> rows = entry.getValue();
                
                try {
                    // Vider la table avant import
                    jdbcTemplate.execute("TRUNCATE TABLE " + tableName);
                    
                    // Réinsérer les données
                    for (Map<String, Object> row : rows) {
                        insertRow(tableName, row);
                    }
                    
                    success.add(tableName + " (" + rows.size() + " lignes)");
                    System.out.println("✅ Importée: " + tableName + " (" + rows.size() + " lignes)");
                } catch (Exception e) {
                    errors.add(tableName + ": " + e.getMessage());
                    System.err.println("❌ Erreur import " + tableName + ": " + e.getMessage());
                }
            }
            
            result.put("success", true);
            result.put("message", "Import terminé");
            result.put("tables_success", success);
            result.put("tables_errors", errors);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Insère une ligne dans une table
     */
    private void insertRow(String tableName, Map<String, Object> row) {
        StringBuilder columns = new StringBuilder();
        StringBuilder values = new StringBuilder();
        List<Object> params = new ArrayList<>();
        
        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (entry.getValue() == null) {
                continue; // Ignorer les valeurs null
            }
            
            if (columns.length() > 0) {
                columns.append(", ");
                values.append(", ");
            }
            columns.append(entry.getKey());
            values.append("?");
            params.add(entry.getValue());
        }
        
        if (columns.length() == 0) {
            return; // Aucune colonne valide
        }
        
        String sql = String.format("INSERT INTO %s (%s) VALUES (%s)", 
            tableName, columns.toString(), values.toString());
        
        jdbcTemplate.update(sql, params.toArray());
    }
}