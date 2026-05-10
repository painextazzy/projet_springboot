import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Accueil from "./public/Accueil";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ServeurDashboard from "./pages/serveur/ServeurDashboard";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from './pages/NewPassword';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const user = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    console.log("🔍 Vérification auth:", {
      user: !!user,
      role: storedRole,
      token: !!token,
    });

    setIsAuthenticated(!!user && !!storedRole && !!token);
    setRole(storedRole);
    setIsLoading(false);
  }, []);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route racine - Redirige si déjà connecté */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            role === "SERVEUR" ? (
              <Navigate to="/serveur" replace />
            ) : role === "MANAGER" || role === "ADMIN" ? (
              <Navigate to="/manager" replace />
            ) : (
              <Accueil />
            )
          ) : (
            <Accueil />
          )
        }
      />

      {/* Route Serveur */}
      <Route
        path="/serveur/*"
        element={
          isAuthenticated && role === "SERVEUR" ? (
            <ServeurDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Route Manager */}
      <Route
        path="/manager/*"
        element={
          isAuthenticated && (role === "MANAGER" || role === "ADMIN") ? (
            <ManagerDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<NewPassword />} />
      
         
      {/* Page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
