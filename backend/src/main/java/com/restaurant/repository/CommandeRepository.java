package com.restaurant.repository;

import com.restaurant.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    
    // Pour le Dashboard (rapide, sans détails)
    @Query("SELECT c FROM Commande c")
    List<Commande> findAllForDashboard();
    
    // Pour le Manager : 1 seule requête avec TOUTES les données
    @Query("SELECT DISTINCT c FROM Commande c " +
           "LEFT JOIN FETCH c.lignes l " +
           "LEFT JOIN FETCH l.plat")
    List<Commande> findAllWithDetails();
    
    // Par statut avec détails
    @Query("SELECT DISTINCT c FROM Commande c " +
           "LEFT JOIN FETCH c.lignes l " +
           "LEFT JOIN FETCH l.plat " +
           "WHERE c.statut = :statut")
    List<Commande> findByStatutWithDetails(@Param("statut") String statut);
    
    // Par ID avec détails
    @Query("SELECT c FROM Commande c " +
           "LEFT JOIN FETCH c.lignes l " +
           "LEFT JOIN FETCH l.plat " +
           "WHERE c.id = :id")
    Optional<Commande> findByIdWithDetails(@Param("id") Long id);
}