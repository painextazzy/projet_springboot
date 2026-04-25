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
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
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
      <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#f3f4f6]">
        {/* Login Card */}
        <div className="relative z-10 w-full max-w-5xl min-h-[600px] bg-white rounded-2xl md:rounded-[4rem] custom-shadow overflow-hidden flex flex-col md:flex-row shadow-2xl">
          
          {/* Left Column: Login Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 bg-white">
            <div className="flex flex-col items-center md:items-start mb-10">
              <h1 className="font-headline text-4xl font-extrabold text-gray-900 tracking-tight mb-3 text-center md:text-left">
                Bienvenue
              </h1>
              <p className="text-gray-500 text-base font-medium tracking-wide text-center md:text-left">
                Connectez-vous pour commencer
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm text-center">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 ml-1 uppercase">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-xl">
                      mail
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#004A99] focus:bg-white transition-all duration-300 outline-none"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 ml-1 uppercase">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-xl">
                      lock
                    </span>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-14 pr-14 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#004A99] focus:bg-white transition-all duration-300 outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-[#004A99] transition-colors cursor-pointer focus:outline-none"
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
                  className="text-[#004A99] font-bold hover:underline underline-offset-2"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#004A99] text-white text-lg font-bold rounded-full tracking-wide hover:opacity-95 transition-all duration-300 shadow-lg shadow-blue-900/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </div>

          {/* Right Column: Featured Image */}
          <div className="hidden md:block w-1/2 relative overflow-hidden m-5 rounded-[3rem]">
            <img
              alt="Gourmet dining experience"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPEMvKaEeN8EtX7IXKETCxG-J0ItUqefskNAVt231qCMBZlAOfVuZW3NhmF73CaoBRa_V3Sve00CvrOe2VJU7kAk_v4WoHOtbPiwEIDLbYpsO8_KOjAXvdY_a9VbrNcBAW0vkK7By-VT_l7bapv8A3o8G5jAS_vf7rvcMqqGMnDNHhki8OYXLhs73Jgau3lAciFj7GRMQtXZJggMUfiaSps1-0t9RJYVJb06zLc3qUHPoSTvgfaIr6lURf9QB0qu3X8h0SwAd-VWw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
          </div>
        </div>
      </main>

      <style >{`
        .custom-shadow {
          box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.3);
        }
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }
      `}</style>
    </div>
  );
}