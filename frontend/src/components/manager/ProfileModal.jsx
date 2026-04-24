import React, { useState } from "react";
import { api } from "../../services/api";

export default function ProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    motDePasseActuel: "",
    nouveauMotDePasse: "",
    confirmerMotDePasse: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nom.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (!formData.email.trim()) {
      setError("L'email est requis");
      return;
    }

    if (formData.nouveauMotDePasse || formData.motDePasseActuel) {
      if (!formData.motDePasseActuel) {
        setError("Veuillez entrer votre mot de passe actuel");
        return;
      }

      if (formData.nouveauMotDePasse.length < 8) {
        setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
        return;
      }

      if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.updateProfile({
        id: user.id,
        nom: formData.nom,
        email: formData.email,
        motDePasseActuel: formData.motDePasseActuel || null,
        nouveauMotDePasse: formData.nouveauMotDePasse || null,
      });

      localStorage.setItem("user", JSON.stringify(response));
      setSuccess("Profil mis à jour avec succès!");
      
      if (onUpdate) {
        onUpdate(response);
      }

      setTimeout(() => {
        onClose();
        setFormData({
          nom: user?.nom || "",
          email: user?.email || "",
          motDePasseActuel: "",
          nouveauMotDePasse: "",
          confirmerMotDePasse: "",
        });
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal - largeur réduite et responsive */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg overflow-hidden mx-4">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Paramètres du compte
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Gérez vos informations personnelles
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-4 sm:px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg">error</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base sm:text-lg">check_circle</span>
                <span className="flex-1">{success}</span>
              </div>
            )}

            {/* Section Informations personnelles */}
            <section className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">
                    person
                  </span>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 sm:pl-10 pr-3 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Entrez votre nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">
                    mail
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 sm:pl-10 pr-3 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="nom@entreprise.com"
                  />
                </div>
              </div>
            </section>

            {/* Section Sécurité */}
            <section className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-base sm:text-xl">security</span>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Sécurité
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">
                    lock
                  </span>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="motDePasseActuel"
                    value={formData.motDePasseActuel}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 sm:pl-10 pr-9 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-base sm:text-xl">
                      {showCurrentPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sur mobile: colonne, sur desktop: 2 colonnes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">
                      lock_reset
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="nouveauMotDePasse"
                      value={formData.nouveauMotDePasse}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 sm:pl-10 pr-9 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="Min. 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">
                        {showNewPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Confirmation
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">
                      lock
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmerMotDePasse"
                      value={formData.confirmerMotDePasse}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 sm:pl-10 pr-9 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="Répéter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Message d'information responsive */}
              <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="material-symbols-outlined text-blue-500 text-base sm:text-xl shrink-0 mt-0.5">
                  info
                </span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  8+ caractères avec lettres, chiffres et caractères spéciaux
                </p>
              </div>
            </section>
          </div>

          {/* Footer - responsive */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3.5 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-sm sm:text-base"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base sm:text-xl">sync</span>
                  <span>Enregistrement...</span>
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}