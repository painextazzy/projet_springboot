package com.restaurant.service;

import com.restaurant.entity.RestaurantTable;
import com.restaurant.dto.TableDTO;
import com.restaurant.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TableService {
    
    @Autowired
    private TableRepository tableRepository;
    
    // Convertir Entity vers DTO
    private TableDTO convertToDTO(RestaurantTable table) {
        TableDTO dto = new TableDTO();
        dto.setId(table.getId());
        dto.setNom(table.getNom());
        dto.setCapacite(table.getCapacite());
        dto.setStatus(table.getStatus());
        return dto;
    }
    
    // Convertir DTO vers Entity
    private RestaurantTable convertToEntity(TableDTO dto) {
        RestaurantTable table = new RestaurantTable();
        table.setId(dto.getId());
        table.setNom(dto.getNom());
        table.setCapacite(dto.getCapacite());
        table.setStatus(dto.getStatus());
        return table;
    }
    
    // Récupérer toutes les tables
    public List<TableDTO> getAllTables() {
        return tableRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Récupérer une table par ID
    public TableDTO getTableById(Long id) {
        return tableRepository.findById(id)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    // Créer une nouvelle table
    public TableDTO createTable(TableDTO dto) {
        RestaurantTable table = convertToEntity(dto);
        if (table.getStatus() == null) {
            table.setStatus("libre");
        }
        RestaurantTable saved = tableRepository.save(table);
        return convertToDTO(saved);
    }
    
    // Mettre à jour une table
    public TableDTO updateTable(Long id, TableDTO dto) {
        RestaurantTable existing = tableRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setNom(dto.getNom());
            existing.setCapacite(dto.getCapacite());
            existing.setStatus(dto.getStatus());
            RestaurantTable updated = tableRepository.save(existing);
            return convertToDTO(updated);
        }
        return null;
    }
    
    // Mettre à jour le statut d'une table
    public TableDTO updateStatus(Long id, String status) {
        RestaurantTable table = tableRepository.findById(id).orElse(null);
        if (table != null) {
            table.setStatus(status);
            RestaurantTable updated = tableRepository.save(table);
            return convertToDTO(updated);
        }
        return null;
    }
    
    // Supprimer une table
    public boolean deleteTable(Long id) {
        if (tableRepository.existsById(id)) {
            tableRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Initialiser des données de test
    public void initTables() {
        if (tableRepository.count() == 0) {
            String[] noms = {
                "Table 1", "Table 2", "Table 3", "Table 4", "Table 5",
                "Table 6", "Table 7", "Table 8", "Table 9", "Table 10",
                "Table 11", "Table 12", "Table 13", "Table 14", "Table 15",
                "Table 16", "Table 17", "Table 18", "Table 19", "Table 20"
            };
            
            int[] capacites = {
                4, 4, 6, 2, 4, 6, 4, 8, 4, 2,
                6, 4, 2, 8, 8, 10, 6, 12, 2, 2
            };
            
            String[] statuses = {
                "libre", "occupee", "libre", "reservee", "occupee",
                "libre", "a_nettoyer", "libre", "libre", "occupee",
                "libre", "reservee", "libre", "occupee", "libre",
                "reservee", "libre", "occupee", "libre", "occupee"
            };
            
            for (int i = 0; i < noms.length; i++) {
                RestaurantTable table = new RestaurantTable();
                table.setNom(noms[i]);
                table.setCapacite(capacites[i]);
                table.setStatus(statuses[i]);
                tableRepository.save(table);
            }
            System.out.println("✅ 20 tables créées !");
        }
    }
}