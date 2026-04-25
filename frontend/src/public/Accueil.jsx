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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
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
      <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500">
        {/* Login Card - Version compacte */}
        <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Login Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 bg-white">
            <div className="text-center md:text-left mb-5">
              <h1 className="font-headline text-2xl font-bold text-gray-900 tracking-tight mb-1">
                Bienvenue
              </h1>
              <p className="text-gray-500 text-xs">
                Connectez-vous à votre compte
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs text-center">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-4 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#004A99] focus:bg-white transition-all outline-none text-sm"
                  placeholder="Email"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-4 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#004A99] focus:bg-white transition-all outline-none text-sm pr-10"
                  placeholder="Mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#004A99]"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              <div className="text-right">
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="text-[#004A99] font-medium hover:underline text-xs"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#004A99] text-white font-medium rounded-full hover:opacity-95 transition-all shadow-md mt-1 disabled:opacity-50 text-sm"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>

          {/* Right Column: Image */}
          <div className="hidden md:block w-1/2 relative overflow-hidden m-3 rounded-xl">
            <img
              alt="Gourmet dining"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPEMvKaEeN8EtX7IXKETCxG-J0ItUqefskNAVt231qCMBZlAOfVuZW3NhmF73CaoBRa_V3Sve00CvrOe2VJU7kAk_v4WoHOtbPiwEIDLbYpsO8_KOjAXvdY_a9VbrNcBAW0vkK7By-VT_l7bapv8A3o8G5jAS_vf7rvcMqqGMnDNHhki8OYXLhs73Jgau3lAciFj7GRMQtXZJggMUfiaSps1-0t9RJYVJb06zLc3qUHPoSTvgfaIr6lURf9QB0qu3X8h0SwAd-VWw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>
        </div>
      </main>
    </div>
  );
}