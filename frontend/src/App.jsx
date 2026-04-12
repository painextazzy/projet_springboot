import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Accueil from "./public/Accueil";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ServeurDashboard from "./pages/serveur/ServeurDashboard";
import NotFound from "./pages/NotFound";

function App() {
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");
  const isAuthenticated = !!user && !!role;

  return (
    <Routes>
      {/* Page d'accueil - maintenant avec formulaire de connexion intégré */}
      <Route path="/" element={<Accueil />} />

      {/* Route Serveur - Protection */}
      <Route
        path="/serveur"
        element={
          isAuthenticated && role === "SERVEUR" ? (
            <ServeurDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Route Manager - Protection */}
      <Route
        path="/manager/*"
        element={
          isAuthenticated && role === "MANAGER" ? (
            <ManagerDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Redirection pour les routes non trouvées */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
