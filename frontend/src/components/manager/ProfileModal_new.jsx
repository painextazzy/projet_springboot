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
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validation du nom
    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis";
      isValid = false;
    } else if (formData.nom.trim().length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
      isValid = false;
    } else if (formData.nom.trim().length > 100) {
      errors.nom = "Le nom ne peut pas dépasser 100 caractères";
      isValid = false;
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
      isValid = false;
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = "L'email doit être valide (exemple@domaine.com)";
      isValid = false;
    }

    // Validation des mots de passe si modification
    if (formData.nouveauMotDePasse || formData.motDePasseActuel) {
      if (!formData.motDePasseActuel) {
        errors.motDePasseActuel = "Veuillez entrer votre mot de passe actuel";
        isValid = false;
      }

      if (!formData.nouveauMotDePasse) {
        errors.nouveauMotDePasse = "Veuillez entrer un nouveau mot de passe";
        isValid = false;
      } else if (formData.nouveauMotDePasse.length < 8) {
        errors.nouveauMotDePasse = "Le mot de passe doit contenir au moins 8 caractères";
        isValid = false;
      } else if (formData.nouveauMotDePasse.length > 100) {
        errors.nouveauMotDePasse = "Le mot de passe ne peut pas dépasser 100 caractères";
        isValid = false;
      }

      if (!formData.confirmerMotDePasse) {
        errors.confirmerMotDePasse = "Veuillez confirmer le mot de passe";
        isValid = false;
      } else if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
        errors.confirmerMotDePasse = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    setSuccess("");
    // Effacer l'erreur du champ en cours de modification
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
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
                    maxLength={100}
                    className={`w-full bg-gray-50 border rounded-xl pl-9 sm:pl-10 pr-3 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.nom
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                    placeholder="Entrez votre nom"
                  />
                </div>
                {fieldErrors.nom && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.nom}
                  </p>
                )}
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
                    className={`w-full bg-gray-50 border rounded-xl pl-9 sm:pl-10 pr-3 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                    placeholder="nom@entreprise.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.email}
                  </p>
                )}
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
                    className={`w-full bg-gray-50 border rounded-xl pl-9 sm:pl-10 pr-9 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.motDePasseActuel
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
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
                {fieldErrors.motDePasseActuel && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.motDePasseActuel}
                  </p>
                )}
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
                      maxLength={100}
                      className={`w-full bg-gray-50 border rounded-xl pl-9 sm:pl-10 pr-9 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.nouveauMotDePasse
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                      }`}
                      placeholder="Min. 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-base sm:text-xl">
                        {showNewPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                  {fieldErrors.nouveauMotDePasse && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.nouveauMotDePasse}
                    </p>
                  )}
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
                      maxLength={100}
                      className={`w-full bg-gray-50 border rounded-xl pl-9 sm:pl-10 pr-9 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.confirmerMotDePasse
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                      }`}
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
                  {fieldErrors.confirmerMotDePasse && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.confirmerMotDePasse}
                    </p>
                  )}
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

          {/* Footer - responsive avec boutons agrandis sur mobile */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3.5 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 sm:px-4 py-3 sm:py-2 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all text-sm sm:text-base"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 sm:px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
