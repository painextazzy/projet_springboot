// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Erreur HTTP: ${response.status}`);
  }
  return response.json();
};

export const api = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
  // Tables
  getTables: async () => {
    const response = await fetch(`${API_URL}/tables`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  },

  createTable: async (table) => {
    const response = await fetch(`${API_URL}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table),
    });
    return response.json();
  },

  updateTable: async (id, table) => {
    const response = await fetch(`${API_URL}/tables/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table),
    });
    return response.json();
  },

  updateTableStatus: async (id, status) => {
    const response = await fetch(
      `${API_URL}/tables/${id}/status?status=${status}`,
      {
        method: "PATCH",
      },
    );
    return response.json();
  },

  deleteTable: async (id) => {
    const response = await fetch(`${API_URL}/tables/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  getMenu: async () => {
    const response = await fetch(`${API_URL}/menu`);
    return response.json();
  },

  getPlatsDisponibles: async () => {
    const response = await fetch(`${API_URL}/menu/disponibles`);
    return response.json();
  },

  getPlatsByCategorie: async (categorie) => {
    const response = await fetch(`${API_URL}/menu/categorie/${categorie}`);
    return response.json();
  },

  getPlatsDisponiblesByCategorie: async (categorie) => {
    const response = await fetch(
      `${API_URL}/menu/categorie/${categorie}/disponibles`,
    );
    return response.json();
  },

  getOccupiedTablesCount: async () => {
    const response = await fetch(`${API_URL}/tables/occupied/count`);
    return response.json();
  },

  getPlatById: async (id) => {
    const response = await fetch(`${API_URL}/menu/${id}`);
    return response.json();
  },

  rechercherPlats: async (nom) => {
    const response = await fetch(`${API_URL}/menu/recherche?nom=${nom}`);
    return response.json();
  },

  createPlat: async (plat) => {
    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plat),
    });
    return response.json();
  },

  updatePlat: async (id, plat) => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plat),
    });
    return response.json();
  },

  deletePlat: async (id) => {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  decrementerStock: async (id, quantite) => {
    const response = await fetch(
      `${API_URL}/menu/${id}/stock?quantite=${quantite}`,
      {
        method: "PATCH",
      },
    );
    return response.json();
  },

  // ========== COMMANDES ==========
  createCommande: async (commande) => {
    const response = await fetch(`${API_URL}/commandes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commande),
    });
    return handleResponse(response);
  },

  getCommandes: async () => {
    const response = await fetch(`${API_URL}/commandes`);
    return handleResponse(response);
  },

  getCommandesByStatut: async (statut) => {
    const response = await fetch(`${API_URL}/commandes?statut=${statut}`);
    return handleResponse(response);
  },

  getCommandeById: async (id) => {
    const response = await fetch(`${API_URL}/commandes/${id}`);
    return handleResponse(response);
  },

  payerCommande: async (id) => {
    const response = await fetch(`${API_URL}/commandes/${id}/payer`, {
      method: "PATCH",
    });
    return handleResponse(response);
  },

  // ========== UTILISATEURS ==========
  getUtilisateurs: async () => {
    const response = await fetch(`${API_URL}/users`);
    return handleResponse(response);
  },

  getUtilisateurById: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`);
    return handleResponse(response);
  },

  createUtilisateur: async (utilisateur) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(utilisateur),
    });
    return handleResponse(response);
  },

  updateUtilisateur: async (id, utilisateur) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(utilisateur),
    });
    return handleResponse(response);
  },

  deleteUtilisateur: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // ========== SAUVEGARDE ==========
  getSauvegardeTables: async () => {
    const response = await fetch(`${API_URL}/sauvegarde/tables`);
    return handleResponse(response);
  },

  exportDatabase: async (request) => {
    const response = await fetch(`${API_URL}/sauvegarde/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  importDatabase: async (data) => {
    const response = await fetch(`${API_URL}/sauvegarde/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // ========== PROFIL UTILISATEUR ==========
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
  // ========== RÉINITIALISATION DU MOT DE PASSE ==========

  /**
   * Étape 0 : Vérifier si l'email existe dans la base
   * @param {string} email - L'email à vérifier
   */
  checkEmail: async (email) => {
    const response = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },

  /**
   * Étape 1 : Demander un lien de réinitialisation
   * @param {string} email - L'email de l'utilisateur
   */
  requestPasswordReset: async (email) => {
    const response = await fetch(`${API_URL}/auth/reset-password-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  /**
   * Étape 2 : Vérifier si le token est valide
   * @param {string} token - Le token reçu par email
   * @param {number|null} userId - L'ID utilisateur (optionnel mais recommandé)
   */
  verifyResetToken: async (token, userId = null) => {
    let url = `${API_URL}/auth/verify-reset-token?token=${encodeURIComponent(token)}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },

  /**
   * Étape 3 : Réinitialiser le mot de passe
   * @param {Object} data - Les données de réinitialisation
   * @param {string} data.token - Le token reçu par email
   * @param {number|null} data.userId - L'ID utilisateur
   * @param {string} data.newPassword - Le nouveau mot de passe
   */
  resetPassword: async (data) => {
    const body = {
      token: data.token,
      newPassword: data.newPassword,
    };
    
    // Ajouter userId seulement s'il existe
    if (data.userId) {
      body.userId = data.userId.toString();
    }
    
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

};
