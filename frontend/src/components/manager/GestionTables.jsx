import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import SkeletonTables from "./skeletons/SkeletonTables"; // ✅ Import corrigé

export default function GestionTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtreActif, setFiltreActif] = useState("TOUTES");
  const [recherche, setRecherche] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tableEdit, setTableEdit] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    capacite: "",
    status: "libre",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    chargerTables();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const chargerTables = async () => {
    setLoading(true);
    try {
      setError("");
      const data = await api.getTables();
      console.log("Tables chargées:", data);
      setTables(data);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError("Impossible de charger les tables");
      showNotification("Erreur de chargement des tables", "error");
    } finally {
      setLoading(false);
    }
  };

  // Gestion des statuts (majuscules/minuscules)
  const getStatusInfo = (status) => {
    const statusLower = (status || "").toLowerCase();

    const statusMap = {
      libre: {
        label: "Libre",
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "flatware",
        iconColor: "text-green-500/40",
      },
      occupee: {
        label: "Occupée",
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "person",
        iconColor: "text-blue-500/40",
      },
      a_nettoyer: {
        label: "À nettoyer",
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: "auto_fix_high",
        iconColor: "text-amber-500/40",
      },
    };

    return (
      statusMap[statusLower] || {
        label: status || "Inconnu",
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: "table_restaurant",
        iconColor: "text-gray-500/40",
      }
    );
  };

  // Filtrer les tables
  const tablesFiltrees = tables.filter((table) => {
    if (filtreActif !== "TOUTES") {
      const statusLower = (table.status || "").toLowerCase();
      const statusFilter = {
        LIBRES: "libre",
        OCCUPEES: "occupee",
        A_NETTOYER: "a_nettoyer",
      }[filtreActif];
      if (statusFilter && statusLower !== statusFilter) return false;
    }
    if (recherche && !table.nom.toLowerCase().includes(recherche.toLowerCase()))
      return false;
    return true;
  });

  const handleAjouter = async () => {
    if (!formData.nom || !formData.capacite) {
      showNotification("Veuillez remplir tous les champs", "error");
      return;
    }

    try {
      const nouvelleTable = {
        nom: formData.nom,
        capacite: parseInt(formData.capacite),
        status: formData.status,
      };
      const response = await api.createTable(nouvelleTable);
      setTables([...tables, response]);
      setShowModal(false);
      resetForm();
      showNotification("Table ajoutée avec succès", "success");
    } catch (error) {
      console.error("Erreur ajout:", error);
      showNotification("Erreur lors de l'ajout", "error");
    }
  };

  const handleModifier = async () => {
    if (!formData.nom || !formData.capacite) {
      showNotification("Veuillez remplir tous les champs", "error");
      return;
    }

    try {
      const tableModifiee = {
        nom: formData.nom,
        capacite: parseInt(formData.capacite),
        status: formData.status,
      };
      const response = await api.updateTable(tableEdit.id, tableModifiee);
      setTables(tables.map((t) => (t.id === tableEdit.id ? response : t)));
      setShowModal(false);
      setTableEdit(null);
      resetForm();
      showNotification("Table modifiée avec succès", "success");
    } catch (error) {
      console.error("Erreur modification:", error);
      showNotification("Erreur lors de la modification", "error");
    }
  };

  const handleSupprimer = async (id, nom) => {
    if (confirm(`Supprimer la table "${nom}" ?`)) {
      try {
        await api.deleteTable(id);
        setTables(tables.filter((t) => t.id !== id));
        setShowActionMenu(null);
        showNotification("Table supprimée avec succès", "success");
      } catch (error) {
        console.error("Erreur suppression:", error);
        showNotification("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleChangerStatus = async (id, nouveauStatus) => {
    try {
      const statusToSend = nouveauStatus.toLowerCase();
      const response = await api.updateTableStatus(id, statusToSend);
      setTables(tables.map((t) => (t.id === id ? response : t)));
      showNotification("Statut modifié avec succès", "success");
    } catch (error) {
      console.error("Erreur changement status:", error);
      showNotification("Erreur lors du changement de statut", "error");
    }
  };

  const openEditModal = (table) => {
    setTableEdit(table);
    setFormData({
      nom: table.nom,
      capacite: table.capacite,
      status: table.status,
    });
    setShowModal(true);
    setShowActionMenu(null);
  };

  const openAddModal = () => {
    setTableEdit(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      capacite: "",
      status: "libre",
    });
  };

  // ✅ Afficher le skeleton pendant le chargement
  if (loading) {
    return <SkeletonTables />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={chargerTables}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-24 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Content Canvas */}
      <div className="p-8 max-w-[1600px] mx-auto w-full">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
              Gestion des Tables
            </h2>
            <p className="text-secondary mt-1">
              Configurez et supervisez la disposition de votre restaurant.
            </p>
          </div>
        </div>

        {/* Filters and Search bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl">
            {[
              { id: "TOUTES", label: "Toutes" },
              { id: "LIBRES", label: "Libres" },
              { id: "OCCUPEES", label: "Occupées" },
              { id: "A_NETTOYER", label: "À nettoyer" },
            ].map((filtre) => (
              <button
                key={filtre.id}
                onClick={() => setFiltreActif(filtre.id)}
                className={`px-5 py-2 rounded-xl transition-all text-sm ${
                  filtreActif === filtre.id
                    ? "bg-surface-container-lowest shadow-sm text-primary font-semibold"
                    : "text-secondary hover:bg-surface-container-high font-medium"
                }`}
              >
                {filtre.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Rechercher une table..."
            />
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {/* Carte "Ajouter une table" */}
          <button
            onClick={openAddModal}
            className="bg-surface-container-lowest p-6 rounded-3xl border-2 border-dashed border-outline-variant/30 shadow-sm hover:border-primary/50 hover:bg-surface-container-low transition-all group flex flex-col items-center justify-center min-h-[280px] text-secondary hover:text-primary"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-5xl">
                add_circle
              </span>
              <span className="font-headline font-bold text-sm">
                Ajouter une table
              </span>
            </div>
          </button>

          {/* Cartes des tables existantes */}
          {tablesFiltrees.map((table) => {
            const statusInfo = getStatusInfo(table.status);
            return (
              <div
                key={table.id}
                className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group flex flex-col min-h-[280px] relative"
              >
                {/* En-tête */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    {table.nom}
                  </h3>
                  <span
                    className={`px-3 py-1 ${statusInfo.bg} ${statusInfo.text} text-[10px] font-bold rounded-full uppercase tracking-wider`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Capacité */}
                <div className="flex items-center gap-2 text-secondary mb-4">
                  <span className="material-symbols-outlined text-sm">
                    groups
                  </span>
                  <span className="text-xs font-medium">
                    {table.capacite} personnes
                  </span>
                </div>

                {/* Icône centrale */}
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <span
                    className={`material-symbols-outlined text-7xl ${statusInfo.iconColor}`}
                  >
                    {statusInfo.icon}
                  </span>
                </div>

                {/* Bouton settings avec menu */}
                <div className="flex justify-end pt-4 relative">
                  <button
                    onClick={() =>
                      setShowActionMenu(
                        showActionMenu === table.id ? null : table.id,
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-secondary hover:bg-surface-container-high transition-all"
                  >
                    <span className="material-symbols-outlined">settings</span>
                  </button>

                  {/* Menu déroulant */}
                  {showActionMenu === table.id && (
                    <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-lg border border-outline-variant/10 overflow-hidden z-10 min-w-[140px]">
                      <button
                        onClick={() => openEditModal(table)}
                        className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleChangerStatus(table.id, "libre")}
                        className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition"
                      >
                        <span className="material-symbols-outlined text-lg">
                          check_circle
                        </span>
                        Marquer libre
                      </button>
                      <button
                        onClick={() => handleChangerStatus(table.id, "occupee")}
                        className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition"
                      >
                        <span className="material-symbols-outlined text-lg">
                          person
                        </span>
                        Marquer occupée
                      </button>
                      <button
                        onClick={() =>
                          handleChangerStatus(table.id, "a_nettoyer")
                        }
                        className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition"
                      >
                        <span className="material-symbols-outlined text-lg">
                          cleaning
                        </span>
                        À nettoyer
                      </button>
                      <button
                        onClick={() => handleSupprimer(table.id, table.nom)}
                        className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/5 flex items-center gap-2 transition border-t border-outline-variant/10"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                        Supprimer
                      </button>
                      <button
                        onClick={() => setShowActionMenu(null)}
                        className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition border-t border-outline-variant/10"
                      >
                        <span className="material-symbols-outlined text-lg">
                          close
                        </span>
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tablesFiltrees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary">Aucune table trouvée</p>
          </div>
        )}
      </div>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-on-surface">
                {tableEdit ? "Modifier la table" : "Ajouter une table"}
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
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className="w-full border border-outline-variant/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Table 21"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Capacité
                </label>
                <input
                  type="number"
                  value={formData.capacite}
                  onChange={(e) =>
                    setFormData({ ...formData, capacite: e.target.value })
                  }
                  className="w-full border border-outline-variant/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Nombre de personnes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-outline-variant/30 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="libre">Libre</option>
                  <option value="occupee">Occupée</option>
                  <option value="a_nettoyer">À nettoyer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={tableEdit ? handleModifier : handleAjouter}
                className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary/90 transition"
              >
                {tableEdit ? "Modifier" : "Ajouter"}
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

      {/* Visual Anchor */}
      <div className="fixed bottom-8 right-8 pointer-events-none opacity-20">
        <div className="w-48 h-48 bg-primary rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
