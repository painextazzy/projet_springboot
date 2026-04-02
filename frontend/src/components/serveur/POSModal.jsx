// src/components/serveur/POSModal.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../services/api";

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

  // Utiliser useRef pour éviter les appels infinis
  const isFirstRender = useRef(true);
  const prevPanierRef = useRef(initialPanier);

  const searchInputRef = useRef(null);

  // Charger le menu
  useEffect(() => {
    chargerMenu();
  }, []);

  // Mettre à jour le parent UNIQUEMENT quand le panier change réellement
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
      alert(`Stock insuffisant pour ${plat.nom}`);
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
      alert("Veuillez ajouter des plats");
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

      alert("Commande enregistrée, table libérée !");
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.message || "Erreur lors de l'enregistrement");
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

  // Grouper les plats par catégorie
  const platsParCategorie = {};
  platsFiltres.forEach((plat) => {
    const cat = plat.categorie || "AUTRE";
    if (!platsParCategorie[cat]) platsParCategorie[cat] = [];
    platsParCategorie[cat].push(plat);
  });

  const categoriesDisponibles = Object.keys(platsParCategorie).sort();

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
      {/* Main Fullscreen Container */}
      <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
        {/* Header avec titre et bouton X */}

        {/* Content Layout - 2 colonnes */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Menu Items */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
            {/* Barre de recherche à gauche + catégories en chips */}
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

            {/* Scrollable Menu Content */}
            <main className="flex-1 overflow-y-auto p-6 space-y-8">
              {platsFiltres.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
                    restaurant_menu
                  </span>
                  <p className="text-slate-500">Aucun plat trouvé</p>
                </div>
              ) : categorieActive === "TOUS" ? (
                categoriesDisponibles.map((cat) => (
                  <section key={cat}>
                    <h2 className="text-xl font-bold font-display mb-4 border-l-4 border-primary pl-3">
                      {getCategorieLabel(cat)}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {platsParCategorie[cat].map((plat) => (
                        <PlatCard
                          key={plat.id}
                          plat={plat}
                          quantite={quantites[plat.id] || 1}
                          onModifierQuantite={(delta) =>
                            modifierQuantitePlat(plat.id, delta)
                          }
                          onAjouter={() => ajouterAuPanier(plat)}
                          formatPrix={formatPrix}
                        />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {platsFiltres.map((plat) => (
                    <PlatCard
                      key={plat.id}
                      plat={plat}
                      quantite={quantites[plat.id] || 1}
                      onModifierQuantite={(delta) =>
                        modifierQuantitePlat(plat.id, delta)
                      }
                      onAjouter={() => ajouterAuPanier(plat)}
                      formatPrix={formatPrix}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>

          {/* Right Column: Ticket */}
          <aside className="w-full md:w-[380px] bg-white border-l border-slate-200 flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {table.nom || `Table ${table.numero}`}
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  Commande en cours
                </h2>
                <p className="text-xs text-slate-400">Ticket #{ticketId}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Produit</div>
                <div className="col-span-3 text-center">Qté</div>
                <div className="col-span-3 text-right">Prix</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {panier.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                    shopping_cart
                  </span>
                  <p className="text-slate-400 text-sm">Panier vide</p>
                </div>
              ) : (
                panier.map((item) => (
                  <div key={item.id} className="group flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-12 items-center">
                      <div className="col-span-6">
                        <p className="text-sm font-medium text-slate-800">
                          {item.nom}
                        </p>
                      </div>
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => modifierQuantitePanier(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            remove
                          </span>
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantite}
                        </span>
                        <button
                          onClick={() => modifierQuantitePanier(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                        </button>
                      </div>
                      <div className="col-span-3 text-right">
                        <p className="text-sm font-medium text-slate-800">
                          {formatPrix(item.prix * item.quantite)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => supprimerDuPanier(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-slate-200 bg-white">
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrix(calculerTotal())}
                </p>
              </div>
              <button
                onClick={validerCommande}
                disabled={panier.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-base hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">receipt</span>
                Addition
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de confirmation */}
      {confirmationOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
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

// Composant PlatCard avec affichage du stock
// Composant PlatCard avec affichage du stock - bouton aligné
const PlatCard = ({
  plat,
  quantite,
  onModifierQuantite,
  onAjouter,
  formatPrix,
}) => {
  const getStockColor = (stock) => {
    if (stock <= 0) return "text-red-500";
    if (stock <= 5) return "text-orange-500";
    return "text-green-600";
  };

  const getStockText = (stock) => {
    if (stock <= 0) return "Rupture";
    if (stock <= 5) return `Stock: ${stock}`;
    return `${stock} en stock`;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-primary/30 flex flex-col h-full">
      <div className="h-44 overflow-hidden bg-slate-100">
        {plat.imageUrl ? (
          <img
            src={`http://localhost:8080${plat.imageUrl}`}
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
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-base line-clamp-1">{plat.nom}</h3>
          <span className="font-bold text-primary text-sm">
            {formatPrix(plat.prix)}
          </span>
        </div>
        <p
          className={`text-xs mb-3 ${getStockColor(plat.quantite)} font-medium`}
        >
          {getStockText(plat.quantite)}
        </p>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center bg-slate-100 rounded-lg h-8">
            <button
              onClick={() => onModifierQuantite(-1)}
              className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white hover:shadow-sm rounded-l-lg transition-all"
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {quantite}
            </span>
            <button
              onClick={() => onModifierQuantite(1)}
              className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white hover:shadow-sm rounded-r-lg transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <button
            onClick={onAjouter}
            disabled={plat.quantite <= 0}
            className="flex-1 h-8 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};
