// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import bgImage from "../assets/logo.jpg"; // Même image de fond que l'accueil

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!email.trim()) {
    setError("L'email est requis");
    return;
  }

  setLoading(true);

  try {
    // Vérifier d'abord si l'email existe
    const checkResult = await api.checkEmail(email);
    
    if (!checkResult.exists) {
      setError("Aucun compte trouvé avec cet email");
      setLoading(false);
      return;
    }
    
    // Si l'email existe, envoyer le lien
    const result = await api.requestPasswordReset(email);
    setSuccess("Un email de réinitialisation a été envoyé ! Vérifiez votre boîte de réception.");
    
    setTimeout(() => {
      navigate("/");
    }, 3000);
    
  } catch (err) {
    setError(err.message || "Une erreur est survenue");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="antialiased">
      {/* Main Container avec image de fond floutée */}
      <main className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
        
        {/* Image de fond avec flou */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt="Background"
            className="w-full h-full object-cover blur-[2px] scale-105"
          />
          {/* Overlay pour meilleure lisibilité */}
          <div className="absolute inset-0 bg-white/40"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          
          {/* Reset Password Card */}
          <div
            className="w-full bg-white/95 backdrop-blur-sm rounded-[2rem] p-8 sm:p-12"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {/* Icône email */}
            <div className="text-center mb-6">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                <span className="material-symbols-outlined text-3xl text-indigo-500">
                  mail
                </span>
              </div>
            </div>

            {/* Header Text */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mot de passe oublié ?
              </h1>
              <p className="text-gray-400 text-sm">
                Entrez votre email pour réinitialiser votre mot de passe
              </p>
            </div>

            {/* Form Fields */}
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
                    placeholder="votre@email.com"
                    required
                  />
                </div>
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
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </div>
            </form>

            {/* Back to login */}
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