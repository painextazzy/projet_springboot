package com.restaurant.controller;

import com.restaurant.dto.CommandeRequest;
import com.restaurant.dto.CommandeResponse;
import com.restaurant.service.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "http://localhost:5173")
public class CommandeController {
    
    @Autowired
    private CommandeService commandeService;
    
    @PostMapping
    public ResponseEntity<?> createCommande(@RequestBody CommandeRequest request) {
        try {
            CommandeResponse response = commandeService.creerCommande(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping
    public List<CommandeResponse> getAllCommandes() {
        return commandeService.getAllCommandes();
    }
    
    @GetMapping(params = "statut")
    public List<CommandeResponse> getCommandesByStatut(@RequestParam String statut) {
        return commandeService.getCommandesByStatut(statut);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CommandeResponse> getCommandeById(@PathVariable Long id) {
        try {
            CommandeResponse response = commandeService.getCommandeById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/payer")
    public ResponseEntity<CommandeResponse> payerCommande(@PathVariable Long id) {
        try {
            CommandeResponse response = commandeService.payerCommande(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}