// src/pages/NewPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function NewPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkToken = async () => {
      try {
        const result = await api.verifyResetToken(token);
        if (result.valid) {
          setIsValidToken(true);
        } else {
          setError(result.message || "Lien invalide ou expiré");
        }
      } catch (err) {
        setError("Lien invalide ou expiré");
      } finally {
        setVerifying(false);
      }
    };
    
    if (token) {
      checkToken();
    } else {
      setError("Token manquant");
      setVerifying(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    setLoading(true);
    
    try {
      await api.resetPassword(token, password);
      setSuccess("Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Même background que ResetPassword */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6RxvHE1mQwUfKaYMoypfECYU0A7le7z5maPcfWqGljU9aTJlh5oCm3iu9rAQpltrVlfJKb6srUnnp5cW3h0T7-RO3hZBBj8upcVwnYPTfBzUUDA4it2r217ns-Uf0fgNfPc70RcxMsOg-1K5sPm0mAzlORHBngAVLi7VpbVmP4fysaar9uJv3oULNGOODdPU2pvM38RqD7aulUr7Vn8ZuFGklQpvrtb7Y7guul5LLp62ePcscaE8iUmk8t9zcryrwsi9-NDW4BCA"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 shadow-lg">
              <span className="material-symbols-outlined text-3xl text-blue-600">
                lock_reset
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-sm text-gray-500">
              Entrez votre nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-2.5 rounded-lg text-sm text-center">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}