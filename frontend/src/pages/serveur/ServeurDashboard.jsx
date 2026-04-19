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
  const [refreshingTables, setRefreshingTables] = useState(false);
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

  const [commandesEnCours, setCommandesEnCours] = useState(() => {
    const saved = localStorage.getItem("commandesEnCours");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("commandesEnCours", JSON.stringify(commandesEnCours));
  }, [commandesEnCours]);

  useEffect(() => {
    chargerTables(true);
    webSocketService.connect();

    const unsubscribe = webSocketService.subscribe((data) => {
      console.log("🔄 WebSocket reçu:", data);

      let parsed = data;
      if (typeof data === "string") {
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
      }

      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.tableId &&
        parsed.status
      ) {
        setTables((prev) =>
          prev.map((table) =>
            table.id === parsed.tableId
              ? { ...table, status: parsed.status }
              : table,
          ),
        );
        return;
      }

      if (
        parsed === "TABLE_UPDATED" ||
        parsed === "REFRESH" ||
        (parsed && parsed.action === "TABLE_UPDATED")
      ) {
        chargerTables(false);
      }
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  // ⭐ NOUVEAU: Nettoyer les commandes orphelines quand les tables sont chargées
  useEffect(() => {
    if (tables.length > 0 && Object.keys(commandesEnCours).length > 0) {
      let hasChanges = false;
      const updatedCommandes = { ...commandesEnCours };
      
      Object.keys(updatedCommandes).forEach(tableId => {
        const table = tables.find(t => t.id === parseInt(tableId));
        // Supprimer si table inexistante ou déjà libre/à nettoyer
        if (!table || table.status === "LIBRE" || table.status === "A_NETTOYER") {
          delete updatedCommandes[tableId];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setCommandesEnCours(updatedCommandes);
        localStorage.setItem("commandesEnCours", JSON.stringify(updatedCommandes));
      }
    }
  }, [tables]);

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

  const chargerTables = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshingTables(true);
      }
      const data = await api.getTables();
      if (Array.isArray(data)) {
        setTables(data);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error("Erreur chargement tables:", error);
      setError("Impossible de charger les tables");
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshingTables(false);
      }
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

  // ⭐ MODIFIÉ: Priorité au statut backend pour LIBRE et A_NETTOYER
  const getTableStatus = (table) => {
    const backendStatus = (table.status || "").toUpperCase();
    
    // Si la table est LIBRE ou A_NETTOYER, ignorer le localStorage
    if (backendStatus === "LIBRE" || backendStatus === "A_NETTOYER") {
      // Nettoyage silencieux du localStorage si nécessaire
      if (commandesEnCours[table.id]?.length > 0) {
        setTimeout(() => {
          setCommandesEnCours(prev => {
            const newCommandes = { ...prev };
            delete newCommandes[table.id];
            localStorage.setItem("commandesEnCours", JSON.stringify(newCommandes));
            return newCommandes;
          });
        }, 0);
      }
      return backendStatus;
    }
    
    // Pour OCCUPEE, vérifier si commande en cours
    const hasCommande = commandesEnCours[table.id]?.length > 0;
    if (hasCommande) return "COMMANDE_EN_COURS";
    
    return backendStatus;
  };

  const handleCommandeValidee = (commande, tableId) => {
    // Mise à jour locale immédiate
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: "LIBRE" } : t)),
    );
    
    // Supprimer la table du localStorage
    setCommandesEnCours((prev) => {
      const newCommandes = { ...prev };
      delete newCommandes[tableId];
      localStorage.setItem("commandesEnCours", JSON.stringify(newCommandes));
      return newCommandes;
    });
    
    // Forcer le rechargement des tables
    setTimeout(() => chargerTables(false), 100);
    showNotification(
      `Commande #${commande.id} enregistrée, table libérée`,
      "success",
    );
  };

  const handleUpdatePanier = (tableId, panier) => {
    setCommandesEnCours((prev) => {
      const updated = { ...prev };
      if (!panier || panier.length === 0) {
        delete updated[tableId];
      } else {
        updated[tableId] = panier;
      }
      localStorage.setItem("commandesEnCours", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClosePOS = () => {
    setShowPOS(false);
    setSelectedTable(null);
  };

  const getPanierForTable = (tableId) => commandesEnCours[tableId] || [];

  const getStatutClass = (status) => {
    const classes = {
      LIBRE: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        label: "Disponible",
        btnBg: "bg-emerald-500",
        icon: "table_bar",
        btnText: "Prendre commande",
      },
      OCCUPEE: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        label: "Occupée",
        btnBg: "bg-blue-600",
        icon: "table_restaurant",
        btnText: "Gérer la commande",
      },
      A_NETTOYER: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        label: "À nettoyer",
        btnBg: "bg-emerald-500",
        icon: "cleaning",
        btnText: "Nettoyer la table",
      },
      COMMANDE_EN_COURS: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        label: "Commande en cours",
        btnBg: "bg-orange-500",
        icon: "receipt",
        btnText: "Reprendre la commande",
      },
    };
    return (
      classes[status] || {
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: status || "Inconnu",
        btnBg: "bg-gray-500",
        icon: "table_restaurant",
        btnText: "Voir",
      }
    );
  };

  const handleNettoyerTable = async (tableId, event) => {
    event.stopPropagation();
    
    try {
      await api.updateTableStatus(tableId, "LIBRE");
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status: "LIBRE" } : t
        )
      );
      showNotification(`Table nettoyée et disponible`, "success");
      
      // Vider les commandes en cours associées
      setCommandesEnCours((prev) => {
        const newCommandes = { ...prev };
        delete newCommandes[tableId];
        localStorage.setItem("commandesEnCours", JSON.stringify(newCommandes));
        return newCommandes;
      });
    } catch (error) {
      console.error("Erreur nettoyage:", error);
      showNotification("Erreur lors du nettoyage", "error");
    }
  };

  const getTableActions = (table, statusInfo) => {
    const tableStatus = getTableStatus(table);
    
    if (tableStatus === "A_NETTOYER") {
      return (
        <button
          onClick={(e) => handleNettoyerTable(table.id, e)}
          className={`w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]`}
        >
          <span className="material-symbols-outlined text-sm">cleaning</span>
          Nettoyer & Libérer
        </button>
      );
    }
    
    return (
      <button
        onClick={() => handleTableClick(table)}
        className={`w-full py-4 ${statusInfo.btnBg} text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]`}
      >
        {statusInfo.btnText}
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    );
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
    if (
      recherche &&
      !table.nom?.toLowerCase().includes(recherche.toLowerCase())
    )
      return false;
    return true;
  });

  const countByStatus = (status) =>
    tables.filter((t) => {
      const tableStatus = getTableStatus(t);
      if (status === "OCCUPEES")
        return tableStatus === "OCCUPEE" || tableStatus === "COMMANDE_EN_COURS";
      return tableStatus === status;
    }).length;

  if (loading) return <SkeletonServeurDashboard />;

  return (
    <div className="min-h-screen bg-surface">
      {/* Indicateur WebSocket */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white/80 rounded-full px-3 py-1 shadow-md">
        <div
          className={`w-2 h-2 rounded-full ${webSocketService.isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
        ></div>
        <span className="text-xs text-gray-500">
          {webSocketService.isConnected ? "Temps réel actif" : "Reconnexion..."}
        </span>
      </div>

      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 right-0 left-0 h-20 bg-surface-container-low backdrop-blur-md z-30 border-b border-outline-variant/10">
        <div className="flex justify-end items-center px-8 w-full h-full gap-4">
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
                    </span>{" "}
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
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">
            Aperçu des Tables
          </h1>
          <p className="text-secondary font-medium">
            Gérez le plan de salle et la disponibilité en temps réel.
          </p>
        </div>

        {notification.show && (
          <div
            className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${notification.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
          >
            {notification.message}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center p-1 bg-slate-100/50 rounded-2xl w-fit">
            <button
              onClick={() => setFiltre("TOUTES")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${filtre === "TOUTES" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}
            >
              Toutes ({tables.length})
            </button>
            <button
              onClick={() => setFiltre("DISPONIBLES")}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${filtre === "DISPONIBLES" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}
            >
              Disponibles ({countByStatus("LIBRE")})
            </button>
            <button
              onClick={() => setFiltre("OCCUPEES")}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${filtre === "OCCUPEES" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}
            >
              Occupées ({countByStatus("OCCUPEES")})
            </button>
            <button
              onClick={() => setFiltre("A_NETTOYER")}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${filtre === "A_NETTOYER" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}
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

        {tablesFiltrees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Aucune table trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tablesFiltrees.map((table) => {
              const statusInfo = getStatutClass(getTableStatus(table));
              return (
                <div
                  key={table.id}
                  className="bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-100 group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
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
                  {getTableActions(table, statusInfo)}
                </div>
              );
            })}
          </div>
        )}

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

      {showPOS && selectedTable && (
        <POSModal
          table={selectedTable}
          initialPanier={getPanierForTable(selectedTable.id)}
          onUpdatePanier={(tableId, panier) =>
            handleUpdatePanier(tableId, panier)
          }
          onClose={handleClosePOS}
          onCommandeValidee={handleCommandeValidee}
        />
      )}
    </div>
  );
}