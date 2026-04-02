import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Accueil from "./public/Accueil";
import LoginModal from "./components/auth/LoginModal";

import ManagerDashboard from "./pages/manager/ManagerDashboard"; // ← IMPORT
import ServeurDashboard from "./pages/serveur/ServeurDashboard";
function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleStartClick = () => {
    setIsLoginModalOpen(true);
  };

  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  return (
    <>
      <Routes>
        {/* Page d'accueil */}
        <Route
          path="/"
          element={
            <Accueil
              onLoginClick={handleLoginClick}
              onStartClick={handleStartClick}
            />
          }
        />

        {/* Route Serveur */}
        <Route
          path="/serveur/*"
          element={
            user && role === "SERVEUR" ? (
              <ServeurDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Route Manager */}
        <Route
          path="/manager/*"
          element={
            user && role === "MANAGER" ? (
              <ManagerDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default App;
