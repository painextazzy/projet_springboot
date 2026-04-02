package com.restaurant.controller;

import com.restaurant.dto.MenuDTO;
import com.restaurant.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {
    
    @Autowired
    private MenuService menuService;  // ← Appelle le Service
    
    // GET /api/menu
    @GetMapping
    public List<MenuDTO> getAllPlats() {
        System.out.println("📋 Récupération de tous les plats");
        return menuService.getAllPlats();  // ← Délègue au Service
    }
    
    // GET /api/menu/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MenuDTO> getPlatById(@PathVariable Long id) {
        MenuDTO plat = menuService.getPlatById(id);  // ← Délègue au Service
        if (plat != null) {
            return ResponseEntity.ok(plat);
        }
        return ResponseEntity.notFound().build();
    }
    
    // POST /api/menu
    @PostMapping
    public ResponseEntity<MenuDTO> createPlat(@RequestBody MenuDTO menuDTO) {
        MenuDTO created = menuService.createPlat(menuDTO);  // ← Délègue au Service
        return ResponseEntity.ok(created);
    }
    
    // PUT /api/menu/{id}
    @PutMapping("/{id}")
    public ResponseEntity<MenuDTO> updatePlat(@PathVariable Long id, @RequestBody MenuDTO menuDTO) {
        MenuDTO updated = menuService.updatePlat(id, menuDTO);  // ← Délègue au Service
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE /api/menu/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlat(@PathVariable Long id) {
        if (menuService.deletePlat(id)) {  // ← Délègue au Service
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}