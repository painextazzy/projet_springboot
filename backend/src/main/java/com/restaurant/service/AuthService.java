package com.restaurant.service;

import com.restaurant.dto.LoginRequest;
import com.restaurant.dto.LoginResponse;
import com.restaurant.dto.UpdateProfileRequest;
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
     * 
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
                        user.getId(),
                        user.getRole(),
                        user.getNom(),
                        user.getEmail());
            }
        }
        return null; // Authentification échouée
    }

    /**
     * Met à jour le profil d'un utilisateur
     * 
     * @param request données de mise à jour
     * @return LoginResponse avec les nouvelles infos ou null en cas d'erreur
     */
    public LoginResponse updateProfile(UpdateProfileRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getId());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }

        User user = userOpt.get();

        // Vérifier le mot de passe actuel
        if (request.getMotDePasseActuel() != null && !request.getMotDePasseActuel().isEmpty()) {
            if (!request.getMotDePasseActuel().equals(user.getPassword())) {
                throw new RuntimeException("Mot de passe actuel incorrect");
            }

            // Mettre à jour le mot de passe si fourni
            if (request.getNouveauMotDePasse() != null && !request.getNouveauMotDePasse().isEmpty()) {
                user.setPassword(request.getNouveauMotDePasse());
            }
        }

        // Mettre à jour le nom si fourni
        if (request.getNom() != null && !request.getNom().isEmpty()) {
            user.setNom(request.getNom());
        }

        // Mettre à jour l'email si fourni et différent
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                throw new RuntimeException("Cet email est déjà utilisé par un autre utilisateur");
            }
            user.setEmail(request.getEmail());
        }

        // Sauvegarder les modifications
        user = userRepository.save(user);

        return new LoginResponse(
                user.getId(),
                user.getRole(),
                user.getNom(),
                user.getEmail());
    }

}