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

    // Design original style ticket/caisse
    const factureHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture #${numeroFacture}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <style>
          @media print {
            body { background: white; margin: 0; padding: 0; }
            .no-print { display: none; }
          }
          .receipt-paper {
            background-image: radial-gradient(circle at 2px 2px, rgba(194, 198, 211, 0.1) 1px, transparent 0);
            background-size: 12px 12px;
          }
          .serrated-edge {
            clip-path: polygon(0% 0%, 5% 2%, 10% 0%, 15% 2%, 20% 0%, 25% 2%, 30% 0%, 35% 2%, 40% 0%, 45% 2%, 50% 0%, 55% 2%, 60% 0%, 65% 2%, 70% 0%, 75% 2%, 80% 0%, 85% 2%, 90% 0%, 95% 2%, 100% 0%, 100% 100%, 0% 100%);
          }
        </style>
      </head>
      <body class="font-body flex flex-col items-center justify-center p-4 bg-white">
        <div class="receipt-container w-full max-w-[320px] bg-white shadow-[0px_20px_40px_rgba(25,28,30,0.06)] rounded-lg overflow-hidden flex flex-col relative border border-gray-200">
          <div class="h-2 bg-gray-100 serrated-edge"></div>
          <div class="px-6 pt-8 pb-4 text-center border-b border-dashed border-gray-200">
            <div class="flex flex-col items-center gap-2 mb-4">
              <div class="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-1">
                <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">restaurant</span>
              </div>
              <h1 class="font-headline font-extrabold text-xl tracking-tight leading-tight text-black">Petite Bouffe</h1>
            </div>
            <div class="space-y-1 text-xs text-gray-500 font-medium">
              <p>N° Ticket: #${numeroFacture}</p>
              <div class="flex justify-center gap-2">
                <span>${dateStr}</span>
                <span class="text-gray-400">•</span>
                <span>${heureStr}</span>
              </div>
            </div>
          </div>
          <div class="px-6 py-6 receipt-paper">
            <table class="w-full text-xs font-medium border-collapse">
              <thead>
                <tr class="text-gray-500 font-label uppercase tracking-wider border-b border-gray-200">
                  <th class="text-left py-2 font-semibold">Art.</th>
                  <th class="text-center py-2 font-semibold">Qté</th>
                  <th class="text-right py-2 font-semibold">Prix</th>
                </tr>
              </thead>
              <tbody class="text-black">
                ${commande.lignes
                  ?.map(
                    (l) => `
                  <tr class="border-b border-gray-100">
                    <td class="py-3 pr-2 align-top font-semibold text-[13px]">${l.platNom}</td>
                    <td class="py-3 text-center align-top">${l.quantite}</td>
                    <td class="py-3 text-right align-top">${(l.prixUnitaire * l.quantite).toLocaleString("fr-FR")}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="mt-6 pt-4 space-y-2">
              <div class="flex justify-between text-[11px] text-gray-500 font-medium px-1">
                <span>Sous-total</span>
                <span>${total.toLocaleString("fr-FR")} Ar</span>
              </div>
              <div class="mt-4 p-4 rounded-xl flex flex-col items-center justify-center text-white shadow-lg bg-black shadow-black/20">
                <span class="text-[10px] font-label uppercase tracking-[0.1rem] opacity-80 mb-1">Total Final</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-headline font-extrabold tracking-tight">${total.toLocaleString("fr-FR")}</span>
                  <span class="text-sm font-bold">Ar</span>
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 py-8 text-center border-t border-dashed border-gray-200 mt-auto">
            <p class="font-headline font-bold text-sm text-black mb-1">Merci de votre visite !</p>
            <p class="text-[10px] font-medium text-gray-500 italic tracking-wide">Au plaisir de vous revoir chez Petite Bouffe.</p>
            <div class="mt-6 flex justify-center gap-1 opacity-20 h-10 overflow-hidden">
              <div class="w-1 bg-black h-full"></div>
              <div class="w-2 bg-black h-full"></div>
              <div class="w-0.5 bg-black h-full"></div>
              <div class="w-1.5 bg-black h-full"></div>
              <div class="w-3 bg-black h-full"></div>
              <div class="w-1 bg-black h-full"></div>
              <div class="w-0.5 bg-black h-full"></div>
              <div class="w-2 bg-black h-full"></div>
              <div class="w-1.5 bg-black h-full"></div>
              <div class="w-0.5 bg-black h-full"></div>
              <div class="w-1 bg-black h-full"></div>
              <div class="w-2 bg-black h-full"></div>
              <div class="w-1 bg-black h-full"></div>
              <div class="w-0.5 bg-black h-full"></div>
              <div class="w-2 bg-black h-full"></div>
            </div>
            <p class="mt-2 text-[8px] font-mono text-gray-400 tracking-widest">TRX-${Math.floor(Math.random() * 10000000)}-MADA</p>
          </div>
          <div class="h-2 bg-gray-100 serrated-edge rotate-180"></div>
        </div>
        <div class="no-print mt-8 flex gap-4">
          <button class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-sm border border-gray-200" onclick="window.print()">
            <span class="material-symbols-outlined text-lg">print</span>
            <span class="text-sm">Imprimer le ticket</span>
          </button>
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
              : notification.type === "info"
                ? "bg-blue-500 text-white"
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
