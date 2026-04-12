import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import webSocketService from "../../services/websocketService";

export default function GestionCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("TOUS");
  const [recherche, setRecherche] = useState("");
  const [notification, setNotification] = useState(null);

  const nbCommandesEnCours = commandes.filter(
    (cmd) => cmd.statut === "EN_COURS",
  ).length;

  // Chargement initial + WebSocket
  useEffect(() => {
    chargerCommandes();
    webSocketService.connect();

    const unsubscribe = webSocketService.subscribe(() => {
      console.log("🔄 WebSocket: rechargement des commandes");
      chargerCommandes();
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  const chargerCommandes = async () => {
    try {
      const data = await api.getCommandes();
      setCommandes(data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const genererFacture = (commande) => {
    const date = new Date(commande.dateCloture || new Date());
    const dateStr = date.toLocaleDateString("fr-FR");
    const heureStr = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const numeroFacture =
      commande.numeroFacture ||
      `2024-${commande.id.toString().padStart(4, "0")}`;
    const total = commande.total || 0;

    const factureHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture #${numeroFacture}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <style>
          @media print { body { background: white; margin: 0; padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body class="p-8">
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 class="text-2xl font-bold text-center mb-4">Petite Bouffe</h1>
          <p class="text-center text-gray-600 mb-2">Facture #${numeroFacture}</p>
          <p class="text-center text-gray-500 text-sm mb-4">${dateStr} à ${heureStr}</p>
          <div class="border-t border-b py-2 my-4">
            ${commande.lignes
              ?.map(
                (l) => `
              <div class="flex justify-between py-1">
                <span>${l.platNom} x${l.quantite}</span>
                <span>${(l.prixUnitaire * l.quantite).toLocaleString(
                  "fr-FR",
                )} Ar</span>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toLocaleString("fr-FR")} Ar</span>
          </div>
          <div class="text-center text-gray-500 text-sm mt-6">Merci de votre visite !</div>
        </div>
        <div class="text-center mt-4 no-print">
          <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded">Imprimer</button>
        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(factureHTML);
    win.document.close();
  };

  const encaisserCommande = async (commandeId, tableId) => {
    if (confirm("Valider le paiement de cette commande ?")) {
      try {
        const commandePayee = await api.payerCommande(commandeId);
        await api.updateTableStatus(tableId, "LIBRE");

        genererFacture(commandePayee);

        setNotification({
          message: `Commande #${commandeId} payée, facture générée`,
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        setNotification({
          message: "Erreur lors de l'encaissement",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const commandesFiltrees = commandes.filter((commande) => {
    if (filtre === "EN_COURS" && commande.statut !== "EN_COURS") return false;
    if (filtre === "PAYEE" && commande.statut !== "PAYEE") return false;
    if (recherche) {
      const searchLower = recherche.toLowerCase();
      const idMatch = commande.id.toString().includes(searchLower);
      const tableMatch = (commande.tableNom || "")
        .toLowerCase()
        .includes(searchLower);
      if (!idMatch && !tableMatch) return false;
    }
    return true;
  });

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "EN_COURS":
        return "bg-[#FFF9E6] text-[#D97706]";
      case "PAYEE":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "EN_COURS":
        return "EN COURS";
      case "PAYEE":
        return "PAYÉ";
      default:
        return statut;
    }
  };

  const formatHeure = (dateString) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-secondary">Chargement des commandes...</div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <div
          className={`fixed top-24 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <section className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center p-1 bg-surface-container-highest/60 rounded-lg w-fit">
            <button
              onClick={() => setFiltre("TOUS")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                filtre === "TOUS"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFiltre("EN_COURS")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                filtre === "EN_COURS"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              En cours
              {nbCommandesEnCours > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {nbCommandesEnCours > 99 ? "99+" : nbCommandesEnCours}
                </span>
              )}
            </button>
            <button
              onClick={() => setFiltre("PAYEE")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                filtre === "PAYEE"
                  ? "bg-white shadow-sm text-primary"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Payé
            </button>
          </div>

          <div className="relative group w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary/60 text-lg">
              search
            </span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-container-highest/60 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-secondary/50 font-normal"
              placeholder="Rechercher une commande, une table..."
            />
          </div>
        </section>

        <div className="bg-white rounded-2xl shadow-[0px_4px_24px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/15">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-6 text-[0.65rem] font-medium text-secondary/60 uppercase tracking-[0.15em]">
                    N° Facture
                  </th>
                  <th className="px-6 py-6 text-[0.65rem] font-medium text-secondary/60 uppercase tracking-[0.15em]">
                    Table
                  </th>
                  <th className="px-6 py-6 text-[0.65rem] font-medium text-secondary/60 uppercase tracking-[0.15em]">
                    Heure
                  </th>
                  <th className="px-6 py-6 text-[0.65rem] font-medium text-secondary/60 uppercase tracking-[0.15em]">
                    Montant
                  </th>
                  <th className="px-6 py-6 text-[0.65rem] font-medium text-secondary/60 uppercase tracking-[0.15em]">
                    Statut
                  </th>
                  <th className="px-8 py-6 text-[0.65rem] font-medium text-secondary/60 uppercase tracking-[0.15em] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {commandesFiltrees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-secondary"
                    >
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  commandesFiltrees.map((commande) => (
                    <tr
                      key={commande.id}
                      className="hover:bg-surface-container-low/30 transition-colors group"
                    >
                      <td className="px-6 py-7 font-medium text-primary tracking-tight">
                        #{commande.numeroFacture || commande.id}
                      </td>
                      <td className="px-6 py-7">
                        <span className="flex items-center gap-2 font-normal text-on-surface">
                          <span className="material-symbols-outlined text-[20px] text-on-surface/70">
                            table_restaurant
                          </span>
                          {commande.tableNom || `Table ${commande.tableId}`}
                        </span>
                      </td>
                      <td className="px-6 py-7 font-normal text-secondary/70 text-sm">
                        {formatHeure(commande.dateOuverture)}
                      </td>
                      <td className="px-6 py-7 font-medium text-on-surface">
                        {(commande.total || 0).toLocaleString("fr-FR")} Ar
                      </td>
                      <td className="px-6 py-7">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-[0.65rem] font-semibold uppercase tracking-wider ${getStatutBadge(
                            commande.statut,
                          )}`}
                        >
                          {getStatutLabel(commande.statut)}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex items-center justify-end">
                          {commande.statut === "EN_COURS" && (
                            <button
                              onClick={() =>
                                encaisserCommande(commande.id, commande.tableId)
                              }
                              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-[0.7rem] font-medium shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                payments
                              </span>
                              <span>Encaisser</span>
                            </button>
                          )}
                          {commande.statut === "PAYEE" && (
                            <button
                              onClick={() => genererFacture(commande)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-500 text-white text-[0.7rem] font-medium shadow-sm hover:bg-gray-600 transition-all active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                print
                              </span>
                              <span>Imprimer</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="px-6 py-6 bg-white border-t border-outline-variant/10 flex items-center justify-between">
            <span className="text-[0.7rem] text-secondary/60 font-normal tracking-tight">
              Affichage de {commandesFiltrees.length} sur {commandes.length}{" "}
              commandes
            </span>
          </footer>
        </div>
      </div>
    </>
  );
}
