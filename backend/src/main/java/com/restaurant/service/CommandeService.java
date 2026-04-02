package com.restaurant.service;

import com.restaurant.dto.CommandeRequest;
import com.restaurant.dto.CommandeResponse;
import com.restaurant.entity.Commande;
import com.restaurant.entity.LigneCommande;
import com.restaurant.entity.Menu;
import com.restaurant.repository.CommandeRepository;
import com.restaurant.repository.LigneCommandeRepository;
import com.restaurant.repository.MenuRepository;
import com.restaurant.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommandeService {
    
    @Autowired
    private CommandeRepository commandeRepository;
    
    @Autowired
    private LigneCommandeRepository ligneCommandeRepository;
    
    @Autowired
    private MenuRepository menuRepository;
    
    @Autowired
    private TableRepository tableRepository;
    
    /**
     * Récupère la date/heure actuelle à Madagascar (UTC+3)
     * Ajoute +3 heures manuellement
     */
    private LocalDateTime nowMadagascar() {
        // Prendre l'heure UTC et ajouter 3 heures
          return LocalDateTime.now().plusHours(3);
    }
    
    /**
     * Génère un numéro de facture unique
     * Format: FACT-YYYYMMDD-XXXX
     */
    private String genererNumeroFacture() {
        String date = nowMadagascar().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = commandeRepository.count() + 1;
        return String.format("FACT-%s-%04d", date, count);
    }
    
    /**
     * Créer une nouvelle commande
     */
    @Transactional
    public CommandeResponse creerCommande(CommandeRequest request) {
        
        // 1. Vérifier les stocks
        for (CommandeRequest.LigneRequest ligne : request.getLignes()) {
            Menu plat = menuRepository.findById(ligne.getPlatId())
                .orElseThrow(() -> new RuntimeException("Plat non trouvé ID: " + ligne.getPlatId()));
            
            if (plat.getQuantite() < ligne.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour " + plat.getNom() + 
                    ". Stock disponible: " + plat.getQuantite());
            }
        }
        
        // 2. Créer la commande avec la date Madagascar (+3h)
        Commande commande = new Commande();
        commande.setTableId(request.getTableId());
        commande.setDateOuverture(nowMadagascar());  // ← Date Madagascar avec +3h
        commande.setStatut("EN_COURS");
        commande.setTotal(0.0);
        commande.setNumeroFacture(genererNumeroFacture());
        commande = commandeRepository.save(commande);
        
        double total = 0;
        List<LigneCommande> lignes = new ArrayList<>();
        
        // 3. Ajouter les lignes et décrémenter le stock
        for (CommandeRequest.LigneRequest ligneReq : request.getLignes()) {
            Menu plat = menuRepository.findById(ligneReq.getPlatId())
                .orElseThrow(() -> new RuntimeException("Plat non trouvé ID: " + ligneReq.getPlatId()));
            
            LigneCommande ligne = new LigneCommande();
            ligne.setCommandeId(commande.getId());
            ligne.setPlatId(ligneReq.getPlatId());
            ligne.setQuantite(ligneReq.getQuantite());
            ligne.setPrixUnitaire(plat.getPrix());
            ligne.setTotal(ligneReq.getQuantite() * plat.getPrix());
            
            ligneCommandeRepository.save(ligne);
            lignes.add(ligne);
            
            // Décrémenter le stock
            plat.setQuantite(plat.getQuantite() - ligneReq.getQuantite());
            menuRepository.save(plat);
            
            total += ligneReq.getQuantite() * plat.getPrix();
        }
        
        // 4. Mettre à jour le total de la commande
        commande.setTotal(total);
        commande = commandeRepository.save(commande);
        
        return convertToDTO(commande);
    }
    
    /**
     * Récupérer toutes les commandes
     */
    public List<CommandeResponse> getAllCommandes() {
        return commandeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupérer les commandes par statut
     */
    public List<CommandeResponse> getCommandesByStatut(String statut) {
        return commandeRepository.findByStatut(statut).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupérer une commande par ID
     */
    public CommandeResponse getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        return convertToDTO(commande);
    }
    
    /**
     * Marquer une commande comme payée
     */
    @Transactional
    public CommandeResponse payerCommande(Long id) {
        Commande commande = commandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        
        commande.setStatut("PAYEE");
        commande.setDateCloture(nowMadagascar());  // ← Date Madagascar avec +3h
        commande = commandeRepository.save(commande);
        
        return convertToDTO(commande);
    }
    
    /**
     * Convertir une entité Commande en DTO
     */
    private CommandeResponse convertToDTO(Commande commande) {
        CommandeResponse response = new CommandeResponse();
        response.setId(commande.getId());
        response.setNumeroFacture(commande.getNumeroFacture());
        response.setTableId(commande.getTableId());
        response.setDateOuverture(commande.getDateOuverture());
        response.setDateCloture(commande.getDateCloture());
        response.setStatut(commande.getStatut());
        response.setTotal(commande.getTotal());
        
        // Récupérer le nom de la table
        tableRepository.findById(commande.getTableId()).ifPresent(table -> 
            response.setTableNom(table.getNom())
        );
        
        // Récupérer les lignes de commande
        List<LigneCommande> lignes = ligneCommandeRepository.findByCommandeId(commande.getId());
        List<CommandeResponse.LigneCommandeDTO> lignesDTO = lignes.stream().map(ligne -> {
            CommandeResponse.LigneCommandeDTO dto = new CommandeResponse.LigneCommandeDTO();
            dto.setId(ligne.getId());
            dto.setPlatId(ligne.getPlatId());
            dto.setQuantite(ligne.getQuantite());
            dto.setPrixUnitaire(ligne.getPrixUnitaire());
            dto.setTotal(ligne.getTotal());
            
            // Récupérer le nom du plat
            menuRepository.findById(ligne.getPlatId()).ifPresent(plat -> 
                dto.setPlatNom(plat.getNom())
            );
            
            return dto;
        }).collect(Collectors.toList());
        
        response.setLignes(lignesDTO);
        return response;
    }
}