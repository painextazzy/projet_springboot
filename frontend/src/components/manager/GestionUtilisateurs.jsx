import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import SkeletonUtilisateurs from "./skeletons/SkeletonUtilisateurs";

export default function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recherche, setRecherche] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userEdit, setUserEdit] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    role: "SERVEUR", // Seul rôle possible (fixé)
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    setLoading(true);
    try {
      const data = await api.getUtilisateurs();
      // Filtrer pour n'afficher que les SERVEURS (pas l'admin manager)
      const serveurs = data.filter((user) => user.role === "SERVEUR");
      setUtilisateurs(serveurs);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError("Impossible de charger les utilisateurs");
      showNotification("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  const utilisateursFiltres = utilisateurs.filter((user) => {
    if (
      recherche &&
      !user.nom?.toLowerCase().includes(recherche.toLowerCase()) &&
      !user.email?.toLowerCase().includes(recherche.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleAjouter = async () => {
    if (!formData.nom || !formData.email || !formData.password) {
      showNotification("Veuillez remplir tous les champs", "error");
      return;
    }

    try {
      const nouvelUtilisateur = {
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        role: "SERVEUR", // Forcé à SERVEUR
      };
      const response = await api.createUtilisateur(nouvelUtilisateur);
      setUtilisateurs([...utilisateurs, response]);
      setShowModal(false);
      resetForm();
      showNotification("Serveur ajouté avec succès", "success");
    } catch (error) {
      console.error("Erreur ajout:", error);
      showNotification("Erreur lors de l'ajout", "error");
    }
  };

  const handleModifier = async () => {
    if (!formData.nom || !formData.email) {
      showNotification("Veuillez remplir tous les champs", "error");
      return;
    }

    try {
      const utilisateurModifie = {
        nom: formData.nom,
        email: formData.email,
        role: "SERVEUR",
      };
      // Si un nouveau mot de passe est fourni, l'ajouter
      if (formData.password) {
        utilisateurModifie.password = formData.password;
      }
      const response = await api.updateUtilisateur(
        userEdit.id,
        utilisateurModifie,
      );
      setUtilisateurs(
        utilisateurs.map((u) => (u.id === userEdit.id ? response : u)),
      );
      setShowModal(false);
      setUserEdit(null);
      resetForm();
      showNotification("Serveur modifié avec succès", "success");
    } catch (error) {
      console.error("Erreur modification:", error);
      showNotification("Erreur lors de la modification", "error");
    }
  };

  const handleSupprimer = async (id, nom) => {
    if (confirm(`Supprimer le serveur "${nom}" ?`)) {
      try {
        await api.deleteUtilisateur(id);
        setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
        setShowActionMenu(null);
        showNotification("Serveur supprimé avec succès", "success");
      } catch (error) {
        console.error("Erreur suppression:", error);
        showNotification("Erreur lors de la suppression", "error");
      }
    }
  };

  const openEditModal = (user) => {
    setUserEdit(user);
    setFormData({
      nom: user.nom || "",
      email: user.email || "",
      password: "", // On ne pré-remplit pas le mot de passe
      role: "SERVEUR",
    });
    setShowModal(true);
    setShowActionMenu(null);
  };

  const openAddModal = () => {
    setUserEdit(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      email: "",
      password: "",
      role: "SERVEUR",
    });
  };

  const getRoleBadge = (role) => {
    if (role === "SERVEUR") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }
    return "bg-purple-100 text-purple-700 border border-purple-200";
  };

  const getRoleLabel = (role) => {
    if (role === "SERVEUR") return "Serveur";
    return role;
  };

  if (loading) {
    return <SkeletonUtilisateurs />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={chargerUtilisateurs}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {notification.type === "error" ? "error" : "check_circle"}
            </span>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Gestion des Serveurs
            </h2>
            <p className="text-secondary text-sm sm:text-base mt-1">
              Gérez les comptes des serveurs du restaurant.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition text-sm sm:text-base"
          >
            <span className="material-symbols-outlined text-base sm:text-lg">
              add
            </span>
            <span className="hidden sm:inline">Ajouter un serveur</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex justify-end mb-6">
          <div className="relative w-full sm:max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg sm:text-xl">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Rechercher un serveur..."
            />
          </div>
        </div>

        {/* Version Desktop : Tableau */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Serveur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {utilisateursFiltres.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      Aucun serveur trouvé
                    </td>
                  </tr>
                ) : (
                  utilisateursFiltres.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-base">
                              person
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {user.nom}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setShowActionMenu(
                                showActionMenu === user.id ? null : user.id,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined">
                              more_vert
                            </span>
                          </button>
                          {showActionMenu === user.id && (
                            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10 min-w-[130px]">
                              <button
                                onClick={() => openEditModal(user)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition"
                              >
                                <span className="material-symbols-outlined text-base">
                                  edit
                                </span>
                                Modifier
                              </button>
                              <button
                                onClick={() =>
                                  handleSupprimer(user.id, user.nom)
                                }
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                              >
                                <span className="material-symbols-outlined text-base">
                                  delete
                                </span>
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Version Mobile : Cartes */}
        <div className="md:hidden space-y-4">
          {utilisateursFiltres.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl">
                  group
                </span>
                <span className="text-sm">Aucun serveur trouvé</span>
              </div>
            </div>
          ) : (
            utilisateursFiltres.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.nom}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setShowActionMenu(
                        showActionMenu === user.id ? null : user.id,
                      )
                    }
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Rôle</span>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                {showActionMenu === user.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      Modifier
                    </button>
                    <button
                      onClick={() => handleSupprimer(user.id, user.nom)}
                      className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                {userEdit ? "Modifier le serveur" : "Ajouter un serveur"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className="w-full border border-outline-variant/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-outline-variant/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="serveur@petitebouffe.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  {userEdit
                    ? "Nouveau mot de passe (optionnel)"
                    : "Mot de passe"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full border border-outline-variant/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Les serveurs ont uniquement accès à la prise de commande.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={userEdit ? handleModifier : handleAjouter}
                className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary/90 transition"
              >
                {userEdit ? "Modifier" : "Ajouter"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
