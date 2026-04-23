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
    private TableService tableService; // ✅ Injecté

    @Autowired
    private WebSocketService webSocketService;

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
        commande.setDateOuverture(request.getDateOuverture() != null ? request.getDateOuverture() : nowMadagascar());
        commande.setStatut("EN_COURS");
        commande.setTotal(0.0);
        commande.setNumeroFacture(genererNumeroFacture());
        commande = commandeRepository.save(commande);

        double total = 0;
        List<LigneCommande> lignes = new ArrayList<>();

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

        commande.setLignes(lignes);
        commande.setTotal(total);
        commande = commandeRepository.save(commande);

        // ✅ Changer le statut de la table en OCCUPEE
        tableService.updateStatus(request.getTableId(), "occupee");
        webSocketService.notifyDataChanged();

        return convertToDTO(commande);
    }

    // ✅ OPTIMISÉ : 1 seule requête pour les commandes
    public List<CommandeResponse> getAllCommandes() {
        // Récupérer toutes les commandes en 1 requête
        List<Commande> commandes = commandeRepository.findAll();

        if (commandes.isEmpty()) {
            return new ArrayList<>();
        }

        // Récupérer tous les IDs des commandes
        List<Long> commandeIds = commandes.stream()
                .map(Commande::getId)
                .collect(Collectors.toList());

        // ✅ Récupérer TOUTES les lignes en 1 seule requête
        List<LigneCommande> toutesLignes = ligneCommandeRepository.findByCommandeIdIn(commandeIds);

        // ✅ Récupérer TOUS les plats en 1 seule requête
        List<Long> platIds = toutesLignes.stream()
                .map(LigneCommande::getPlatId)
                .distinct()
                .collect(Collectors.toList());
        List<Menu> tousPlats = menuRepository.findAllById(platIds);

        // Créer des maps pour un accès rapide
        java.util.Map<Long, List<LigneCommande>> lignesParCommande = toutesLignes.stream()
                .collect(Collectors.groupingBy(LigneCommande::getCommandeId));

        java.util.Map<Long, Menu> platsParId = tousPlats.stream()
                .collect(Collectors.toMap(Menu::getId, p -> p));

        // Construire les réponses
        return commandes.stream()
                .map(commande -> convertToDTOOptimized(commande,
                        lignesParCommande.getOrDefault(commande.getId(), new ArrayList<>()),
                        platsParId))
                .collect(Collectors.toList());
    }

    public List<CommandeResponse> getCommandesByStatut(String statut) {
        List<Commande> commandes = commandeRepository.findByStatut(statut);

        if (commandes.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> commandeIds = commandes.stream()
                .map(Commande::getId)
                .collect(Collectors.toList());

        List<LigneCommande> toutesLignes = ligneCommandeRepository.findByCommandeIdIn(commandeIds);

        List<Long> platIds = toutesLignes.stream()
                .map(LigneCommande::getPlatId)
                .distinct()
                .collect(Collectors.toList());
        List<Menu> tousPlats = menuRepository.findAllById(platIds);

        java.util.Map<Long, List<LigneCommande>> lignesParCommande = toutesLignes.stream()
                .collect(Collectors.groupingBy(LigneCommande::getCommandeId));

        java.util.Map<Long, Menu> platsParId = tousPlats.stream()
                .collect(Collectors.toMap(Menu::getId, p -> p));

        return commandes.stream()
                .map(commande -> convertToDTOOptimized(commande,
                        lignesParCommande.getOrDefault(commande.getId(), new ArrayList<>()),
                        platsParId))
                .collect(Collectors.toList());
    }

    public CommandeResponse getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        List<LigneCommande> lignes = ligneCommandeRepository.findByCommandeId(id);

        java.util.Map<Long, Menu> platsParId = new java.util.HashMap<>();
        for (LigneCommande ligne : lignes) {
            if (!platsParId.containsKey(ligne.getPlatId())) {
                menuRepository.findById(ligne.getPlatId()).ifPresent(plat -> platsParId.put(ligne.getPlatId(), plat));
            }
        }

        return convertToDTOOptimized(commande, lignes, platsParId);
    }

    @Transactional
    public CommandeResponse payerCommande(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        commande.setStatut("PAYEE");
        commande.setDateCloture(nowMadagascar());
        commande = commandeRepository.save(commande);

        // ✅ Libérer la table (statut LIBRE)
        tableService.updateStatus(commande.getTableId(), "libre");
        webSocketService.notifyTableChanged(commande.getTableId(), "libre");
        webSocketService.notifyCommandeChanged();

        List<LigneCommande> lignes = ligneCommandeRepository.findByCommandeId(id);
        java.util.Map<Long, Menu> platsParId = new java.util.HashMap<>();
        for (LigneCommande ligne : lignes) {
            if (!platsParId.containsKey(ligne.getPlatId())) {
                menuRepository.findById(ligne.getPlatId()).ifPresent(plat -> platsParId.put(ligne.getPlatId(), plat));
            }
        }

        return convertToDTOOptimized(commande, lignes, platsParId);
    }

    private CommandeResponse convertToDTOOptimized(Commande commande, List<LigneCommande> lignes,
            java.util.Map<Long, Menu> platsParId) {
        CommandeResponse response = new CommandeResponse();
        response.setId(commande.getId());
        response.setNumeroFacture(commande.getNumeroFacture());
        response.setTableId(commande.getTableId());
        response.setDateOuverture(commande.getDateOuverture());
        response.setDateCloture(commande.getDateCloture());
        response.setStatut(commande.getStatut());
        response.setTotal(commande.getTotal());

        tableRepository.findById(commande.getTableId()).ifPresent(table -> response.setTableNom(table.getNom()));

        List<CommandeResponse.LigneCommandeDTO> lignesDTO = lignes.stream().map(ligne -> {
            CommandeResponse.LigneCommandeDTO dto = new CommandeResponse.LigneCommandeDTO();
            dto.setId(ligne.getId());
            dto.setPlatId(ligne.getPlatId());
            dto.setQuantite(ligne.getQuantite());
            dto.setPrixUnitaire(ligne.getPrixUnitaire());
            dto.setTotal(ligne.getTotal());

            Menu plat = platsParId.get(ligne.getPlatId());
            if (plat != null) {
                dto.setPlatNom(plat.getNom());
            }

            return dto;
        }).collect(Collectors.toList());

        response.setLignes(lignesDTO);
        return response;
    }

    private CommandeResponse convertToDTO(Commande commande) {
        List<LigneCommande> lignes = ligneCommandeRepository.findByCommandeId(commande.getId());
        java.util.Map<Long, Menu> platsParId = new java.util.HashMap<>();
        for (LigneCommande ligne : lignes) {
            if (!platsParId.containsKey(ligne.getPlatId())) {
                menuRepository.findById(ligne.getPlatId()).ifPresent(plat -> platsParId.put(ligne.getPlatId(), plat));
            }
        }
        return convertToDTOOptimized(commande, lignes, platsParId);
    }
}