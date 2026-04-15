// src/components/manager/Facture.jsx
import React, { useEffect } from "react";

const Facture = ({ commande, onClose }) => {
  if (!commande) return null;

  const date = new Date(commande.dateCloture || new Date());
  const dateStr = date.toLocaleDateString("fr-FR");
  const heureStr = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const numeroFacture =
    commande.numeroFacture || `2024-${commande.id.toString().padStart(4, "0")}`;
  const total = commande.total || 0;
  const lignes = commande.lignes || [];

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html class="light" lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture #${numeroFacture}</title>
          <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page { size: 80mm auto; margin: 0mm; }
              body { margin: 0; padding: 0; background: white; }
              .receipt-container { box-shadow: none !important; width: 80mm; margin: 0 auto; border: none !important; }
              .no-print { display: none; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', sans-serif;
              background: #f7f9fb;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 16px;
            }
            .receipt-container {
              width: 100%;
              max-width: 400px;
              background: white;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
            }
            .receipt-paper { background: white; }
            .serrated-edge {
              clip-path: polygon(0% 0%, 2.5% 100%, 5% 0%, 7.5% 100%, 10% 0%, 12.5% 100%, 15% 0%, 17.5% 100%, 20% 0%, 22.5% 100%, 25% 0%, 27.5% 100%, 30% 0%, 32.5% 100%, 35% 0%, 37.5% 100%, 40% 0%, 42.5% 100%, 45% 0%, 47.5% 100%, 50% 0%, 52.5% 100%, 55% 0%, 57.5% 100%, 60% 0%, 62.5% 100%, 65% 0%, 67.5% 100%, 70% 0%, 72.5% 100%, 75% 0%, 77.5% 100%, 80% 0%, 82.5% 100%, 85% 0%, 87.5% 100%, 90% 0%, 92.5% 100%, 95% 0%, 97.5% 100%, 100% 0%, 100% 100%, 0% 100%);
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="h-1 bg-gray-100 serrated-edge"></div>
            
            <div class="px-5 pt-5 pb-3 text-center">
              <div class="flex flex-col items-center gap-2 mb-3">
                <div class="w-10 h-10 bg-[#00307d] rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-xl">restaurant</span>
                </div>
                <h1 class="font-headline font-extrabold text-lg tracking-tight text-[#00307d]">Petite Bouffe</h1>
                <p class="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Gastronomie Fine</p>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-200 text-[10px]">
                <div class="text-left">
                  <p class="text-gray-400 text-[8px] uppercase font-semibold">Date & Heure</p>
                  <p class="text-gray-800 font-medium text-[11px]">${dateStr} ${heureStr}</p>
                </div>
                <div class="text-right">
                  <p class="text-gray-400 text-[8px] uppercase font-semibold">N° Facture</p>
                  <p class="text-gray-800 font-medium text-[11px]">#${numeroFacture}</p>
                </div>
              </div>
            </div>
            
            <div class="px-5 pt-1 pb-2">
              <div class="flex justify-center items-center bg-gray-50 p-2 rounded-lg">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-gray-400 text-sm">table_restaurant</span>
                  <span class="text-xs font-medium text-gray-700">Table ${commande.tableNom || commande.tableId}</span>
                </div>
              </div>
            </div>
            
            <div class="border-t border-dashed border-gray-200 mx-5"></div>
            
            <div class="px-5 py-3 receipt-paper">
              <table class="w-full text-[11px]">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left py-1.5 font-semibold text-gray-500">Article</th>
                    <th class="text-center py-1.5 font-semibold text-gray-500 w-10">Qté</th>
                    <th class="text-right py-1.5 font-semibold text-gray-500 w-14">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    lignes.length === 0
                      ? `
                    <tr><td colspan="3" class="text-center py-4 text-gray-400 text-[10px]">Aucun détail disponible</td></tr>
                  `
                      : lignes
                          .map(
                            (l) => `
                    <tr class="border-b border-gray-100">
                      <td class="py-1.5 font-medium text-gray-800 text-[11px]">${l.platNom || l.nom || "Plat"}</td>
                      <td class="text-center py-1.5 text-gray-500 text-[11px]">${l.quantite || 0}</td>
                      <td class="text-right py-1.5 font-semibold text-gray-800 text-[11px]">${((l.prixUnitaire || 0) * (l.quantite || 0)).toLocaleString("fr-FR")}</td>
                    </tr>
                  `,
                          )
                          .join("")
                  }
                </tbody>
              </table>
            </div>
            
            <div class="px-5 py-3">
              <div class="bg-gradient-to-r from-[#00307d] to-[#0045ab] rounded-xl p-3 text-white">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-semibold uppercase tracking-wider opacity-80">Total à payer</span>
                  <div class="flex items-baseline gap-1">
                    <span class="text-xl font-extrabold tracking-tight">${total.toLocaleString("fr-FR")}</span>
                    <span class="text-[10px] font-semibold uppercase">Ar</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="px-5 py-4 text-center bg-gray-50/30">
              <p class="font-semibold text-[11px] text-[#00307d] mb-1 uppercase tracking-wider">Merci de votre confiance</p>
              <p class="text-[9px] text-gray-400 italic">Une expérience signée Petite Bouffe</p>
              
              <div class="flex flex-col items-center mt-2">
                <div class="flex justify-center gap-[1px] h-4 mb-1">
                  ${Array(20)
                    .fill()
                    .map(() => `<div class="w-[2px] bg-gray-300"></div>`)
                    .join("")}
                </div>
                <p class="text-[6px] font-mono text-gray-300 tracking-wider">${Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
            </div>
            
            <div class="h-1 bg-gray-100 serrated-edge rotate-180"></div>
          </div>
          
          <div class="no-print mt-5 text-center">
            <button onclick="window.print()" class="bg-[#00307d] text-white font-medium py-2 px-5 rounded-full text-sm shadow-lg">
              🖨️ Imprimer
            </button>
          </div>
          
          <script>
            setTimeout(() => { window.print(); }, 300);
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  useEffect(() => {
    handlePrint();
    if (onClose) {
      setTimeout(() => onClose(), 1000);
    }
  }, []);

  return null;
};

export default Facture;
