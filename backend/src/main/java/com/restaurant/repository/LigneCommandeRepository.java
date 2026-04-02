package com.restaurant.repository;

import com.restaurant.entity.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {
    List<LigneCommande> findByCommandeId(Long commandeId);
}