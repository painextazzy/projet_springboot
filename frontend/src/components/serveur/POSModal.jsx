// src/components/serveur/POSModal.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const isFirstRender = useRef(true);
  const prevPanierRef = useRef(initialPanier);
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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPanierRef.current = panier;
      return;
    }

    if (JSON.stringify(prevPanierRef.current) !== JSON.stringify(panier)) {
      prevPanierRef.current = panier;
      if (onUpdatePanier) {
        onUpdatePanier(panier);
      }
    }
  }, [panier, onUpdatePanier]);

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
        showNotification(
          `Table ${table.nom || table.numero} occupée`,
          "success",
        );
      } catch (error) {
        console.error("Erreur prise de table:", error);
        showNotification("Erreur lors de la prise de table", "error");
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
      <div className="fixed inset-0 z-50 bg-surface-bright flex items-center justify-center">
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
              ? "bg-error text-white"
              : "bg-primary text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* App Container - Style iPhone */}
      <div className="fixed inset-0 z-50 bg-surface-bright flex flex-col h-full max-w-md mx-auto shadow-2xl overflow-hidden">
        {/* TopAppBar */}
        <header className="pt-4 pb-2 px-6 flex justify-between items-center bg-surface-bright sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="material-symbols-outlined text-on-surface p-2 -ml-2 hover:bg-surface-container rounded-full transition-colors"
            >
              close
            </button>
            <h1 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">
              Executive POS
            </h1>
          </div>
          <div className="relative">
            <button
              onClick={() => viderPanier()}
              className="relative p-2 hover:bg-surface-container rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">
                shopping_basket
              </span>
              {panier.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs flex items-center justify-center rounded-full shadow-md font-bold">
                  {panier.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-6 space-y-6 pb-32">
          {/* Search Bar */}
          <div className="relative mt-2">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-surface-container-high focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base placeholder:text-on-surface-variant/60"
              placeholder="Rechercher un article..."
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <section className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            <button
              onClick={() => setCategorieActive("TOUS")}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all ${
                categorieActive === "TOUS"
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategorieActive(cat)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  categorieActive === cat
                    ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {getCategorieLabel(cat)}
              </button>
            ))}
          </section>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4">
            {platsFiltres.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-secondary">
                Aucun plat trouvé
              </div>
            ) : (
              platsFiltres.map((plat) => (
                <div
                  key={plat.id}
                  className="bg-white rounded-3xl p-3 shadow-sm border border-surface-container-high flex flex-col gap-3 group"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container relative">
                    {plat.imageUrl ? (
                      <img
                        src={plat.imageUrl}
                        alt={plat.nom}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/400x300/e2e8f0/64748b?text=🍽️";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-container">
                        🍽️
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex items-center bg-primary text-on-primary rounded-lg px-2 py-1 text-xs font-bold shadow-lg">
                      {formatPrix(plat.prix)}
                    </div>
                  </div>
                  <div className="flex flex-col px-1">
                    <h3 className="text-sm font-bold text-on-surface leading-tight">
                      {plat.nom}
                    </h3>
                    <p className="text-[11px] text-secondary font-medium">
                      {getCategorieLabel(plat.categorie)}
                    </p>
                  </div>
                  <div className="flex justify-end px-1 mb-0.5">
                    <span
                      className={`text-[10px] font-medium ${plat.quantite <= 0 ? "text-error" : plat.quantite <= 5 ? "text-amber-600" : "text-secondary/70"}`}
                    >
                      Stock: {plat.quantite}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-1 mt-1">
                    <button
                      onClick={() => modifierQuantitePlat(plat.id, -1)}
                      className="material-symbols-outlined text-base p-1.5 hover:bg-surface-container-high rounded-lg transition-colors text-primary"
                    >
                      remove
                    </button>
                    <span className="text-sm font-bold px-2">
                      {quantites[plat.id] || 1}
                    </span>
                    <button
                      onClick={() => ajouterAuPanier(plat)}
                      disabled={plat.quantite <= 0}
                      className="material-symbols-outlined text-base p-1.5 bg-primary text-on-primary rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Floating Order Summary Button */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] pointer-events-none px-6 pb-6">
          <button
            onClick={validerCommande}
            disabled={panier.length === 0}
            className="w-full pointer-events-auto bg-[#00307d] text-white py-4 rounded-2xl flex items-center justify-between px-6 shadow-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl">
                shopping_basket
              </span>
              <span className="font-bold">Voir le panier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {formatPrix(calculerTotal())}
              </span>
              <span className="bg-white/20 rounded-full px-2 py-1 text-xs font-bold">
                {panier.length}
              </span>
            </div>
          </button>
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
