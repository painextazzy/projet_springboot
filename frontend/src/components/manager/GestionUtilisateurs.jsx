// src/components/manager/GestionUtilisateurs.jsx
import React, { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";

const GestionUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    role: "SERVEUR",
    password: "",
    confirmPassword: "",
  });

  // Récupérer l'utilisateur connecté (manager)
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [fieldErrors, setFieldErrors] = useState({});
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    setLoading(true);
    try {
      const users = await api.getUtilisateurs();
      setUtilisateurs(users);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFormUtilisateur = () => {
    const errors = {};
    let isValid = true;

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

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
      isValid = false;
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = "L'email doit être valide (exemple@domaine.com)";
      isValid = false;
    }

    if (!editingUser) {
      if (!formData.password) {
        errors.password = "Le mot de passe est requis";
        isValid = false;
      } else if (formData.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
        isValid = false;
      } else if (formData.password.length > 100) {
        errors.password = "Le mot de passe ne peut pas dépasser 100 caractères";
        isValid = false;
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Veuillez confirmer le mot de passe";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormUtilisateur()) {
      return;
    }

    try {
      if (editingUser) {
        const updateData = {
          nom: formData.nom,
          email: formData.email,
          role: formData.role,
        };
        await api.updateUtilisateur(editingUser.id, updateData);
      } else {
        await api.createUtilisateur({
          nom: formData.nom,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }
      resetForm();
      fetchUtilisateurs();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  // ✅ Supprimer UNIQUEMENT les serveurs (pas les managers)
  const handleDelete = async (id, role) => {
    if (role === "MANAGER") {
      alert("Impossible de supprimer un compte manager");
      return;
    }

    if (window.confirm("Supprimer cet utilisateur ?")) {
      try {
        await api.deleteUtilisateur(id);
        fetchUtilisateurs();
        setOpenDropdown(null);
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (user) => {
    // Vérifier si l'utilisateur est manager et si ce n'est pas l'utilisateur connecté
    if (user.role === "MANAGER" && user.id !== currentUser.id) {
      alert("Vous ne pouvez pas modifier un autre manager");
      return;
    }

    setEditingUser(user);
    setFormData({
      nom: user.nom || "",
      email: user.email || "",
      role: user.role || "SERVEUR",
      password: "",
      confirmPassword: "",
    });
    setOpenDropdown(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      nom: "",
      email: "",
      role: "SERVEUR",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(false);
    setFieldErrors({});
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "MANAGER":
        return (
          <span className="px-3 py-1 text-xs font-bold text-white bg-primary rounded-full">
            Manager
          </span>
        );
      case "SERVEUR":
        return (
          <span className="px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-full">
            Serveur
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold text-white bg-secondary rounded-full">
            Utilisateur
          </span>
        );
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "MANAGER":
        return "verified";
      case "SERVEUR":
        return "restaurant";
      default:
        return "person";
    }
  };

  const filteredUtilisateurs = utilisateurs.filter((user) => {
    const matchesSearch =
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" ? true : user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <main className="flex-grow max-w-7xl mx-auto px-6 pt-12 pb-24 w-full">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Gestion des utilisateurs
          </h1>
          <p className="text-secondary font-medium">
            Gérez les comptes et les permissions
          </p>
        </header>

        {/* Filters */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-surface-container-low p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-5 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
                filterRole === "all"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterRole("MANAGER")}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                filterRole === "MANAGER"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Managers
            </button>
            <button
              onClick={() => setFilterRole("SERVEUR")}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                filterRole === "SERVEUR"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Serveurs
            </button>
          </div>
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-sm placeholder:text-secondary/60"
              placeholder="Rechercher un utilisateur..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New User Card */}
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="group flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-outline-variant/50 p-6 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 min-h-[320px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary">
                person_add
              </span>
            </div>
            <span className="font-headline text-lg font-bold text-secondary group-hover:text-primary">
              Ajouter un utilisateur
            </span>
          </button>

          {/* Existing Users */}
          {filteredUtilisateurs.map((user) => (
            <div
              key={user.id}
              className="group bg-surface-container-lowest rounded-2xl shadow-[0px_20px_40px_rgba(25,28,30,0.03)] border border-outline-variant/10 hover:shadow-[0px_20px_40px_rgba(25,28,30,0.06)] transition-all duration-300 overflow-hidden relative"
            >
              <div className="p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    {getRoleIcon(user.role)}
                  </span>
                </div>

                {/* Nom */}
                <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
                  {user.nom}
                </h3>

                {/* Email */}
                <p className="text-secondary text-sm mb-3 break-all">
                  {user.email}
                </p>

                {/* Badge rôle */}
                <div className="mb-2">{getRoleBadge(user.role)}</div>
              </div>

              {/* Actions - Icône paramètres UNIQUEMENT pour les serveurs */}
              {user.role !== "MANAGER" && (
                <div className="absolute bottom-3 right-3">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === user.id ? null : user.id,
                        )
                      }
                      className="p-1.5 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Actions"
                    >
                      <span className="material-symbols-outlined text-lg">
                        settings
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === user.id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 overflow-hidden min-w-[140px] z-10">
                        <button
                          onClick={() => handleEdit(user)}
                          className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg text-primary">
                            edit
                          </span>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.role)}
                          className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg text-error">
                            delete
                          </span>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredUtilisateurs.length === 0 && !loading && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-secondary mb-3">
              group
            </span>
            <p className="text-secondary">Aucun utilisateur trouvé</p>
          </div>
        )}
      </main>

      {/* Modal Ajouter/Modifier Utilisateur */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={resetForm}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/15 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-3 border-b border-outline-variant/10">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                  {editingUser
                    ? "Modifier l'utilisateur"
                    : "Nouvel utilisateur"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-secondary hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>
              <p className="text-secondary text-xs">
                {editingUser
                  ? "Modifiez les informations de l'utilisateur"
                  : "Créez un nouveau compte utilisateur"}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => {
                      setFormData({ ...formData, nom: e.target.value });
                      if (fieldErrors.nom) setFieldErrors({ ...fieldErrors, nom: "" });
                    }}
                    maxLength={100}
                    className={`w-full bg-surface-container-highest border-2 rounded-lg px-4 py-2.5 text-on-surface placeholder:text-outline focus:ring-2 focus:bg-surface-container-lowest transition-all text-sm ${
                      fieldErrors.nom
                        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                        : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                    }`}
                    placeholder="Jean Dupont"
                    required
                  />
                  {fieldErrors.nom && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.nom}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    className={`w-full bg-surface-container-highest border-2 rounded-lg px-4 py-2.5 text-on-surface placeholder:text-outline focus:ring-2 focus:bg-surface-container-lowest transition-all text-sm ${
                      fieldErrors.email
                        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                        : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                    }`}
                    placeholder="jean@petitebouffe.com"
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
                    Rôle *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-2.5 text-on-surface appearance-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all cursor-pointer text-sm"
                      required
                    >
                      <option value="SERVEUR">Serveur</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                      <span className="material-symbols-outlined text-lg">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {!editingUser && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            });
                            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                          }}
                          maxLength={100}
                          className={`w-full bg-surface-container-highest border-2 rounded-lg px-4 py-2.5 text-on-surface placeholder:text-outline focus:ring-2 focus:bg-surface-container-lowest transition-all text-sm pr-10 ${
                            fieldErrors.password
                              ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                              : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                          }`}
                          placeholder="••••••••"
                          required={!editingUser}
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            });
                            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                          }}
                          maxLength={100}
                          className={`w-full bg-surface-container-highest border-2 rounded-lg px-4 py-2.5 text-on-surface placeholder:text-outline focus:ring-2 focus:bg-surface-container-lowest transition-all text-sm pr-10 ${
                            fieldErrors.confirmPassword
                              ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                              : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                          }`}
                          placeholder="••••••••"
                          required={!editingUser}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showConfirmPassword
                              ? "visibility_off"
                              : "visibility"}
                          </span>
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-surface-container-low flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 sm:px-5 py-3 sm:py-2 text-sm font-semibold text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 sm:px-6 py-3 sm:py-2 text-sm font-semibold text-white rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #00307d 0%, #0045ab 100%)",
                  }}
                >
                  {editingUser ? "Mettre à jour" : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUtilisateurs;
