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
    

}