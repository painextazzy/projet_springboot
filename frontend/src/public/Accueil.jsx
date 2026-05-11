// src/public/Accueil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AOS from "aos";
import "aos/dist/aos.css";
import bgFormImage from "../assets/logo.jpg"; // Votre image pour le fond du formulaire

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004A99]"></div>
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
    <div className="font-body text-on-surface antialiased">
      <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Background Image - Image de nourriture en ligne */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Gourmet dining experience"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPEMvKaEeN8EtX7IXKETCxG-J0ItUqefskNAVt231qCMBZlAOfVuZW3NhmF73CaoBRa_V3Sve00CvrOe2VJU7kAk_v4WoHOtbPiwEIDLbYpsO8_KOjAXvdY_a9VbrNcBAW0vkK7By-VT_l7bapv8A3o8G5jAS_vf7rvcMqqGMnDNHhki8OYXLhs73Jgau3lAciFj7GRMQtXZJggMUfiaSps1-0t9RJYVJb06zLc3qUHPoSTvgfaIr6lURf9QB0qu3X8h0SwAd-VWw"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Login Card - Avec votre image en fond */}
        <div 
          className="relative z-10 w-full max-w-md"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <div className="relative rounded-3xl shadow-2xl p-8 md:p-10 overflow-hidden">
            {/* Votre image en fond du formulaire */}
            <div className="absolute inset-0 z-0">
              <img
                src={bgFormImage}
                alt="Form background"
                className="w-full h-full object-cover"
              />
              {/* Overlay pour rendre le texte lisible */}
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]"></div>
            </div>

            {/* Contenu du formulaire */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                {/* Icône décorative */}
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                  <span className="material-symbols-outlined text-4xl text-[#004A99]">
                    restaurant
                  </span>
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 text-center">
                  Bienvenue
                </h1>
                <p className="text-gray-700 text-base font-medium tracking-wide text-center">
                  Connectez-vous pour commencer
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50/90 backdrop-blur-sm text-red-600 px-4 py-3 rounded-2xl text-sm text-center border border-red-200">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                      <span className="material-symbols-outlined text-xl">
                        mail
                      </span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-6 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004A99] focus:border-[#004A99] focus:bg-white transition-all duration-300 outline-none"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-14 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#004A99] focus:border-[#004A99] focus:bg-white transition-all duration-300 outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#004A99] transition-colors cursor-pointer focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center text-sm px-2 justify-end">
                  <a
                    href="/reset-password"
                    onClick={handleForgotPassword}
                    className="text-[#004A99] font-semibold hover:underline underline-offset-2 transition-colors"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#004A99] text-white text-lg font-bold rounded-2xl tracking-wide hover:bg-[#003d7a] transition-all duration-300 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    "Connexion"
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-gray-600 text-xs mt-8">
                © 2024 Votre Application. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }
      `}</style>
    </div>
  );
}