package com.restaurant.service;

import com.restaurant.dto.LoginRequest;
import com.restaurant.dto.LoginResponse;
import com.restaurant.entity.User;
import com.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Authentifie un utilisateur
     * @param request email et mot de passe
     * @return LoginResponse avec les infos ou null
     */
    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Vérification du mot de passe (simple pour le moment)
            if (request.getPassword().equals(user.getPassword())) {
                return new LoginResponse(
                    user.getRole(),
                    user.getNom(),
                    user.getEmail()
                );
            }
        }
        return null;  // Authentification échouée
    }
    
    /**
     * Crée des utilisateurs de test au démarrage
     */
    public void initUsers() {
        if (userRepository.count() == 0) {
            // Serveur
            User serveur = new User();
            serveur.setNom("Jean Dupont");
            serveur.setEmail("serveur@resto.com");
            serveur.setPassword("password");
            serveur.setRole("SERVEUR");
            userRepository.save(serveur);
            
            // Manager
            User manager = new User();
            manager.setNom("Sophie Martin");
            manager.setEmail("manager@resto.com");
            manager.setPassword("password");
            manager.setRole("MANAGER");
            userRepository.save(manager);
            
            System.out.println("✅ 2 utilisateurs de test créés !");
            System.out.println("   Serveur: serveur@resto.com / password");
            System.out.println("   Manager: manager@resto.com / password");
        }
    }
}