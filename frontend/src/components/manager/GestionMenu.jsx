import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import webSocketService from "../../services/websocketService";

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

  // ✅ Chargement initial + WebSocket
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
    try {
      setLoading(true);
      const data = await api.getMenu();
      console.log("Données reçues:", data);
      setPlats(data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger le menu");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calcul DIRECT du nombre de plats épuisés (temps réel, sans état)
  // Cette valeur est recalculée à chaque render, donc toujours à jour !
  const nbEpuisesDirect = plats.filter(
    (plat) => plat.quantite === 0 && plat.disponible === true,
  ).length;

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Erreur upload:", error);
      return null;
    }
  };

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
      alert("Format non supporté. Utilisez JPG, PNG ou WEBP");
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

  // ✅ Filtrage en temps réel (sans actualisation)
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

  const handleAjouter = async () => {
    if (!formData.nom || !formData.prix || !formData.categorie) {
      alert("Veuillez remplir tous les champs obligatoires");
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

      // ✅ Mise à jour immédiate du state
      setPlats((prevPlats) => [...prevPlats, response]);

      setShowModal(false);
      resetForm();
      alert("Plat ajouté avec succès");
    } catch (error) {
      alert("Erreur lors de l'ajout");
    } finally {
      setUploading(false);
    }
  };

  const handleModifier = async () => {
    if (!formData.nom || !formData.prix || !formData.categorie) {
      alert("Veuillez remplir tous les champs obligatoires");
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

      // ✅ Mise à jour immédiate du state
      setPlats((prevPlats) =>
        prevPlats.map((p) => (p.id === platEdit.id ? response : p)),
      );

      setShowModal(false);
      setPlatEdit(null);
      resetForm();
      alert("Plat modifié avec succès");
    } catch (error) {
      alert("Erreur lors de la modification");
    } finally {
      setUploading(false);
    }
  };

  const handleSupprimer = async (id, nom) => {
    if (confirm(`Supprimer le plat "${nom}" ?`)) {
      try {
        await api.deletePlat(id);

        // ✅ Mise à jour immédiate du state
        setPlats((prevPlats) => prevPlats.filter((p) => p.id !== id));

        setShowActionMenu(null);
        alert("Plat supprimé avec succès");
      } catch (error) {
        alert("Erreur lors de la suppression");
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
    setImagePreview(
      plat.imageUrl ? `http://localhost:8080${plat.imageUrl}` : "",
    );
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-secondary">Chargement du menu...</div>
      </div>
    );
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
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">
              Menu Manager
            </h1>
            <p className="text-secondary text-sm">
              Gérez vos plats, boissons et disponibilités en temps réel.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setFiltreCategorie("TOUS");
                setFiltreEpuise(false);
              }}
              className={`px-4 py-1.5 rounded-xl transition-all text-sm ${
                filtreCategorie === "TOUS" && !filtreEpuise
                  ? "bg-surface-container-lowest shadow-sm text-primary font-semibold"
                  : "text-secondary hover:bg-surface-container-high font-medium"
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
                className={`px-4 py-1.5 rounded-xl transition-all text-sm ${
                  filtreCategorie === cat && !filtreEpuise
                    ? "bg-surface-container-lowest shadow-sm text-primary font-semibold"
                    : "text-secondary hover:bg-surface-container-high font-medium"
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
            {/* ✅ Bouton Épuisé avec BULLE EN TEMPS RÉEL (calcul direct) */}
            <button
              onClick={() => {
                setFiltreEpuise(!filtreEpuise);
                setFiltreCategorie("TOUS");
              }}
              className={`relative px-4 py-1.5 rounded-xl transition-all text-sm ${
                filtreEpuise
                  ? "bg-surface-container-lowest shadow-sm text-primary font-semibold"
                  : "text-secondary hover:bg-surface-container-high font-medium"
              }`}
            >
              Épuisé
              {/* ✅ BULLE : nombre de plats épuisés calculé DIRECTEMENT */}
              {nbEpuisesDirect > 0 && !filtreEpuise && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {nbEpuisesDirect > 99 ? "99+" : nbEpuisesDirect}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Rechercher un plat..."
            />
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* Add New Dish Card */}
          <button
            onClick={openAddModal}
            className="group relative flex flex-col items-center justify-center min-h-[340px] bg-transparent border-2 border-dashed border-outline-variant rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <span className="text-base font-bold font-headline text-on-surface">
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
                className="bg-surface-container-lowest rounded-2xl shadow-[0px_20px_40px_rgba(25,28,30,0.04)] border border-outline-variant/10 flex flex-col overflow-hidden transition-transform hover:-translate-y-1 relative"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  {plat.imageUrl ? (
                    <img
                      alt={plat.nom}
                      className="w-full h-full object-cover"
                      src={`http://localhost:8080/uploads/${plat.imageUrl?.split("/").pop() || ""}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x300/e2e8f0/64748b?text=Image+non+disponible";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold tracking-[0.05rem] uppercase bg-white/90 backdrop-blur px-2 py-0.5 rounded shadow-sm ${categorieClass}`}
                  >
                    {plat.categorie}
                  </span>
                  {estEpuise && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ÉPUISÉ
                      </span>
                    </div>
                  )}
                  {stockBas && !estEpuise && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      Stock bas: {plat.quantite}
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-extrabold font-headline text-on-surface leading-tight mb-1">
                    {plat.nom}
                  </h3>
                  <p className="text-xs text-secondary line-clamp-2 mb-3">
                    {plat.description || "Aucune description"}
                  </p>
                  <div className="flex justify-between items-end mt-auto">
                    <div className="space-y-0.5">
                      <div className="text-xl font-extrabold text-on-surface font-headline">
                        {formatPrix(plat.prix)}
                      </div>
                      <div
                        className={`text-xs font-medium ${estEpuise ? "text-error font-bold" : "text-secondary"}`}
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
                        <span className="material-symbols-outlined text-lg">
                          more_vert
                        </span>
                      </button>

                      {showActionMenu === plat.id && (
                        <div className="absolute bottom-8 right-0 bg-white rounded-xl shadow-lg border border-outline-variant/10 overflow-hidden z-10 min-w-[120px]">
                          <button
                            onClick={() => openEditModal(plat)}
                            className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition"
                          >
                            <span className="material-symbols-outlined text-base">
                              edit
                            </span>
                            Modifier
                          </button>
                          <button
                            onClick={() => handleSupprimer(plat.id, plat.nom)}
                            className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/5 flex items-center gap-2 transition"
                          >
                            <span className="material-symbols-outlined text-base">
                              delete
                            </span>
                            Supprimer
                          </button>
                          <button
                            onClick={() => setShowActionMenu(null)}
                            className="w-full px-4 py-2 text-left text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2 transition border-t border-outline-variant/10"
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

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
              <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight">
                {platEdit ? "Modifier le plat" : "Ajouter un Nouveau Plat"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              className="p-8 space-y-6"
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
                  className={`group relative h-40 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer text-center px-4 ${
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
                      <span className="material-symbols-outlined text-primary text-3xl">
                        add_a_photo
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-on-surface">
                          Glisser-déposer ou cliquer pour ajouter une photo
                        </p>
                        <p className="text-xs text-secondary font-medium">
                          Format recommandé : JPG, PNG (max. 5Mo)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Nom du plat */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold uppercase tracking-widest text-secondary">
                  Nom du plat
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className="w-full h-12 px-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50"
                  placeholder="Ex: Risotto aux Morilles"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold uppercase tracking-widest text-secondary">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline/50 resize-none"
                  placeholder="Décrivez les ingrédients et la préparation..."
                  rows="3"
                />
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold uppercase tracking-widest text-secondary">
                  Catégorie
                </label>
                <div className="relative">
                  <select
                    value={formData.categorie}
                    onChange={(e) =>
                      setFormData({ ...formData, categorie: e.target.value })
                    }
                    className="w-full h-12 px-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface appearance-none cursor-pointer"
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
              </div>

              {/* Prix et Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-label text-xs font-semibold uppercase tracking-widest text-secondary">
                    Prix (Ar)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100"
                      value={formData.prix}
                      onChange={(e) =>
                        setFormData({ ...formData, prix: e.target.value })
                      }
                      className="w-full h-12 pl-4 pr-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline font-medium">
                      Ar
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-label text-xs font-semibold uppercase tracking-widest text-secondary">
                    Quantité (Stock)
                  </label>
                  <input
                    type="number"
                    value={formData.quantite}
                    onChange={(e) =>
                      setFormData({ ...formData, quantite: e.target.value })
                    }
                    className="w-full h-12 px-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface"
                    placeholder="0"
                  />
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
                <label htmlFor="disponible" className="text-sm text-secondary">
                  Disponible à la commande
                </label>
              </div>
            </form>

            <div className="px-8 py-6 bg-surface-container-low/50 border-t border-outline-variant/10 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={platEdit ? handleModifier : handleAjouter}
                disabled={uploading}
                className="flex-1 h-12 bg-primary hover:bg-primary-container text-white font-headline font-bold rounded-xl transition-all shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50"
              >
                {uploading
                  ? "Upload en cours..."
                  : platEdit
                    ? "Modifier le plat"
                    : "Enregistrer le plat"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-12 bg-surface-container-highest hover:bg-surface-dim text-on-surface font-headline font-bold rounded-xl transition-all active:scale-95"
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
