package com.restaurant.repository;

import com.restaurant.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    List<Menu> findByDisponibleTrue();
    
    List<Menu> findByNomContainingIgnoreCase(String nom);
    
    List<Menu> findByCategorie(String categorie);
    
    List<Menu> findByCategorieAndDisponibleTrue(String categorie);
}