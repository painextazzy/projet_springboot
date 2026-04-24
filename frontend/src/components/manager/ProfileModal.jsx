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

    // Validation
    if (!formData.nom.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (!formData.email.trim()) {
      setError("L'email est requis");
      return;
    }

    // Vérifier si un nouveau mot de passe est fourni
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

      // Mettre à jour le localStorage
      localStorage.setItem("user", JSON.stringify(response));

      setSuccess("Profil mis à jour avec succès!");
      
      // Appeler le callback onUpdate si fourni
      if (onUpdate) {
        onUpdate(response);
      }

      // Fermer le modal après 1.5 secondes
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-[#051a3e]/30 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-surface-container-lowest ambient-shadow rounded-2xl w-full max-w-[640px] overflow-hidden flex flex-col border border-outline-variant/30">
        {/* Modal Header */}
        <div className="px-xxl pt-xxl pb-lg flex items-center justify-between">
          <div>
            <h1 className="font-headline-md text-[28px] tracking-tight text-on-surface">
              Paramètres du compte
            </h1>
            <p className="text-on-surface-variant text-body-md mt-1">
              Gérez vos informations personnelles et vos préférences de sécurité.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low p-2 rounded-full transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Content (Form) */}
        <form onSubmit={handleSubmit}>
          <div className="px-xxl pb-xxl space-y-xxl overflow-y-auto max-h-[640px]">
            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="bg-error-container/20 border border-error/30 text-error px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success-container/20 border border-success/30 text-success px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {success}
              </div>
            )}

            {/* Section: Personal Info */}
            <section className="space-y-xl">
              <div className="grid grid-cols-1 gap-lg">
                <div className="flex flex-col gap-2">
                  <label
                    className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant"
                    htmlFor="name"
                  >
                    Nom complet
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors text-[20px]">
                      person
                    </span>
                    <input
                      type="text"
                      name="nom"
                      id="name"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full bg-[#f8f9fc] border border-outline-variant/60 rounded-xl pl-10 pr-md py-[10px] font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:border-primary/40 outline-none transition-all duration-200"
                      placeholder="Entrez votre nom"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant"
                    htmlFor="email"
                  >
                    Adresse e-mail
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors text-[20px]">
                      mail
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#f8f9fc] border border-outline-variant/60 rounded-xl pl-10 pr-md py-[10px] font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:border-primary/40 outline-none transition-all duration-200"
                      placeholder="nom@entreprise.com"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Password Change */}
            <section className="pt-xxl border-t border-outline-variant/30 space-y-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <h2 className="font-headline-md text-title-lg text-on-surface">
                  Sécurité et accès
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant"
                  htmlFor="current-password"
                >
                  Mot de passe actuel
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors text-[20px]">
                    lock
                  </span>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="motDePasseActuel"
                    id="current-password"
                    value={formData.motDePasseActuel}
                    onChange={handleChange}
                    className="w-full bg-[#f8f9fc] border border-outline-variant/60 rounded-xl py-[10px] font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:border-primary/40 outline-none transition-all duration-200 pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer text-[20px]"
                  >
                    {showCurrentPassword ? "visibility_off" : "visibility"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="flex flex-col gap-2">
                  <label
                    className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant"
                    htmlFor="new-password"
                  >
                    Nouveau mot de passe
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors text-[20px]">
                      lock_reset
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="nouveauMotDePasse"
                      id="new-password"
                      value={formData.nouveauMotDePasse}
                      onChange={handleChange}
                      className="w-full bg-[#f8f9fc] border border-outline-variant/60 rounded-xl py-[10px] font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:border-primary/40 outline-none transition-all duration-200 pl-10 pr-10"
                      placeholder="Min. 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer text-[20px]"
                    >
                      {showNewPassword ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant"
                    htmlFor="confirm-password"
                  >
                    Confirmation
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors text-[20px]">
                      lock
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmerMotDePasse"
                      id="confirm-password"
                      value={formData.confirmerMotDePasse}
                      onChange={handleChange}
                      className="w-full bg-[#f8f9fc] border border-outline-variant/60 rounded-xl py-[10px] font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:bg-white focus:border-primary/40 outline-none transition-all duration-200 pl-10 pr-10"
                      placeholder="Répéter le mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer text-[20px]"
                    >
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-lg bg-surface-container-low/50 rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5">
                  info
                </span>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Le mot de passe doit contenir au moins 8 caractères, incluant des lettres,
                  des chiffres et au moins un caractère spécial pour une sécurité optimale.
                </p>
              </div>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="bg-surface-container-low/30 px-xxl py-xl flex justify-end items-center gap-md border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-lg py-sm font-semibold text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-all active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#003d9b] hover:bg-[#002d72] text-white px-xl py-[10px] font-semibold text-body-md rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    sync
                  </span>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}