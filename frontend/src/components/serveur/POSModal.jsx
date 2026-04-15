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
  const [showCart, setShowCart] = useState(false);

  const searchInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  // Sauvegarder le panier dans le parent
  useEffect(() => {
    if (onUpdatePanier) {
      onUpdatePanier(panier);
    }
  }, [panier, onUpdatePanier]);

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

  const validerCommande = () => {
    if (panier.length === 0) {
      showNotification("Veuillez ajouter des plats", "error");
      return;
    }
    setConfirmationOpen(true);
  };

  const confirmerCommande = async () => {
    setConfirmationOpen(false);
    setShowCart(false);
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
      <div className="fixed inset-0 z-50 bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  // Vue Panier sur mobile
  if (showCart) {
    return (
      <div className="fixed inset-0 z-50 bg-surface flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative overflow-hidden">
          <header className="pt-4 pb-2 px-6 flex justify-between items-center bg-surface sticky top-0 z-50 border-b border-outline-variant/10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCart(false)}
                className="material-symbols-outlined text-on-surface p-2 -ml-2 hover:bg-surface-container rounded-full transition-colors"
              >
                arrow_back
              </button>
              <h1 className="font-headline font-extrabold text-xl tracking-tight text-on-surface">
                Votre Panier
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                Table
              </span>
              <span className="font-headline text-xl font-extrabold text-on-surface leading-none">
                {table.nom || table.numero}
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {panier.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
                  shopping_basket
                </span>
                <p className="text-secondary">Votre panier est vide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {panier.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline text-base font-bold text-on-surface">
                          {item.nom}
                        </h3>
                        <p className="text-primary font-semibold text-sm">
                          {formatPrix(item.prix)}
                        </p>
                      </div>
                      <button
                        onClick={() => supprimerDuPanier(item.id)}
                        className="text-error hover:bg-error/10 p-2 rounded-full transition-all"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-lowest rounded-lg p-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => modifierQuantitePanier(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface hover:bg-outline-variant transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">
                            remove
                          </span>
                        </button>
                        <span className="font-headline font-bold text-base min-w-[1.5rem] text-center">
                          {item.quantite}
                        </span>
                        <button
                          onClick={() => modifierQuantitePanier(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-container text-on-primary-container hover:bg-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">
                            add
                          </span>
                        </button>
                      </div>
                      <p className="font-headline font-extrabold text-on-surface">
                        {formatPrix(item.prix * item.quantite)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {panier.length > 0 && (
              <div className="mt-6 p-5 bg-surface-container-highest rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-secondary font-medium">Sous-total</span>
                  <span className="text-on-surface font-semibold">
                    {formatPrix(calculerTotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30">
                  <span className="font-headline text-lg font-bold text-on-surface">
                    Total à régler
                  </span>
                  <span className="font-headline text-xl font-extrabold text-primary">
                    {formatPrix(calculerTotal())}
                  </span>
                </div>
              </div>
            )}
          </main>

          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8">
            <button
              onClick={validerCommande}
              disabled={panier.length === 0}
              className="w-full h-14 bg-gradient-to-br from-[#00307d] to-[#0045ab] text-white rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="font-headline font-bold text-base uppercase tracking-wider">
                Demander l'Addition
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue principale - Design grand écran (menu à gauche, ticket à droite)
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

      {/* Modal POS - Layout grand écran */}
      <div className="fixed inset-0 z-50 bg-surface flex flex-col overflow-hidden">
        {/* Top Control Row */}
        <div className="h-20 w-full flex justify-between items-center px-8 z-50 bg-surface border-b border-outline-variant/10">
          <div className="flex items-center bg-surface-container-highest px-4 py-2.5 rounded-xl w-80 group focus-within:bg-surface-container-lowest transition-all focus-within:ring-1 focus-within:ring-outline-variant/50">
            <span className="material-symbols-outlined text-secondary mr-2">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-secondary outline-none"
              placeholder="Rechercher un produit..."
            />
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors group"
          >
            <span className="material-symbols-outlined text-on-surface text-3xl group-active:scale-90 transition-transform">
              close
            </span>
          </button>
        </div>

        <main className="flex-1 flex overflow-hidden">
          {/* Left: Menu Grid & Controls */}
          <section className="flex-1 overflow-y-auto p-8 pt-2 bg-surface space-y-8">
            {/* Category Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setCategorieActive("TOUS")}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all ${
                  categorieActive === "TOUS"
                    ? "bg-primary text-on-primary shadow-lg"
                    : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategorieActive(cat)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all ${
                    categorieActive === cat
                      ? "bg-primary text-on-primary shadow-lg"
                      : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
                  }`}
                >
                  {getCategorieLabel(cat)}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {platsFiltres.length === 0 ? (
                <div className="col-span-full text-center py-12 text-secondary">
                  Aucun plat trouvé
                </div>
              ) : (
                platsFiltres.map((plat) => (
                  <div
                    key={plat.id}
                    className="bg-surface-container-low rounded-xl overflow-hidden group hover:shadow-[0px_20px_40px_rgba(25,28,30,0.06)] transition-all flex flex-col"
                  >
                    <div className="h-40 overflow-hidden relative">
                      {plat.imageUrl ? (
                        <img
                          src={plat.imageUrl}
                          alt={plat.nom}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                      <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold font-label tracking-wider text-primary">
                        STOCK: {plat.quantite}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-headline font-bold text-on-surface text-base">
                          {plat.nom}
                        </h3>
                        <p className="text-primary font-bold mt-1 font-body">
                          {formatPrix(plat.prix)}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center bg-surface-container-highest rounded-lg px-2 py-1">
                          <button
                            onClick={() => modifierQuantitePlat(plat.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              remove
                            </span>
                          </button>
                          <span className="px-3 text-xs font-bold font-body">
                            {quantites[plat.id] || 1}
                          </span>
                          <button
                            onClick={() => modifierQuantitePlat(plat.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              add
                            </span>
                          </button>
                        </div>
                        <button
                          onClick={() => ajouterAuPanier(plat)}
                          disabled={plat.quantite <= 0}
                          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold font-headline uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right: Current Order Ticket */}
          <aside className="w-96 bg-surface-container-low flex flex-col shadow-[20px_0px_40px_rgba(25,28,30,0.03)] z-40 border-l border-outline-variant/10">
            <div className="p-6 flex items-center justify-between border-b border-outline-variant/10">
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Ticket Actuel
              </h2>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest font-label">
                TABLE #{table.nom || table.numero}
              </span>
            </div>

            {/* Order Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {panier.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                    shopping_cart
                  </span>
                  <p className="text-slate-400 text-sm">Aucun article</p>
                </div>
              ) : (
                panier.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold font-headline text-on-surface">
                        {item.nom}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-surface-container-high rounded-lg p-0.5">
                          <button
                            onClick={() => modifierQuantitePanier(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">
                              remove
                            </span>
                          </button>
                          <span className="px-3 text-xs font-bold font-body">
                            {item.quantite}
                          </span>
                          <button
                            onClick={() => modifierQuantitePanier(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">
                              add
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold font-body text-on-surface">
                        {formatPrix(item.prix * item.quantite)}
                      </p>
                      <button
                        onClick={() => supprimerDuPanier(item.id)}
                        className="text-error/60 hover:text-error transition-colors mt-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ticket Footer */}
            <div className="p-6 bg-surface-container-high space-y-4 border-t border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-headline text-on-surface tracking-tight">
                  Total Final
                </span>
                <span className="text-2xl font-extrabold font-headline text-primary">
                  {formatPrix(calculerTotal())}
                </span>
              </div>
              <button
                onClick={validerCommande}
                disabled={panier.length === 0}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-lg font-headline font-bold text-sm tracking-widest uppercase shadow-[0px_20px_40px_rgba(0,48,125,0.2)] transition-transform active:scale-95 disabled:opacity-50"
              >
                Addition
              </button>
            </div>
          </aside>
        </main>
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
