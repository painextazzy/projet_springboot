// pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

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
      await api.resetPassword({ email });
      
      setSuccess("Un email de réinitialisation a été envoyé !");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Aucun compte trouvé avec cet email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Image - même photo que l'accueil */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Gourmet dish background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6RxvHE1mQwUfKaYMoypfECYU0A7le7z5maPcfWqGljU9aTJlh5oCm3iu9rAQpltrVlfJKb6srUnnp5cW3h0T7-RO3hZBBj8upcVwnYPTfBzUUDA4it2r217ns-Uf0fgNfPc70RcxMsOg-1K5sPm0mAzlORHBngAVLi7VpbVmP4fysaar9uJv3oULNGOODdPU2pvM38RqD7aulUr7Vn8ZuFGklQpvrtb7Y7guul5LLp62ePcscaE8iUmk8t9zcryrwsi9-NDW4BCA"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 shadow-lg">
              <span className="material-symbols-outlined text-3xl text-blue-600">
                mail
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Réinitialisation
            </h1>
            <p className="text-sm text-gray-500">
              Entrez votre email pour réinitialiser votre mot de passe
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
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400">
                    mail
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                  Envoi...
                </>
              ) : (
                "Envoyer"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}