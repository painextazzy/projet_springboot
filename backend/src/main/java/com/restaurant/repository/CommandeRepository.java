package com.restaurant.repository;

import com.restaurant.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    
    // Version simple pour le Dashboard
    List<Commande> findByStatut(String statut);
    
    // ✅ Version avec JOIN FETCH (maintenant que la relation existe)
    @Query("SELECT DISTINCT c FROM Commande c LEFT JOIN FETCH c.lignes l LEFT JOIN FETCH l.plat")
    List<Commande> findAllWithDetails();
    
    @Query("SELECT DISTINCT c FROM Commande c LEFT JOIN FETCH c.lignes l LEFT JOIN FETCH l.plat WHERE c.statut = :statut")
    List<Commande> findByStatutWithDetails(String statut);
    
    @Query("SELECT c FROM Commande c LEFT JOIN FETCH c.lignes l LEFT JOIN FETCH l.plat WHERE c.id = :id")
    Optional<Commande> findByIdWithDetails(Long id);
}