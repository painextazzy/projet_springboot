import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import webSocketService from "../../services/websocketService";
import SkeletonMenu from "./skeletons/SkeletonMenu";

// Configuration Cloudinary
const CLOUD_NAME = "dpq3tuhn2";
const UPLOAD_PRESET = "restaurant_menu";

export default function GestionMenu() {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtreCategorie, setFiltreCategorie] = useState("TOUS");
  const [filtreEpuise, setFiltreEpuise] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [platEdit, setPlatEdit] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    quantite: "",
    categorie: "",
    disponible: true,
    imageUrl: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Notification toast
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  // Upload image vers Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Erreur upload:", error);
      return null;
    }
  };

  // Chargement initial + WebSocket
  useEffect(() => {
    chargerDonnees();
    webSocketService.connect();

    const unsubscribe = webSocketService.subscribe(() => {
      console.log("🔄 WebSocket: rechargement du menu");
      chargerDonnees();
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await api.getMenu();
      setPlats(data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger le menu");
    } finally {
      setLoading(false);
    }
  };

  // Nombre de plats épuisés (calcul direct)
  const nbEpuisesDirect = plats.filter(
    (plat) => plat.quantite === 0 && plat.disponible === true,
  ).length;

  const handleFileSelect = (file) => {
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp")
    ) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showNotification(
        "Format non supporté. Utilisez JPG, PNG ou WEBP",
        "error",
      );
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const platsFiltres = plats.filter((plat) => {
    if (filtreCategorie !== "TOUS" && plat.categorie !== filtreCategorie) {
      return false;
    }
    if (filtreEpuise && plat.quantite > 0) {
      return false;
    }
    if (
      recherche &&
      !plat.nom.toLowerCase().includes(recherche.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Validation du formulaire plat
  const validateFormMenu = () => {
    const errors = {};
    let isValid = true;

    if (!formData.nom.trim()) {
      errors.nom = "Le nom du plat est requis";
      isValid = false;
    } else if (formData.nom.trim().length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
      isValid = false;
    } else if (formData.nom.trim().length > 100) {
      errors.nom = "Le nom ne peut pas dépasser 100 caractères";
      isValid = false;
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "La description ne peut pas dépasser 500 caractères";
      isValid = false;
    }

    if (!formData.categorie) {
      errors.categorie = "Sélectionner une catégorie est requis";
      isValid = false;
    }

    if (!formData.prix) {
      errors.prix = "Le prix est requis";
      isValid = false;
    } else if (isNaN(parseFloat(formData.prix)) || parseFloat(formData.prix) < 0) {
      errors.prix = "Le prix doit être un nombre positif";
      isValid = false;
    } else if (parseFloat(formData.prix) > 999999) {
      errors.prix = "Le prix est trop élevé";
      isValid = false;
    }

    if (formData.quantite !== "") {
      if (isNaN(parseInt(formData.quantite)) || parseInt(formData.quantite) < 0) {
        errors.quantite = "La quantité doit être un nombre positif";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };
  
  // Ajouter un plat
  const handleAjouter = async () => {
    if (!validateFormMenu()) {
      return;
    }

    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const nouveauPlat = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        imageUrl: imageUrl,
        quantite: parseInt(formData.quantite) || 0,
        disponible: true,
        categorie: formData.categorie,
      };
      const response = await api.createPlat(nouveauPlat);

      setPlats((prev) => [...prev, response]);

      setShowModal(false);
      resetForm();
      showNotification("Plat ajouté avec succès", "success");
    } catch (error) {
      showNotification("Erreur lors de l'ajout", "error");
    } finally {
      setUploading(false);
    }
  };

  // Modifier un plat
  const handleModifier = async () => {
    if (!validateFormMenu()) {
      return;
    }

    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const platModifie = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        imageUrl: imageUrl,
        quantite: parseInt(formData.quantite) || 0,
        disponible: formData.disponible,
        categorie: formData.categorie,
      };
      const response = await api.updatePlat(platEdit.id, platModifie);

      setPlats((prev) =>
        prev.map((p) => (p.id === platEdit.id ? response : p)),
      );

      setShowModal(false);
      setPlatEdit(null);
      resetForm();
      showNotification("Plat modifié avec succès", "success");
    } catch (error) {
      showNotification("Erreur lors de la modification", "error");
    } finally {
      setUploading(false);
    }
  };

  // Supprimer un plat
  const handleSupprimer = async (id, nom) => {
    if (confirm(`Supprimer le plat "${nom}" ?`)) {
      try {
        await api.deletePlat(id);
        setPlats((prev) => prev.filter((p) => p.id !== id));
        setShowActionMenu(null);
        showNotification("Plat supprimé avec succès", "success");
      } catch (error) {
        showNotification("Erreur lors de la suppression", "error");
      }
    }
  };

  const openEditModal = (plat) => {
    setPlatEdit(plat);
    setFormData({
      nom: plat.nom,
      description: plat.description || "",
      prix: plat.prix,
      quantite: plat.quantite,
      categorie: plat.categorie,
      disponible: plat.disponible,
      imageUrl: plat.imageUrl || "",
    });
    setImagePreview(plat.imageUrl || "");
    setImageFile(null);
    setShowModal(true);
    setShowActionMenu(null);
  };

  const openAddModal = () => {
    setPlatEdit(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      prix: "",
      quantite: "",
      categorie: "",
      disponible: true,
      imageUrl: "",
    });
    setImagePreview("");
    setImageFile(null);
    setFieldErrors({});
  };

  const getCategorieClass = (categorie) => {
    const classes = {
      ENTREE: "text-primary",
      PLAT: "text-primary",
      DESSERT: "text-[#7b2f00]",
      BOISSON: "text-tertiary",
    };
    return classes[categorie] || "text-secondary";
  };

  const formatPrix = (prix) => {
    return `${prix.toLocaleString("fr-FR")} Ar`;
  };

  if (loading) {
    return <SkeletonMenu />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={chargerDonnees}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {notification.type === "error" ? "error" : "check_circle"}
            </span>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-1">
              Menu Manager
            </h1>
            <p className="text-secondary text-xs sm:text-sm">
              Gérez vos plats, boissons et disponibilités en temps réel.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Filtres - scroll horizontal sur mobile */}
          <div className="flex items-center gap-2 bg-white shadow-sm p-1.5 rounded-2xl overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => {
                setFiltreCategorie("TOUS");
                setFiltreEpuise(false);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl transition-all text-xs sm:text-sm ${
                filtreCategorie === "TOUS" && !filtreEpuise
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-secondary hover:bg-white/50 font-medium"
              }`}
            >
              Tous
            </button>
            {["ENTREE", "PLAT", "DESSERT", "BOISSON"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFiltreCategorie(cat);
                  setFiltreEpuise(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl transition-all text-xs sm:text-sm ${
                  filtreCategorie === cat && !filtreEpuise
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-secondary hover:bg-white/50 font-medium"
                }`}
              >
                {cat === "ENTREE"
                  ? "Entrées"
                  : cat === "PLAT"
                    ? "Plats"
                    : cat === "DESSERT"
                      ? "Desserts"
                      : "Boissons"}
              </button>
            ))}
            <button
              onClick={() => {
                setFiltreEpuise(!filtreEpuise);
                setFiltreCategorie("TOUS");
              }}
              className={`relative px-3 sm:px-4 py-1.5 rounded-xl transition-all text-xs sm:text-sm ${
                filtreEpuise
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-secondary hover:bg-white/50 font-medium"
              }`}
            >
              Épuisé
              {nbEpuisesDirect > 0 && !filtreEpuise && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {nbEpuisesDirect > 99 ? "99+" : nbEpuisesDirect}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg sm:text-xl">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full bg-white shadow-sm border border-outline-variant/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Rechercher un plat..."
            />
          </div>
        </div>

        {/* Grid Content - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Add New Dish Card */}
          <button
            onClick={openAddModal}
            className="group relative flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] bg-transparent border-2 border-dashed border-outline-variant rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-surface-container flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">
                add
              </span>
            </div>
            <span className="text-sm sm:text-base font-bold font-headline text-on-surface">
              Ajouter un plat
            </span>
          </button>

          {/* Menu Items */}
          {platsFiltres.map((plat) => {
            const estEpuise = plat.quantite === 0;
            const stockBas = plat.quantite <= 5 && plat.quantite > 0;
            const categorieClass = getCategorieClass(plat.categorie);

            return (
              <div
                key={plat.id}
                className="bg-white rounded-2xl shadow-lg border border-outline-variant/10 flex flex-col overflow-hidden transition-transform hover:-translate-y-1 relative"
              >
                <div className="relative h-36 sm:h-44 w-full overflow-hidden">
                  {plat.imageUrl ? (
                    <img
                      alt={plat.nom}
                      className="w-full h-full object-cover"
                      src={plat.imageUrl}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x300/e2e8f0/64748b?text=Image+non+disponible";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🍽️</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 text-[8px] sm:text-[10px] font-bold tracking-[0.05rem] uppercase bg-white/90 backdrop-blur px-1.5 sm:px-2 py-0.5 rounded shadow-sm ${categorieClass}`}
                  >
                    {plat.categorie}
                  </span>
                  {estEpuise && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                        ÉPUISÉ
                      </span>
                    </div>
                  )}
                  {stockBas && !estEpuise && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-bold">
                      Stock bas: {plat.quantite}
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg font-extrabold font-headline text-on-surface leading-tight mb-1 line-clamp-1">
                    {plat.nom}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-secondary line-clamp-2 mb-2 sm:mb-3">
                    {plat.description || "Aucune description"}
                  </p>
                  <div className="flex justify-between items-end mt-auto">
                    <div className="space-y-0.5">
                      <div className="text-lg sm:text-xl font-extrabold text-on-surface font-headline">
                        {formatPrix(plat.prix)}
                      </div>
                      <div
                        className={`text-[9px] sm:text-xs font-medium ${estEpuise ? "text-error font-bold" : "text-secondary"}`}
                      >
                        Stock:{" "}
                        <span
                          className={
                            estEpuise
                              ? "font-bold text-error"
                              : "text-on-surface"
                          }
                        >
                          {plat.quantite}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowActionMenu(
                            showActionMenu === plat.id ? null : plat.id,
                          )
                        }
                        className="p-1.5 text-outline hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-base sm:text-lg">
                          more_vert
                        </span>
                      </button>

                      {showActionMenu === plat.id && (
                        <div className="absolute bottom-8 right-0 bg-white rounded-xl shadow-lg border border-outline-variant/10 overflow-hidden z-10 min-w-[110px] sm:min-w-[120px]">
                          <button
                            onClick={() => openEditModal(plat)}
                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition"
                          >
                            <span className="material-symbols-outlined text-base">
                              edit
                            </span>
                            Modifier
                          </button>
                          <button
                            onClick={() => handleSupprimer(plat.id, plat.nom)}
                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-error hover:bg-error/5 flex items-center gap-2 transition"
                          >
                            <span className="material-symbols-outlined text-base">
                              delete
                            </span>
                            Supprimer
                          </button>
                          <button
                            onClick={() => setShowActionMenu(null)}
                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition border-t border-outline-variant/10"
                          >
                            <span className="material-symbols-outlined text-base">
                              close
                            </span>
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {platsFiltres.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary">Aucun plat trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Ajouter/Modifier - Responsive */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md sm:max-w-lg rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-outline-variant/10">
              <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface tracking-tight">
                {platEdit ? "Modifier le plat" : "Ajouter un Nouveau Plat"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              className="p-5 sm:p-8 space-y-4 sm:space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Image Upload */}
              <div className="pb-2">
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative h-32 sm:h-40 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 sm:gap-3 transition-colors cursor-pointer text-center px-4 ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/40 hover:border-primary/40 bg-surface-container-low/50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview("");
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">
                        add_a_photo
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-on-surface">
                          Glisser-déposer ou cliquer pour ajouter une photo
                        </p>
                        <p className="text-[10px] sm:text-xs text-secondary font-medium">
                          Format recommandé : JPG, PNG (max. 5Mo)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Nom du plat */}
              <div className="space-y-2">
                <label className="block font-label text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-secondary">
                  Nom du plat
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => {
                    setFormData({ ...formData, nom: e.target.value });
                    if (fieldErrors.nom) setFieldErrors({ ...fieldErrors, nom: "" });
                  }}
                  maxLength={100}
                  className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-surface-container-low border-2 rounded-xl focus:ring-2 focus:bg-white transition-all text-sm text-on-surface placeholder:text-outline/50 ${
                    fieldErrors.nom
                      ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                      : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                  }`}
                  placeholder="Ex: Risotto aux Morilles"
                />
                {fieldErrors.nom && (
                  <p className="text-red-600 text-xs sm:text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.nom}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block font-label text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-secondary">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
                  }}
                  maxLength={500}
                  className={`w-full p-3 sm:p-4 bg-surface-container-low border-2 rounded-xl focus:ring-2 focus:bg-white transition-all text-sm text-on-surface placeholder:text-outline/50 resize-none ${
                    fieldErrors.description
                      ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                      : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                  }`}
                  placeholder="Décrivez les ingrédients et la préparation..."
                  rows="3"
                />
                <div className="text-[10px] sm:text-xs text-secondary">
                  {formData.description.length}/500 caractères
                </div>
                {fieldErrors.description && (
                  <p className="text-red-600 text-xs sm:text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <label className="block font-label text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-secondary">
                  Catégorie
                </label>
                <div className="relative">
                  <select
                    value={formData.categorie}
                    onChange={(e) => {
                      setFormData({ ...formData, categorie: e.target.value });
                      if (fieldErrors.categorie) setFieldErrors({ ...fieldErrors, categorie: "" });
                    }}
                    className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-surface-container-low border-2 rounded-xl focus:ring-2 focus:bg-white transition-all text-sm text-on-surface appearance-none cursor-pointer ${
                      fieldErrors.categorie
                        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                        : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                    }`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="ENTREE">Entrée</option>
                    <option value="PLAT">Plat</option>
                    <option value="DESSERT">Dessert</option>
                    <option value="BOISSON">Boisson</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                    expand_more
                  </span>
                </div>
                {fieldErrors.categorie && (
                  <p className="text-red-600 text-xs sm:text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {fieldErrors.categorie}
                  </p>
                )}
              </div>

              {/* Prix et Stock */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="block font-label text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-secondary">
                    Prix (Ar)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100"
                      value={formData.prix}
                      onChange={(e) => {
                        setFormData({ ...formData, prix: e.target.value });
                        if (fieldErrors.prix) setFieldErrors({ ...fieldErrors, prix: "" });
                      }}
                      className={`w-full h-10 sm:h-12 pl-3 sm:pl-4 pr-10 sm:pr-12 bg-surface-container-low border-2 rounded-xl focus:ring-2 focus:bg-white transition-all text-sm text-on-surface ${
                        fieldErrors.prix
                          ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                          : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                      }`}
                      placeholder="0"
                    />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-outline font-medium text-xs sm:text-sm">
                      Ar
                    </span>
                  </div>
                  {fieldErrors.prix && (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.prix}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block font-label text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-secondary">
                    Quantité (Stock)
                  </label>
                  <input
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => {
                      setFormData({ ...formData, quantite: e.target.value });
                      if (fieldErrors.quantite) setFieldErrors({ ...fieldErrors, quantite: "" });
                    }}
                    className={`w-full h-10 sm:h-12 px-3 sm:px-4 bg-surface-container-low border-2 rounded-xl focus:ring-2 focus:bg-white transition-all text-sm text-on-surface ${
                      fieldErrors.quantite
                        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                        : "border-transparent focus:ring-primary/20 focus:border-primary/30"
                    }`}
                    placeholder="0"
                  />
                  {fieldErrors.quantite && (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fieldErrors.quantite}
                    </p>
                  )}
                </div>
              </div>

              {/* Disponible */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formData.disponible}
                  onChange={(e) =>
                    setFormData({ ...formData, disponible: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="disponible"
                  className="text-xs sm:text-sm text-secondary"
                >
                  Disponible à la commande
                </label>
              </div>
            </form>

            <div className="px-5 sm:px-8 py-4 sm:py-6 bg-surface-container-low/50 border-t border-outline-variant/10 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={platEdit ? handleModifier : handleAjouter}
                disabled={uploading}
                className="flex-1 h-10 sm:h-12 bg-primary hover:bg-primary-container text-white font-headline font-bold rounded-xl transition-all shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50 text-sm sm:text-base"
              >
                {uploading
                  ? "Upload en cours..."
                  : platEdit
                    ? "Modifier le plat"
                    : "Enregistrer le plat"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-10 sm:h-12 bg-surface-container-highest hover:bg-surface-dim text-on-surface font-headline font-bold rounded-xl transition-all active:scale-95 text-sm sm:text-base"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
