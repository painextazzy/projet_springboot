package com.restaurant;

import com.restaurant.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class RestaurantBackendApplication implements CommandLineRunner {
    
    @Autowired
    private AuthService authService;
    
    public static void main(String[] args) {
        // ⚠️ CRUCIAL : Définir le fuseau AVANT SpringApplication.run()
        TimeZone.setDefault(TimeZone.getTimeZone("Indian/Antananarivo"));
        
        SpringApplication.run(RestaurantBackendApplication.class, args);
    }
    
    @Override
    public void run(String... args) {
        System.out.println(" Restaurant Backend démarré !");
        System.out.println("Fuseau horaire actuel: " + TimeZone.getDefault().getID());
        System.out.println(" Heure actuelle: " + java.time.LocalDateTime.now());
        System.out.println("API disponible sur http://localhost:8080");
        
        authService.initUsers();
    }
}