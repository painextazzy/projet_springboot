// src/public/Accueil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Accueil() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (user && role && token) {
      if (role === "SERVEUR") {
        window.location.href = "/serveur";
      } else if (role === "MANAGER" || role === "ADMIN") {
        window.location.href = "/manager";
      }
    }
    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login({ email, password });

      if (response && response.role) {
        localStorage.setItem("user", JSON.stringify(response));
        localStorage.setItem("role", response.role);
        localStorage.setItem("token", response.token || "dummy-token");
        localStorage.setItem("lastLogin", new Date().toISOString());

        if (response.role === "SERVEUR") {
          window.location.href = "/serveur";
        } else if (response.role === "MANAGER" || response.role === "ADMIN") {
          window.location.href = "/manager";
        } else {
          setError("Rôle non reconnu");
        }
      } else {
        setError("Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error("Erreur login:", err);
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/reset-password");
  };

  return (
    <div className="antialiased">
      {/* Main Container avec gradient background */}
      <main className="gradient-bg min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Login Card */}
          <div
            className="login-card w-full bg-white rounded-[2rem] p-8 sm:p-12"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {/* Header Text */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bon retour !
              </h1>
              <p className="text-gray-400 text-sm">
                Vous nous avez manqué ! Veuillez entrer vos coordonnées.
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  className="block text-xs font-semibold text-gray-900 mb-1.5"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    mail
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre e-mail"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  className="block text-xs font-semibold text-gray-900 mb-1.5"
                  htmlFor="password"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    lock
                  </span>
                  <input
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  {/* Toggle Password Visibility */}
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Links Section */}
              <div className="flex items-center justify-end">
                <a
                  href="/reset-password"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-indigo-500 hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}