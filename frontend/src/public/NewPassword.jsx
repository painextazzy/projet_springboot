// src/pages/NewPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import bgImage from "../assets/logo.jpg"; // Même image de fond que l'accueil

export default function NewPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("Lien invalide : token manquant");
        setVerifying(false);
        return;
      }

      try {
        // Vérifier le token avec l'ID utilisateur si disponible
        const result = await api.verifyResetToken(token, userId ? parseInt(userId) : null);
        
        if (result.valid) {
          setIsValidToken(true);
        } else {
          setError(result.message || "Lien invalide ou expiré");
        }
      } catch (err) {
        console.error("Erreur vérification token:", err);
        setError("Lien invalide ou expiré");
      } finally {
        setVerifying(false);
      }
    };
    
    checkToken();
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validations
    if (!newPassword || !confirmPassword) {
      setError("Tous les champs sont requis");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setError("Token manquant");
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ Envoyer token, userId et newPassword
      await api.resetPassword({
        token: token,
        userId: userId ? parseInt(userId) : null,
        newPassword: newPassword
      });
      
      setSuccess("Mot de passe réinitialisé avec succès ! Redirection...");
      
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (err) {
      console.error("Erreur reset:", err);
      setError(err.message || "Une erreur est survenue. Le lien est peut-être expiré.");
    } finally {
      setLoading(false);
    }
  };

  // Écran de chargement
  if (verifying) {
    return (
      <div className="antialiased">
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover blur-[2px] scale-105" />
            <div className="absolute inset-0 bg-white/40"></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Vérification du lien...</p>
          </div>
        </main>
      </div>
    );
  }

  // Lien invalide ou expiré
  if (!isValidToken) {
    return (
      <div className="antialiased">
        <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover blur-[2px] scale-105" />
            <div className="absolute inset-0 bg-white/40"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-md">
            <div className="w-full bg-white/95 backdrop-blur-sm rounded-[2rem] p-8 sm:p-12 text-center"
                 style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
              
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                <span className="material-symbols-outlined text-3xl text-red-500">error</span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h2>
              <p className="text-gray-500 mb-6">{error || "Ce lien est invalide ou a expiré."}</p>
              
              <button
                onClick={() => navigate("/reset-password")}
                className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-all"
              >
                Demander un nouveau lien
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 text-gray-500 hover:text-indigo-500 text-sm transition-colors"
              >
                ← Retour à la connexion
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Formulaire de nouveau mot de passe
  return (
    <div className="antialiased">
      <main className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
        
        {/* Image de fond avec flou */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt="Background"
            className="w-full h-full object-cover blur-[2px] scale-105"
          />
          <div className="absolute inset-0 bg-white/40"></div>
        </div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          
          {/* Carte NewPassword */}
          <div
            className="w-full bg-white/95 backdrop-blur-sm rounded-[2rem] p-8 sm:p-12"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {/* Icône cadenas */}
            <div className="text-center mb-6">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                <span className="material-symbols-outlined text-3xl text-indigo-500">
                  lock_reset
                </span>
              </div>
            </div>

            {/* Header Text */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Nouveau mot de passe
              </h1>
              <p className="text-gray-400 text-sm">
                Choisissez un mot de passe sécurisé (8 caractères minimum)
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 px-4 py-2.5 rounded-xl text-sm text-center">
                  {success}
                </div>
              )}

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1.5" htmlFor="newPassword">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    lock
                  </span>
                  <input
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
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
                <p className="text-xs text-gray-400 mt-1 ml-1">Minimum 8 caractères</p>
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1.5" htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    lock_reset
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Bouton Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Réinitialisation...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </button>
              </div>
            </form>

            {/* Bouton retour */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-indigo-500 transition-colors font-medium"
              >
                ← Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}