package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime; // ⚠️ N'OUBLIEZ PAS CET IMPORT

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(unique = true, nullable = false, length = 191)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // SERVEUR ou MANAGER

    // ⭐ NOUVEAUX CHAMPS (UNIQUEMENT POUR LA RÉINITIALISATION) ⭐
    @Column(unique = true)
    private String resetToken;

    private LocalDateTime resetTokenExpiry;

    // Constructeurs
    public User() {
    }

    public User(String nom, String email, String password, String role) {
        this.nom = nom;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}