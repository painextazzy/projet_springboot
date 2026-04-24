// pages/ResetPassword.jsx - Version ultra simple sans header/footer
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
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYsPj7LqyrFqABWXsSrM1FzM1oMv0ODvFDt075L2dr6CqAAvulr1tTlBy0Gh4aiUMupYVlGX_Xysg-9k4rA3eNY9nlpMyBRT0Llc5kg6ADW3akHDjtXIAW7R4g6w0JJalN8irTueUk4-ZB1A2PtQ6fhQcVvInRRm90VoOnNjfFMWuhDcIM__5iyzHq9M8OfzmSrUPaZMnUHm1O7SlUL4YuFMNgiLphqC-ZWgBEpJXWRTzdOOrsbrDsbP9RwRczqS0FdR2nCJl-Grk"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
            <span className="material-symbols-outlined text-3xl text-blue-600">
              lock_reset
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-sm text-gray-500">
            Entrez votre email pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-2.5 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Réinitialiser"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}