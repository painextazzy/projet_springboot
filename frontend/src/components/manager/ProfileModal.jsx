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

      if (formData.nouveauMotDePasse.length < 4) {
        setError("Le nouveau mot de passe doit contenir au moins 4 caractères");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Modifier le profil</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                person
              </span>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Votre nom"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                mail
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div className="border-t border-outline-variant/30 my-4" />

          <p className="text-sm text-secondary">
            Laissez vide si vous ne souhaitez pas changer le mot de passe
          </p>

          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Mot de passe actuel
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                lock
              </span>
              <input
                type="password"
                name="motDePasseActuel"
                value={formData.motDePasseActuel}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                lock_open
              </span>
              <input
                type="password"
                name="nouveauMotDePasse"
                value={formData.nouveauMotDePasse}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Nouveau mot de passe"
              />
            </div>
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                lock_outline
              </span>
              <input
                type="password"
                name="confirmerMotDePasse"
                value={formData.confirmerMotDePasse}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Confirmer le mot de passe"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-high transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    sync
                  </span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}