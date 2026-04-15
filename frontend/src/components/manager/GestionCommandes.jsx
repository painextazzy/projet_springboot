// src/components/manager/GestionCommandes.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../services/api";
import webSocketService from "../../services/websocketService";
import Facture from "./Facture";
import SkeletonCommandes from "./skeletons/SkeletonCommandes";

export default function GestionCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("TOUS");
  const [recherche, setRecherche] = useState("");
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [factureData, setFactureData] = useState(null);
  const notificationTimeout = useRef(null);

  const nbCommandesEnCours = useCallback(
    () => commandes.filter((cmd) => cmd.statut === "EN_COURS").length,
    [commandes],
  );

  // ✅ WebSocket : mise à jour ciblée pour les commandes
  useEffect(() => {
    chargerCommandes();
    webSocketService.connect();

    const unsubscribe = webSocketService.subscribe((data) => {
      console.log("🔄 WebSocket commandes reçu:", data);
      // Rechargement uniquement quand nécessaire
      if (data === "REFRESH" || data === "COMMANDE_UPDATED") {
        chargerCommandes();
      }
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
      if (notificationTimeout.current)
        clearTimeout(notificationTimeout.current);
    };
  }, []);

  const chargerCommandes = async () => {
    setLoading(true);
    try {
      const data = await api.getCommandes();
      setCommandes(data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    setNotification({ message, type });
    notificationTimeout.current = setTimeout(() => setNotification(null), 3000);
  };

  const encaisserCommande = async (commandeId, tableId) => {
    if (isProcessing) return;
    if (!confirm("Valider le paiement de cette commande ?")) return;
    setIsProcessing(true);
    try {
      const commandePayee = await api.payerCommande(commandeId);
      if (tableId)
        await api
          .updateTableStatus(tableId, "LIBRE")
          .catch((e) => console.warn(e));

      let commandePourFacture = commandePayee;
      if (!commandePayee.lignes?.length)
        commandePourFacture = await api.getCommandeById(commandeId);

      await chargerCommandes();
      if (commandePourFacture?.id) {
        showNotification(
          `Commande #${commandeId} payée avec succès`,
          "success",
        );
        setFactureData(commandePourFacture);
      }
    } catch (error) {
      showNotification("Erreur lors de l'encaissement", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const commandesFiltrees = commandes.filter((c) => {
    if (filtre === "EN_COURS" && c.statut !== "EN_COURS") return false;
    if (filtre === "PAYEE" && c.statut !== "PAYEE") return false;
    if (recherche) {
      const search = recherche.toLowerCase();
      return (
        c.id.toString().includes(search) ||
        (c.tableNom || "").toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getStatutBadge = (statut) => {
    if (statut === "EN_COURS")
      return "bg-amber-50 text-amber-800/70 border border-amber-200/50";
    if (statut === "PAYEE")
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
    return "bg-gray-100 text-gray-500 border border-gray-200";
  };

  const getStatutLabel = (statut) =>
    statut === "EN_COURS" ? "EN COURS" : statut === "PAYEE" ? "PAYÉ" : statut;
  const formatHeure = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";

  if (loading) return <SkeletonCommandes />;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
      {notification && (
        <div
          className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${notification.type === "error" ? "bg-red-500 text-white" : notification.type === "info" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"}`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {notification.type === "error"
                ? "error"
                : notification.type === "info"
                  ? "info"
                  : "check_circle"}
            </span>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {factureData && (
        <Facture commande={factureData} onClose={() => setFactureData(null)} />
      )}

      <section className="mb-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center p-1 bg-gray-50/60 backdrop-blur-md rounded-xl border border-gray-100">
          {["TOUS", "EN_COURS", "PAYEE"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`px-7 py-2 rounded-[10px] text-sm font-medium transition-all duration-300 ${filtre === f ? "bg-white shadow-sm text-[#002868]" : "text-gray-400 hover:text-gray-600"}`}
            >
              {f === "TOUS" ? "Tous" : f === "EN_COURS" ? "En cours" : "Payé"}
              {f === "EN_COURS" &&
                nbCommandesEnCours() > 0 &&
                filtre !== "EN_COURS" && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {nbCommandesEnCours()}
                  </span>
                )}
            </button>
          ))}
        </div>
        <div className="relative group w-full max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-300 text-xl">
            search
          </span>
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full pl-11 pr-6 py-3 bg-white/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#002868]/20 focus:bg-white transition-all duration-300 text-sm placeholder:text-gray-300 font-light outline-none"
            placeholder="Rechercher une commande..."
          />
        </div>
      </section>

      <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-10 py-6 text-[0.65rem] font-medium text-gray-400 uppercase tracking-[0.15em]">
                  N° Facture
                </th>
                <th className="px-8 py-6 text-[0.65rem] font-medium text-gray-400 uppercase tracking-[0.15em]">
                  Table
                </th>
                <th className="px-8 py-6 text-[0.65rem] font-medium text-gray-400 uppercase tracking-[0.15em]">
                  Heure
                </th>
                <th className="px-8 py-6 text-[0.65rem] font-medium text-gray-400 uppercase tracking-[0.15em]">
                  Montant
                </th>
                <th className="px-8 py-6 text-[0.65rem] font-medium text-gray-400 uppercase tracking-[0.15em]">
                  Statut
                </th>
                <th className="px-10 py-6 text-[0.65rem] font-medium text-gray-400 uppercase tracking-[0.15em] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commandesFiltrees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-10 py-16 text-center text-gray-300"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl">
                        receipt
                      </span>
                      <span className="text-sm font-light">
                        Aucune commande trouvée
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                commandesFiltrees.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/30 transition-all duration-300 group"
                  >
                    <td className="px-10 py-7">
                      <span className="text-[0.9rem] font-medium text-[#002868] tracking-tight">
                        #{c.numeroFacture || c.id}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <span className="flex items-center gap-3 font-normal text-gray-700">
                        <span className="material-symbols-outlined text-xl text-gray-300">
                          table_bar
                        </span>
                        {c.tableNom || `Table ${c.tableId}`}
                      </span>
                    </td>
                    <td className="px-8 py-7 font-light text-gray-400 text-sm tracking-tight">
                      {formatHeure(c.dateOuverture)}
                    </td>
                    <td className="px-8 py-7">
                      <span className="text-[1rem] font-medium text-gray-800">
                        {(c.total || 0).toLocaleString("fr-FR")}
                        <span className="text-[0.75rem] font-light text-gray-400 ml-0.5">
                          Ar
                        </span>
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-[0.65rem] font-medium uppercase tracking-widest ${getStatutBadge(c.statut)}`}
                      >
                        {getStatutLabel(c.statut)}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center justify-end">
                        {c.statut === "EN_COURS" && (
                          <button
                            onClick={() => encaisserCommande(c.id, c.tableId)}
                            disabled={isProcessing}
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-[#002868] text-white text-[0.7rem] font-medium shadow-sm hover:bg-[#001a4a] transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              payments
                            </span>
                            <span>Encaisser</span>
                          </button>
                        )}
                        {c.statut === "PAYEE" && (
                          <button
                            onClick={() => setFactureData(c)}
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-[0.7rem] font-medium hover:bg-gray-200 transition-all duration-300 active:scale-[0.97]"
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
        <footer className="px-10 py-8 bg-gray-50/10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-[0.75rem] text-gray-400 font-light tracking-tight">
            Affichage de{" "}
            <span className="text-[#002868] font-medium">
              {commandesFiltrees.length}
            </span>{" "}
            sur{" "}
            <span className="text-gray-700 font-medium">
              {commandes.length}
            </span>{" "}
            commandes
          </span>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-300 hover:text-[#002868] hover:bg-gray-50 transition-all duration-300">
              <span className="material-symbols-outlined text-lg">
                chevron_left
              </span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#002868] text-white text-[0.7rem] font-medium shadow-md shadow-[#002868]/10">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 text-[0.7rem] font-light hover:bg-gray-50 transition-all duration-300">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 text-[0.7rem] font-light hover:bg-gray-50 transition-all duration-300">
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-300 hover:text-[#002868] hover:bg-gray-50 transition-all duration-300">
              <span className="material-symbols-outlined text-lg">
                chevron_right
              </span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
