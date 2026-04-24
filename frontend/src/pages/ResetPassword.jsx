// pages/ResetPassword.jsx - Version simplifiée
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email to reset your password.
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
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="hello@alignui.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to login
            </button>
            
            <div className="mt-3">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Don't have access anymore?<br />
                Try another method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}