// src/components/serveur/ServeurDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import POSModal from "../../components/serveur/POSModal";

export default function ServeurDashboard() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showPOS, setShowPOS] = useState(false);
  const [filtre, setFiltre] = useState("TOUTES");
  const [recherche, setRecherche] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Stocker les commandes en cours par table ID
  const [commandesEnCours, setCommandesEnCours] = useState(() => {
    const saved = localStorage.getItem("commandesEnCours");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erreur parsing localStorage:", e);
        return {};
      }
    }
    return {};
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sauvegarder dans localStorage à chaque modification des commandes
  useEffect(() => {
    localStorage.setItem("commandesEnCours", JSON.stringify(commandesEnCours));
  }, [commandesEnCours]);

  // Sauvegarder avant que la page ne se ferme
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem(
        "commandesEnCours",
        JSON.stringify(commandesEnCours),
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [commandesEnCours]);

  // Charger les tables au démarrage
  useEffect(() => {
    chargerTables();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const chargerTables = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getTables();
      if (Array.isArray(data)) {
        setTables(data);
      } else {
        setTables([]);
        setError("Format de données invalide");
      }
    } catch (error) {
      console.error("Erreur chargement tables:", error);
      setError("Impossible de charger les tables");
      showNotification("Erreur de chargement des tables", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    const hasCommande = commandesEnCours[table.id]?.length > 0;
    const statutUpper = (table.status || "").toUpperCase();

    if (
      !hasCommande &&
      statutUpper !== "LIBRE" &&
      statutUpper !== "A_NETTOYER"
    ) {
      showNotification(
        `Table ${table.nom || table.numero} n'est pas disponible`,
        "error",
      );
      return;
    }
    setSelectedTable(table);
    setShowPOS(true);
  };

  const handleCommandeValidee = (commande, tableId) => {
    console.log("📝 handleCommandeValidee reçu - tableId:", tableId);

    // Mettre à jour le statut de la table en LIBRE
    setTables((prevTables) =>
      prevTables.map((t) => (t.id === tableId ? { ...t, status: "LIBRE" } : t)),
    );

    // Supprimer la commande en cours de la mémoire
    setCommandesEnCours((prev) => {
      const newCommandes = { ...prev };
      delete newCommandes[tableId];
      return newCommandes;
    });

    showNotification(
      `Commande #${commande.id} enregistrée, table libérée`,
      "success",
    );
  };

  const handleUpdatePanier = (tableId, panier) => {
    setCommandesEnCours((prev) => ({
      ...prev,
      [tableId]: panier,
    }));
  };

  const handleClosePOS = () => {
    setShowPOS(false);
    setSelectedTable(null);
  };

  const getPanierForTable = (tableId) => {
    return commandesEnCours[tableId] || [];
  };

  const getTableStatus = (table) => {
    const hasCommande = commandesEnCours[table.id]?.length > 0;
    if (hasCommande) return "COMMANDE_EN_COURS";
    return (table.status || "").toUpperCase();
  };

  const getStatutClass = (status) => {
    switch (status) {
      case "LIBRE":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Disponible",
          btnBg: "bg-[#10b981]",
          iconBg: "bg-surface-container-high",
          iconColor: "text-primary",
        };
      case "OCCUPEE":
        return {
          bg: "bg-secondary-container",
          text: "text-on-secondary-container",
          label: "Occupée",
          btnBg: "bg-[#004A99]",
          iconBg: "bg-primary-container",
          iconColor: "text-on-primary",
        };
      case "A_NETTOYER":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          label: "À nettoyer",
          btnBg: "bg-[#10b981]",
          iconBg: "bg-surface-container-high",
          iconColor: "text-primary",
        };
      case "COMMANDE_EN_COURS":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: "Commande en cours",
          btnBg: "bg-orange-500",
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          label: status || "Inconnu",
          btnBg: "bg-gray-400",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-500",
        };
    }
  };

  const tablesFiltrees = tables.filter((table) => {
    if (!table) return false;
    const statutUpper = getTableStatus(table);
    if (filtre === "DISPONIBLES" && statutUpper !== "LIBRE") return false;
    if (
      filtre === "OCCUPEES" &&
      statutUpper !== "OCCUPEE" &&
      statutUpper !== "COMMANDE_EN_COURS"
    )
      return false;
    if (filtre === "A_NETTOYER" && statutUpper !== "A_NETTOYER") return false;
    if (recherche) {
      const searchLower = recherche.toLowerCase();
      const nomMatch = (table.nom || "").toLowerCase().includes(searchLower);
      const capaciteMatch = table.capacite?.toString().includes(searchLower);
      if (!nomMatch && !capaciteMatch) return false;
    }
    return true;
  });

  const countByStatus = (status) => {
    return tables.filter((t) => {
      const tableStatus = getTableStatus(t);
      if (status === "OCCUPEES") {
        return tableStatus === "OCCUPEE" || tableStatus === "COMMANDE_EN_COURS";
      }
      return tableStatus === status;
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-secondary">Chargement des tables...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ========== NAVBAR AVEC DROPDOWN ========== */}
      <nav className="fixed top-0 right-0 left-0 h-20 bg-surface-container-low backdrop-blur-md z-30 border-b border-outline-variant/10">
        <div className="flex justify-end items-center px-8 w-full h-full">
          {/* Dropdown avec icône, nom et flèche */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                account_circle
              </span>
              <span className="text-sm font-medium text-on-surface">
                {user.nom || "Serveur"}
              </span>
              <span className="material-symbols-outlined text-base">
                {isDropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                {/* En-tête avec infos utilisateur */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-lg">
                        person
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {user.nom || "Serveur"}
                      </p>
                      <p className="text-xs text-secondary">
                        {user.email || "serveur@petitebouffe.com"}
                      </p>
                      <p className="text-xs text-primary capitalize mt-0.5">
                        {user.role || "serveur"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option Déconnexion */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/20 transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-error text-lg">
                      logout
                    </span>
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ========== CONTENU PRINCIPAL ========== */}
      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">
              Aperçu des Tables
            </h1>
            <p className="text-secondary font-body">
              Gérez le plan de salle et la disponibilité en temps réel.
            </p>
          </div>
        </div>

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

        {/* Filter Tabs + Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl w-fit shrink-0">
            <button
              onClick={() => setFiltre("TOUTES")}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                filtre === "TOUTES"
                  ? "bg-surface-container-lowest shadow-sm text-primary"
                  : "text-secondary hover:bg-surface-container-high"
              }`}
            >
              Toutes les Tables ({tables.length})
            </button>
            <button
              onClick={() => setFiltre("DISPONIBLES")}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                filtre === "DISPONIBLES"
                  ? "bg-surface-container-lowest shadow-sm text-primary"
                  : "text-secondary hover:bg-surface-container-high"
              }`}
            >
              Disponibles ({countByStatus("LIBRE")})
            </button>
            <button
              onClick={() => setFiltre("OCCUPEES")}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                filtre === "OCCUPEES"
                  ? "bg-surface-container-lowest shadow-sm text-primary"
                  : "text-secondary hover:bg-surface-container-high"
              }`}
            >
              Occupées ({countByStatus("OCCUPEES")})
            </button>
            <button
              onClick={() => setFiltre("A_NETTOYER")}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                filtre === "A_NETTOYER"
                  ? "bg-surface-container-lowest shadow-sm text-primary"
                  : "text-secondary hover:bg-surface-container-high"
              }`}
            >
              À nettoyer ({countByStatus("A_NETTOYER")})
            </button>
          </div>

          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-sm outline-none"
              placeholder="Rechercher une table ou une capacité..."
            />
          </div>
        </div>

        {/* Tables Grid */}
        {tablesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Aucune table trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tablesFiltrees.map((table) => {
              const tableStatus = getTableStatus(table);
              const statusInfo = getStatutClass(tableStatus);
              const hasCommande = tableStatus === "COMMANDE_EN_COURS";
              const panierTable = getPanierForTable(table.id);

              return (
                <div
                  key={table.id}
                  className="group bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 hover:shadow-[0px_20px_40px_rgba(25,28,30,0.06)] transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-12 h-12 rounded-lg ${statusInfo.iconBg} flex items-center justify-center ${statusInfo.iconColor}`}
                    >
                      <span
                        className="material-symbols-outlined"
                        data-weight={!hasCommande ? "regular" : "fill"}
                      >
                        table_restaurant
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-on-surface mb-1">
                    {table.nom || `Table ${table.numero}`}
                  </h3>
                  <p className="text-sm text-secondary mb-6 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      groups
                    </span>
                    {table.capacite} {table.capacite === 1 ? "Siège" : "Sièges"}
                  </p>

                  {tableStatus === "LIBRE" ||
                  tableStatus === "A_NETTOYER" ||
                  hasCommande ? (
                    <button
                      onClick={() => handleTableClick(table)}
                      className={`w-full py-3 px-4 ${statusInfo.btnBg} text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all`}
                    >
                      {tableStatus === "A_NETTOYER"
                        ? "Nettoyer la table"
                        : hasCommande
                          ? "Reprendre la commande"
                          : "Prendre commande"}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTableClick(table)}
                      className="w-full py-3 px-4 bg-[#004A99] text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      Gérer la Commande
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center mt-16 pt-10 border-t border-outline-variant/20">
          <div className="text-slate-400 font-inter text-xs tracking-tight mb-4 md:mb-0">
            © 2024 Petite Bouffe. Tous droits réservés.
          </div>
          <div className="flex items-center gap-8">
            <a
              href="#"
              className="text-slate-400 hover:text-blue-600 font-inter text-xs tracking-tight"
            >
              Support
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-blue-600 font-inter text-xs tracking-tight"
            >
              Politique de Confidentialité
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-blue-600 font-inter text-xs tracking-tight"
            >
              Conditions d'Utilisation
            </a>
          </div>
        </footer>
      </main>

      {/* Modal POS */}
      {showPOS && selectedTable && (
        <POSModal
          table={selectedTable}
          initialPanier={getPanierForTable(selectedTable.id)}
          onUpdatePanier={(panier) =>
            handleUpdatePanier(selectedTable.id, panier)
          }
          onClose={handleClosePOS}
          onCommandeValidee={handleCommandeValidee}
        />
      )}
    </div>
  );
}
