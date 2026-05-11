import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import logoBar from "../../assets/logoBar.png"; // ou logoBar.svg

export default function Sidebar({ onLinkClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [nbEpuises, setNbEpuises] = useState(0);
  const [nbCommandesEnCours, setNbCommandesEnCours] = useState(0);

  useEffect(() => {
    const verifierPlats = async () => {
      try {
        const plats = await api.getMenu();
        const count = plats.filter(
          (p) => p.quantite === 0 && p.disponible,
        ).length;
        setNbEpuises(count);
      } catch (error) {
        console.error("Erreur plats:", error);
      }
    };

    const verifierCommandesEnCours = async () => {
      try {
        const commandes = await api.getCommandes();
        const count = commandes.filter(
          (cmd) => cmd.statut === "EN_COURS",
        ).length;
        setNbCommandesEnCours(count);
      } catch (error) {
        console.error("Erreur commandes:", error);
      }
    };

    verifierPlats();
    verifierCommandesEnCours();

    const interval = setInterval(() => {
      verifierPlats();
      verifierCommandesEnCours();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      path: "/manager",
    },
    {
      id: "tables",
      label: "Tables",
      icon: "restaurant_menu",
      path: "/manager/tables",
    },
    {
      id: "commandes",
      label: "Commandes",
      icon: "receipt_long",
      path: "/manager/commandes",
    },
    { id: "menu", label: "Menu", icon: "menu_book", path: "/manager/menu" },
    {
      id: "utilisateurs",
      label: "Utilisateurs",
      icon: "group",
      path: "/manager/utilisateurs",
    },
    {
      id: "sauvegarde",
      label: "Sauvegarde",
      icon: "backup",
      path: "/manager/sauvegarde",
    },
  ];

  const isActive = (path) => {
    if (path === "/manager" && location.pathname === "/manager") return true;
    if (path === "/manager" && location.pathname === "/manager/") return true;
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <aside className="h-full w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="mb-10 px-2 pt-6">
        <div className="flex items-center gap-3">
          {/* Logo sidebar - logoBar */}
          <img 
            src={logoBar} 
            alt="Logo Petite Bouffe" 
            className="w-8 h-10 object-contain rounded-lg"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h1 className="font-headline text-lg font-extrabold text-on-surface">
              Petite Bouffe
            </h1>
            <p className="font-body text-xs tracking-wide text-secondary uppercase mt-1">
              Restaurant Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative
              ${
                isActive(item.path)
                  ? "bg-surface-container-high text-on-surface border-l-4 border-primary"
                  : "text-secondary hover:bg-surface-container-high"
              }
            `}
          >
            <span className="material-symbols-outlined text-xl">
              {item.icon}
            </span>
            <span
              className={`font-body text-sm tracking-wide ${isActive(item.path) ? "font-medium" : ""}`}
            >
              {item.label}
            </span>

            {item.id === "menu" && nbEpuises > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                {nbEpuises > 99 ? "99+" : nbEpuises}
              </span>
            )}

            {item.id === "commandes" && nbCommandesEnCours > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                {nbCommandesEnCours > 99 ? "99+" : nbCommandesEnCours}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Version */}
      <div className="mt-auto pt-4 pb-6 px-2">
        <div className="px-4 py-2 border-t border-outline-variant/30">
          <p className="text-xs text-secondary">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}