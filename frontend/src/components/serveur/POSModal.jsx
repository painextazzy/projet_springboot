// src/components/serveur/POSModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";

// Configuration Cloudinary
const CLOUD_NAME = "dpq3tuhn2";

export default function POSModal({
  table,
  initialPanier = [],
  onUpdatePanier,
  onClose,
  onCommandeValidee,
}) {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorieActive, setCategorieActive] = useState("TOUS");
  const [recherche, setRecherche] = useState("");
  const [panier, setPanier] = useState(initialPanier);
  const [loading, setLoading] = useState(true);
  const [quantites, setQuantites] = useState({});
  const [tableOccupee, setTableOccupee] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [ticketId, setTicketId] = useState(Math.floor(Math.random() * 1000));
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const searchInputRef = useRef(null);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  useEffect(() => {
    chargerMenu();
  }, []);

  const chargerMenu = async () => {
    try {
      const data = await api.getMenu();
      setMenu(data);
      const cats = [...new Set(data.map((p) => p.categorie).filter((c) => c))];
      setCategories(cats);
    } catch (error) {
      console.error("Erreur chargement menu:", error);
      showNotification("Erreur de chargement du menu", "error");
    } finally {
      setLoading(false);
    }
  };

  const modifierQuantitePlat = (platId, delta) => {
    setQuantites((prev) => ({
      ...prev,
      [platId]: Math.max(1, (prev[platId] || 1) + delta),
    }));
  };

  const prendreTable = async () => {
    if (!tableOccupee) {
      try {
        await api.updateTableStatus(table.id, "OCCUPEE");
        setTableOccupee(true);
      } catch (error) {
        console.error("Erreur prise de table:", error);
      }
    }
  };

  const ajouterAuPanier = async (plat) => {
    const quantite = quantites[plat.id] || 1;
    if (quantite <= 0) return;

    if (plat.quantite < quantite) {
      showNotification(
        `Stock insuffisant pour ${plat.nom}. Stock: ${plat.quantite}`,
        "error",
      );
      return;
    }

    if (panier.length === 0 && !tableOccupee) {
      await prendreTable();
    }

    setPanier((prevPanier) => {
      const existing = prevPanier.find((item) => item.id === plat.id);
      if (existing) {
        return prevPanier.map((item) =>
          item.id === plat.id
            ? { ...item, quantite: item.quantite + quantite }
            : item,
        );
      } else {
        return [...prevPanier, { ...plat, quantite }];
      }
    });

    setQuantites((prev) => ({ ...prev, [plat.id]: 1 }));
    showNotification(`${quantite} x ${plat.nom} ajouté au panier`, "success");
  };

  const modifierQuantitePanier = (id, delta) => {
    setPanier((prevPanier) => {
      const item = prevPanier.find((p) => p.id === id);
      if (item) {
        const nouvelleQuantite = item.quantite + delta;
        if (nouvelleQuantite <= 0) {
          return prevPanier.filter((p) => p.id !== id);
        } else {
          return prevPanier.map((p) =>
            p.id === id ? { ...p, quantite: nouvelleQuantite } : p,
          );
        }
      }
      return prevPanier;
    });
  };

  const supprimerDuPanier = (id) => {
    setPanier((prevPanier) => prevPanier.filter((p) => p.id !== id));
  };

  const viderPanier = () => {
    if (confirm("Vider tout le panier ?")) {
      setPanier([]);
    }
  };

  const calculerTotal = () => {
    return panier.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  };

  const validerCommande = async () => {
    if (panier.length === 0) {
      showNotification("Veuillez ajouter des plats", "error");
      return;
    }
    setConfirmationOpen(true);
  };

  const confirmerCommande = async () => {
    setConfirmationOpen(false);
    try {
      const commande = {
        tableId: table.id,
        lignes: panier.map((item) => ({
          platId: item.id,
          quantite: item.quantite,
          prixUnitaire: item.prix,
        })),
      };

      const response = await api.createCommande(commande);
      await api.updateTableStatus(table.id, "LIBRE");

      setPanier([]);
      setTableOccupee(false);

      if (onCommandeValidee) {
        onCommandeValidee(response, table.id);
      }

      showNotification("Commande enregistrée, table libérée !", "success");
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      showNotification(
        error.message || "Erreur lors de l'enregistrement",
        "error",
      );
    }
  };

  const formatPrix = (prix) => {
    return `${prix.toLocaleString("fr-FR")} Ar`;
  };

  const getCategorieLabel = (categorie) => {
    switch (categorie) {
      case "ENTREE":
        return "Entrées";
      case "PLAT":
        return "Plats";
      case "DESSERT":
        return "Desserts";
      case "BOISSON":
        return "Boissons";
      default:
        return categorie;
    }
  };

  const platsFiltres = menu.filter((plat) => {
    if (categorieActive !== "TOUS" && plat.categorie !== categorieActive)
      return false;
    if (recherche && !plat.nom.toLowerCase().includes(recherche.toLowerCase()))
      return false;
    return plat.disponible;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-full shadow-lg transition-all duration-300 text-sm font-medium ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-primary text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Modal POS */}
      <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              Prise de commande
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Table {table.nom || table.numero} • Ticket #{ticketId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content - Responsive: colonne sur mobile, lignes sur desktop */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* LEFT COLUMN - Menu (prend tout l'espace sur mobile, 2/3 sur desktop) */}
          <div className="flex-1 flex flex-col h-full overflow-hidden lg:w-2/3">
            {/* Barre de recherche et catégories */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full md:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    search
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-slate-400"
                    placeholder="Rechercher un plat..."
                  />
                </div>

                <div className="flex flex-wrap gap-2 overflow-x-auto flex-1">
                  <button
                    onClick={() => setCategorieActive("TOUS")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      categorieActive === "TOUS"
                        ? "bg-primary text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategorieActive(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        categorieActive === cat
                          ? "bg-primary text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {getCategorieLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Menu Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {platsFiltres.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-secondary">
                    Aucun plat trouvé
                  </div>
                ) : (
                  platsFiltres.map((plat) => {
                    const stockStatus =
                      plat.quantite === 0
                        ? "Rupture"
                        : plat.quantite <= 5
                          ? `Stock: ${plat.quantite}`
                          : `${plat.quantite} en stock`;
                    const stockColor =
                      plat.quantite === 0
                        ? "text-red-500"
                        : plat.quantite <= 5
                          ? "text-orange-500"
                          : "text-green-600";

                    return (
                      <div
                        key={plat.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 flex flex-col"
                      >
                        <div className="h-32 sm:h-36 overflow-hidden bg-slate-100 relative">
                          {plat.imageUrl ? (
                            <img
                              src={plat.imageUrl}
                              alt={plat.nom}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/400x300/e2e8f0/64748b?text=🍽️";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-100">
                              🍽️
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-primary text-white rounded-lg px-2 py-1 text-xs font-bold shadow-lg">
                            {formatPrix(plat.prix)}
                          </div>
                        </div>
                        <div className="p-3 flex-1">
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {plat.nom}
                          </h3>
                          <p
                            className={`text-xs mt-1 ${stockColor} font-medium`}
                          >
                            {stockStatus}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center bg-slate-100 rounded-lg">
                              <button
                                onClick={() =>
                                  modifierQuantitePlat(plat.id, -1)
                                }
                                className="w-7 h-7 flex items-center justify-center text-primary hover:bg-white rounded-l-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  remove
                                </span>
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {quantites[plat.id] || 1}
                              </span>
                              <button
                                onClick={() => modifierQuantitePlat(plat.id, 1)}
                                className="w-7 h-7 flex items-center justify-center text-primary hover:bg-white rounded-r-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  add
                                </span>
                              </button>
                            </div>
                            <button
                              onClick={() => ajouterAuPanier(plat)}
                              disabled={plat.quantite <= 0}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Panier (fixe en bas sur mobile, colonne à droite sur desktop) */}
          <div className="w-full lg:w-1/3 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[40%] lg:h-full">
            {/* En-tête panier */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Commande en cours
                </h2>
                <p className="text-xs text-slate-400">Ticket #{ticketId}</p>
              </div>
              {panier.length > 0 && (
                <button
                  onClick={viderPanier}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">
                    delete_sweep
                  </span>
                  Vider
                </button>
              )}
            </div>

            {/* Liste des articles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {panier.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                    shopping_cart
                  </span>
                  <p className="text-slate-400 text-sm">Panier vide</p>
                </div>
              ) : (
                panier.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {item.nom}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPrix(item.prix)} x {item.quantite}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white rounded-lg">
                        <button
                          onClick={() => modifierQuantitePanier(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-l-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">
                            remove
                          </span>
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantite}
                        </span>
                        <button
                          onClick={() => modifierQuantitePanier(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-r-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                        </button>
                      </div>
                      <button
                        onClick={() => supprimerDuPanier(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total et validation */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-xl font-bold text-primary">
                  {formatPrix(calculerTotal())}
                </p>
              </div>
              <button
                onClick={validerCommande}
                disabled={panier.length === 0}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-base hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">receipt</span>
                Valider la commande
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {confirmationOpen && (
        <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 mx-4">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl text-green-600">
                  receipt
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirmer la commande
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Valider cette commande ?<br />
                <span className="font-bold text-primary">
                  {formatPrix(calculerTotal())}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmationOpen(false)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmerCommande}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
