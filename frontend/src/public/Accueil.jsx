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

  // ✅ Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    console.log("🔍 Vérification connexion existante:", {
      user: !!user,
      role,
      token: !!token,
    });

    if (user && role && token) {
      console.log("✅ Utilisateur déjà connecté, redirection...");
      if (role === "SERVEUR") {
        window.location.href = "/serveur";
      } else if (role === "MANAGER" || role === "ADMIN") {
        window.location.href = "/manager";
      }
    }
    setIsCheckingAuth(false);
  }, []);

  // Afficher un loader pendant la vérification
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login({ email, password });

      console.log(" Réponse login:", response);

      if (response && response.role) {
        // ✅ Sauvegarder TOUTES les données
        localStorage.setItem("user", JSON.stringify(response));
        localStorage.setItem("role", response.role);
        localStorage.setItem("token", response.token || "dummy-token");
        localStorage.setItem("lastLogin", new Date().toISOString());

        console.log("💾 Données sauvegardées:", {
          role: localStorage.getItem("role"),
          user: localStorage.getItem("user"),
        });

        // ✅ Redirection avec window.location.href pour forcer le rechargement
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
      console.error("❌ Erreur login:", err);
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover filter brightness-[0.7] blur-[4px]"
          alt="Gourmet dish background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6RxvHE1mQwUfKaYMoypfECYU0A7le7z5maPcfWqGljU9aTJlh5oCm3iu9rAQpltrVlfJKb6srUnnp5cW3h0T7-RO3hZBBj8upcVwnYPTfBzUUDA4it2r217ns-Uf0fgNfPc70RcxMsOg-1K5sPm0mAzlORHBngAVLi7VpbVmP4fysaar9uJv3oULNGOODdPU2pvM38RqD7aulUr7Vn8ZuFGklQpvrtb7Y7guul5LLp62ePcscaE8iUmk8t9zcryrwsi9-NDW4BCA"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Login Container */}
      <main
        className="relative z-10 w-full max-w-[480px] px-6 py-12 md:py-16"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl flex flex-col items-center border border-white/20">
          {/* Logo Section */}
          <div
            className="mb-8 text-center"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4 shadow-lg shadow-primary/20">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restaurant
              </span>
            </div>
            <h1 className="font-headline font-bold text-3xl tracking-tight text-[#111827]">
              Petite Bouffe
            </h1>
            <p className="font-body text-sm font-medium text-secondary mt-1 tracking-wider uppercase">
              Connexion Gestionnaire
            </p>
          </div>

          {/* Form Section */}
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div
              className="space-y-2"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              <label className="block text-[11px] font-bold tracking-wider text-on-surface-variant px-1 uppercase">
                ADRESSE EMAIL
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-on-surface placeholder:text-outline/40 shadow-sm"
                  placeholder="admin@petitebouffe.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div
              className="space-y-2"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <label className="block text-[11px] font-bold tracking-wider text-on-surface-variant px-1 uppercase">
                MOT DE PASSE
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-on-surface placeholder:text-outline/40 shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                  title="Afficher le mot de passe"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              <div className="flex justify-end pt-0.5">
                <a
                  href="/reset-password"
                  className="text-[12px] font-semibold text-primary hover:underline transition-all"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="text-red-500 text-sm text-center py-2"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3" data-aos="fade-up" data-aos-delay="600">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-primary hover:bg-[#003d80] text-white rounded-xl font-headline font-bold text-sm tracking-[0.05rem] shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200 uppercase flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="Chargement"
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
                    CONNEXION...
                  </>
                ) : (
                  "SE CONNECTER"
                )}
              </button>
            </div>
          </form>

          {/* Card Footer */}
          <div
            className="mt-8 flex items-center space-x-2 text-[11px] text-secondary font-medium uppercase tracking-tight"
            data-aos="fade-up"
            data-aos-delay="700"
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
            <p>Accès sécurisé réservé au personnel</p>
          </div>
        </div>

        {/* Global Footer */}
        <footer
          className="mt-8 flex justify-center space-x-10"
          data-aos="fade-up"
          data-aos-delay="800"
        >
          <a
            href="#"
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors tracking-[0.15em] uppercase"
          >
            Support
          </a>
          <a
            href="#"
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors tracking-[0.15em] uppercase"
          >
            Sécurité
          </a>
          <a
            href="#"
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors tracking-[0.15em] uppercase"
          >
            Petite Bouffe RMS
          </a>
        </footer>
      </main>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .material-symbols-outlined {
          font-variation-settings:
            "FILL" 0,
            "wght" 300,
            "GRAD" 0,
            "opsz" 24;
        }
      `}</style>
    </div>
  );
}
