package com.restaurant.service;

import com.restaurant.dto.MenuDTO;
import com.restaurant.entity.Menu;
import com.restaurant.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {
    
    @Autowired
    private MenuRepository menuRepository;
    
    // Convertir Entity vers DTO
    private MenuDTO convertToDTO(Menu menu) {
        MenuDTO dto = new MenuDTO();
        dto.setId(menu.getId());
        dto.setNom(menu.getNom());
        dto.setDescription(menu.getDescription());
        dto.setPrix(menu.getPrix());
        dto.setImageUrl(menu.getImageUrl());
        dto.setQuantite(menu.getQuantite());
        dto.setDisponible(menu.getDisponible());
        dto.setCategorie(menu.getCategorie());
        return dto;
    }
    
    // Convertir DTO vers Entity
    private Menu convertToEntity(MenuDTO dto) {
        Menu menu = new Menu();
        menu.setId(dto.getId());
        menu.setNom(dto.getNom());
        menu.setDescription(dto.getDescription());
        menu.setPrix(dto.getPrix());
        menu.setImageUrl(dto.getImageUrl());
        menu.setQuantite(dto.getQuantite() != null ? dto.getQuantite() : 0);
        menu.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : true);
        menu.setCategorie(dto.getCategorie() != null ? dto.getCategorie() : "PLAT");
        return menu;
    }
    
    // Récupérer tous les plats
    public List<MenuDTO> getAllPlats() {
        return menuRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer les plats disponibles
    public List<MenuDTO> getPlatsDisponibles() {
        return menuRepository.findByDisponibleTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer un plat par ID
    public MenuDTO getPlatById(Long id) {
        return menuRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    // Rechercher des plats par nom
    public List<MenuDTO> rechercherPlats(String nom) {
        return menuRepository.findByNomContainingIgnoreCase(nom).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer les plats par catégorie
    public List<MenuDTO> getPlatsByCategorie(String categorie) {
        return menuRepository.findByCategorie(categorie).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer les plats disponibles par catégorie
    public List<MenuDTO> getPlatsDisponiblesByCategorie(String categorie) {
        return menuRepository.findByCategorieAndDisponibleTrue(categorie).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Créer un nouveau plat
    public MenuDTO createPlat(MenuDTO dto) {
        Menu menu = convertToEntity(dto);
        Menu saved = menuRepository.save(menu);
        return convertToDTO(saved);
    }
    
    // Mettre à jour un plat
    public MenuDTO updatePlat(Long id, MenuDTO dto) {
        Menu existing = menuRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setNom(dto.getNom());
            existing.setDescription(dto.getDescription());
            existing.setPrix(dto.getPrix());
            existing.setImageUrl(dto.getImageUrl());
            existing.setQuantite(dto.getQuantite());
            existing.setDisponible(dto.getDisponible());
            existing.setCategorie(dto.getCategorie());
            Menu updated = menuRepository.save(existing);
            return convertToDTO(updated);
        }
        return null;
    }
    
    // Supprimer un plat
    public boolean deletePlat(Long id) {
        if (menuRepository.existsById(id)) {
            menuRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Décrémenter le stock
    public boolean decrementerStock(Long id, int quantite) {
        Menu menu = menuRepository.findById(id).orElse(null);
        if (menu != null && menu.getQuantite() >= quantite) {
            menu.setQuantite(menu.getQuantite() - quantite);
            menuRepository.save(menu);
            return true;
        }
        return false;
    }
    
    // Vérifier si un plat est disponible
    public boolean isDisponible(Long id, int quantiteDemandee) {
        MenuDTO plat = getPlatById(id);
        if (plat == null) return false;
        return plat.getDisponible() && plat.getQuantite() >= quantiteDemandee;
    }
}