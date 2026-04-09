// src/services/api.js
const API_URL = "http://localhost:8080/api";

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

  // Ajouter une table
  createTable: async (table) => {
    const response = await fetch(`${API_URL}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table),
    });
    return response.json();
  },

  // Modifier une table
  updateTable: async (id, table) => {
    const response = await fetch(`${API_URL}/tables/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table),
    });
    return response.json();
  },

  // Changer le statut
  updateTableStatus: async (id, status) => {
    const response = await fetch(
      `${API_URL}/tables/${id}/status?status=${status}`,
      {
        method: "PATCH",
      },
    );
    return response.json();
  },

  // Supprimer une table
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
  // src/services/api.js

  // Utilisateurs
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
  // src/services/api.js

  // Sauvegarde
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
};
