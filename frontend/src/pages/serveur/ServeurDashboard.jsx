// src/components/serveur/ServeurDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import webSocketService from "../../services/websocketService";
import POSModal from "../../components/serveur/POSModal";
import SkeletonServeurDashboard from "./skeletons/SkeletonServeurDashboard";

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
  const [wsConnected, setWsConnected] = useState(false);

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

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem("commandesEnCours", JSON.stringify(commandesEnCours));
  }, [commandesEnCours]);

  // ✅ WebSocket pour les mises à jour en temps réel (tables ET commandes)
  useEffect(() => {
    webSocketService.connect();

    const unsubscribe = webSocketService.subscribe(() => {
      console.log("🔄 WebSocket: mise à jour des données");
      chargerTables();
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  // Charger les tables au démarrage
  useEffect(() => {
    chargerTables();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/";
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

    setTables((prevTables) =>
      prevTables.map((t) => (t.id === tableId ? { ...t, status: "LIBRE" } : t)),
    );

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
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          label: "Disponible",
          btnBg: "bg-emerald-500 hover:bg-emerald-600",
          btnText: "text-white",
          iconBg: "bg-slate-50",
          iconColor: "text-slate-400",
          icon: "table_bar",
          arrowColor: "text-white",
        };
      case "OCCUPEE":
        return {
          bg: "bg-blue-50",
          text: "text-blue-600",
          label: "Occupée",
          btnBg: "bg-blue-600 hover:bg-blue-700",
          btnText: "text-white",
          iconBg: "bg-blue-50",
          iconColor: "text-blue-500",
          icon: "table_restaurant",
          arrowColor: "text-white",
        };
      case "A_NETTOYER":
        return {
          bg: "bg-amber-50",
          text: "text-amber-600",
          label: "À nettoyer",
          btnBg: "bg-emerald-500 hover:bg-emerald-600",
          btnText: "text-white",
          iconBg: "bg-slate-50",
          iconColor: "text-slate-400",
          icon: "cleaning",
          arrowColor: "text-white",
        };
      case "COMMANDE_EN_COURS":
        return {
          bg: "bg-orange-50",
          text: "text-orange-600",
          label: "Commande en cours",
          btnBg: "bg-orange-500 hover:bg-orange-600",
          btnText: "text-white",
          iconBg: "bg-orange-50",
          iconColor: "text-orange-500",
          icon: "receipt",
          arrowColor: "text-white",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          label: status || "Inconnu",
          btnBg: "bg-gray-500 hover:bg-gray-600",
          btnText: "text-white",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-400",
          icon: "table_restaurant",
          arrowColor: "text-white",
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
    return <SkeletonServeurDashboard />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Indicateur WebSocket */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${webSocketService.client?.connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
        ></div>
        <span className="text-xs text-gray-400">
          {webSocketService.client?.connected
            ? "Temps réel actif"
            : "Reconnexion..."}
        </span>
      </div>

      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 right-0 left-0 h-20 bg-surface-container-low backdrop-blur-md z-30 border-b border-outline-variant/10">
        <div className="flex justify-end items-center px-8 w-full h-full">
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

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white">
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

      {/* ========== MAIN CONTENT ========== */}
      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">
            Aperçu des Tables
          </h1>
          <p className="text-secondary font-medium">
            Gérez le plan de salle et la disponibilité en temps réel.
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center p-1 bg-slate-100/50 rounded-2xl w-fit">
            <button
              onClick={() => setFiltre("TOUTES")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                filtre === "TOUTES"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Toutes les tables ({tables.length})
            </button>
            <button
              onClick={() => setFiltre("DISPONIBLES")}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                filtre === "DISPONIBLES"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Disponibles ({countByStatus("LIBRE")})
            </button>
            <button
              onClick={() => setFiltre("OCCUPEES")}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                filtre === "OCCUPEES"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Occupées ({countByStatus("OCCUPEES")})
            </button>
            <button
              onClick={() => setFiltre("A_NETTOYER")}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                filtre === "A_NETTOYER"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-primary"
              }`}
            >
              À nettoyer ({countByStatus("A_NETTOYER")})
            </button>
          </div>

          <div className="relative w-full lg:w-80 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all text-sm outline-none placeholder:text-slate-400"
              placeholder="Rechercher une table..."
            />
          </div>
        </div>

        {/* Tables Grid */}
        {tablesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Aucune table trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tablesFiltrees.map((table) => {
              const tableStatus = getTableStatus(table);
              const statusInfo = getStatutClass(tableStatus);
              const hasCommande = tableStatus === "COMMANDE_EN_COURS";
              const isOccupied = tableStatus === "OCCUPEE";
              const isAvailable = tableStatus === "LIBRE";
              const isToClean = tableStatus === "A_NETTOYER";

              return (
                <div
                  key={table.id}
                  className="bg-white p-8 rounded-[2rem] shadow-premium hover:shadow-premium-hover transition-all duration-500 border border-slate-100 group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div
                      className={`w-14 h-14 rounded-2xl ${statusInfo.iconBg} flex items-center justify-center ${statusInfo.iconColor}`}
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {statusInfo.icon}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-2xl font-extrabold text-on-surface mb-2">
                      {table.nom || `Table ${table.numero}`}
                    </h3>
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-lg">
                        groups
                      </span>
                      <span className="text-sm font-medium">
                        {table.capacite}{" "}
                        {table.capacite === 1 ? "Siège" : "Sièges"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTableClick(table)}
                    className={`w-full py-4 ${statusInfo.btnBg} ${statusInfo.btnText} rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]`}
                  >
                    {isToClean
                      ? "Nettoyer la table"
                      : hasCommande
                        ? "Reprendre la commande"
                        : isAvailable
                          ? "Prendre commande"
                          : isOccupied
                            ? "Gérer la commande"
                            : "Voir"}
                    <span
                      className={`material-symbols-outlined text-sm ${statusInfo.arrowColor}`}
                    >
                      arrow_forward
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center mt-16 pt-10 border-t border-slate-100">
          <div className="text-slate-400 font-medium text-xs tracking-wide mb-6 md:mb-0">
            © 2024 Petite Bouffe. Tous droits réservés.
          </div>
          <div className="flex items-center gap-10">
            <a
              href="#"
              className="text-slate-500 hover:text-primary font-medium text-xs tracking-wide transition-colors"
            >
              Support
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-primary font-medium text-xs tracking-wide transition-colors"
            >
              Confidentialité
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-primary font-medium text-xs tracking-wide transition-colors"
            >
              Conditions
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
