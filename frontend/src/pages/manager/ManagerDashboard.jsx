import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/manager/Sidebar";
import DashboardHome from "../../components/manager/DashboardHome";
import GestionMenu from "../../components/manager/GestionMenu";
import GestionTables from "../../components/manager/GestionTables";
import GestionCommandes from "../../components/manager/GestionCommandes";
import Sauvegarde from "../../components/manager/Sauvegarde";
import GestionUtilisateurs from "../../components/manager/GestionUtilisateurs";
import NotFound from "../../pages/NotFound";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Récupérer les infos utilisateur depuis localStorage
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  // ✅ Liste des routes valides
  const validRoutes = [
    "/manager",
    "/manager/menu",
    "/manager/tables",
    "/manager/commandes",
    "/manager/utilisateurs",
    "/manager/sauvegarde",
  ];
  const isNotFound =
    !validRoutes.includes(location.pathname) && location.pathname !== "";

  // ✅ Si page 404, afficher en plein écran sans sidebar ni navbar
  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ========== SIDEBAR ========== */}
      <Sidebar />

      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 right-0 left-64 h-20 bg-surface-container-low backdrop-blur-md z-30">
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
                {user.nom || "Manager"}
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
                        {user.nom || "Manager"}
                      </p>
                      <p className="text-xs text-secondary">
                        {user.email || "manager@petitebouffe.com"}
                      </p>
                      <p className="text-xs text-primary capitalize mt-0.5">
                        {user.role || "manager"}
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
      <div className="ml-64 pt-20">
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/menu" element={<GestionMenu />} />
            <Route path="/tables" element={<GestionTables />} />
            <Route path="/commandes" element={<GestionCommandes />} />
            <Route path="/utilisateurs" element={<GestionUtilisateurs />} />
            <Route path="/sauvegarde" element={<Sauvegarde />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
