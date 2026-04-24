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
import ProfileModal from "../../components/manager/ProfileModal";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Fermer le sidebar sur mobile uniquement
      if (
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Fermer le sidebar quand la fenêtre passe en mode desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

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

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ========== SIDEBAR (fixe sans scroll) ========== */}
      {/* Version desktop : toujours visible, fixe */}
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Version mobile : sidebar coulissant */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out md:hidden
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
      </div>

      {/* Overlay pour mobile quand sidebar est ouvert */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-35 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========== CONTENU PRINCIPAL ========== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ========== NAVBAR ========== */}
        <nav className="sticky top-0 z-30 bg-surface-container-low backdrop-blur-md border-b border-outline-variant/10">
          <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full">
            {/* Bouton Hamburger (visible seulement sur mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-secondary hover:bg-surface-container-high transition-colors"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Logo / Titre mobile */}
            <div className="md:hidden">
              <h1 className="text-lg font-bold text-primary">Petite Bouffe</h1>
            </div>

            {/* Espace vide pour équilibrer sur mobile */}
            <div className="md:hidden w-10"></div>

            {/* Dropdown utilisateur à droite */}
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">
                  account_circle
                </span>
                <span className="text-sm font-medium text-on-surface hidden sm:inline-block">
                  {user.nom || "Manager"}
                </span>
                <span className="material-symbols-outlined text-base">
                  {isDropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
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
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-lg">
                        settings
                      </span>
                      paramètres
                    </button>
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

        {/* ========== CONTENU ========== */}
        <main className="flex-1 p-4 md:p-6">
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

      {/* Modal de modification du profil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={(updatedUser) => {
          // Mettre à jour les données utilisateur dans le state
          window.location.reload();
        }}
      />
    </div>
  );
}
