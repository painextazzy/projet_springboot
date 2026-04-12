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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommandeService {
    
    @Autowired
    private CommandeRepository commandeRepository;
    
    @Autowired
    private LigneCommandeRepository ligneCommandeRepository;
    
    @Autowired
    private MenuRepository menuRepository;
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private WebSocketService webSocketService;  // ← AJOUTEZ CECI
    
    private LocalDateTime nowMadagascar() {
        return LocalDateTime.now().plusHours(3);
    }
    
    private String genererNumeroFacture() {
        String date = nowMadagascar().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = commandeRepository.count() + 1;
        return String.format("FACT-%s-%04d", date, count);
    }
    
    @Transactional
    public CommandeResponse creerCommande(CommandeRequest request) {
        // Vérifier les stocks
        for (CommandeRequest.LigneRequest ligne : request.getLignes()) {
            Menu plat = menuRepository.findById(ligne.getPlatId())
                .orElseThrow(() -> new RuntimeException("Plat non trouvé ID: " + ligne.getPlatId()));
            
            if (plat.getQuantite() < ligne.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour " + plat.getNom() + 
                    ". Stock disponible: " + plat.getQuantite());
            }
        }
        
        // Créer la commande
        Commande commande = new Commande();
        commande.setTableId(request.getTableId());
        commande.setDateOuverture(nowMadagascar());
        commande.setStatut("EN_COURS");
        commande.setTotal(0.0);
        commande.setNumeroFacture(genererNumeroFacture());
        commande = commandeRepository.save(commande);
        
        double total = 0;
        List<LigneCommande> lignes = new ArrayList<>();
        
        // Ajouter les lignes
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
            
            plat.setQuantite(plat.getQuantite() - ligneReq.getQuantite());
            menuRepository.save(plat);
            
            total += ligneReq.getQuantite() * plat.getPrix();
        }
        
        commande.setTotal(total);
        commande = commandeRepository.save(commande);
        
        // ✅ Notifier le frontend
        webSocketService.notifyCommandeChanged();
        
        return convertToDTOOptimized(commande);
    }
    
    public List<CommandeResponse> getAllCommandes() {
        return commandeRepository.findAllWithDetails().stream()
                .map(this::convertToDTOOptimized)
                .collect(Collectors.toList());
    }
    
    public List<CommandeResponse> getCommandesByStatut(String statut) {
        return commandeRepository.findByStatutWithDetails(statut).stream()
                .map(this::convertToDTOOptimized)
                .collect(Collectors.toList());
    }
    
    public CommandeResponse getCommandeById(Long id) {
        Commande commande = commandeRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        return convertToDTOOptimized(commande);
    }
    
    @Transactional
    public CommandeResponse payerCommande(Long id) {
        Commande commande = commandeRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        
        commande.setStatut("PAYEE");
        commande.setDateCloture(nowMadagascar());
        commande = commandeRepository.save(commande);
        
        // ✅ Notifier le frontend
        webSocketService.notifyCommandeChanged();
        
        return convertToDTOOptimized(commande);
    }
    
    private CommandeResponse convertToDTOOptimized(Commande commande) {
        CommandeResponse response = new CommandeResponse();
        response.setId(commande.getId());
        response.setNumeroFacture(commande.getNumeroFacture());
        response.setTableId(commande.getTableId());
        response.setDateOuverture(commande.getDateOuverture());
        response.setDateCloture(commande.getDateCloture());
        response.setStatut(commande.getStatut());
        response.setTotal(commande.getTotal());
        
        tableRepository.findById(commande.getTableId()).ifPresent(table -> 
            response.setTableNom(table.getNom())
        );
        
        List<CommandeResponse.LigneCommandeDTO> lignesDTO = commande.getLignes().stream().map(ligne -> {
            CommandeResponse.LigneCommandeDTO dto = new CommandeResponse.LigneCommandeDTO();
            dto.setId(ligne.getId());
            dto.setPlatId(ligne.getPlatId());
            dto.setQuantite(ligne.getQuantite());
            dto.setPrixUnitaire(ligne.getPrixUnitaire());
            dto.setTotal(ligne.getTotal());
            
            menuRepository.findById(ligne.getPlatId()).ifPresent(plat -> 
                dto.setPlatNom(plat.getNom())
            );
            
            return dto;
        }).collect(Collectors.toList());
        
        response.setLignes(lignesDTO);
        return response;
    }
}