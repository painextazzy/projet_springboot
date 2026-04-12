// src/components/Facture.jsx
import React, { useEffect, useRef } from "react";

const Facture = ({ commande, onClose }) => {
  const printTriggered = useRef(false);

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

  const openPreview = () => {
    if (printTriggered.current) return;
    printTriggered.current = true;

    const previewWindow = window.open("about:blank", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html class="light" lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture #${numeroFacture}</title>
          <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0mm;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
              .receipt-container {
                box-shadow: none !important;
                width: 80mm;
                margin: 0 auto;
                border: none !important;
              }
              /* ✅ Cache les boutons à l'impression */
              .no-print {
                display: none !important;
              }
              /* ✅ Cache aussi le conteneur des boutons */
              .print-hide {
                display: none !important;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Manrope', sans-serif;
              font-weight: 300;
              background: #fcfdfe;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
            }
            .receipt-container {
              width: 100%;
              max-width: 340px;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid rgba(0,0,0,0.05);
              box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04);
            }
            .serrated-edge {
              clip-path: polygon(0% 0%, 2.5% 100%, 5% 0%, 7.5% 100%, 10% 0%, 12.5% 100%, 15% 0%, 17.5% 100%, 20% 0%, 22.5% 100%, 25% 0%, 27.5% 100%, 30% 0%, 32.5% 100%, 35% 0%, 37.5% 100%, 40% 0%, 42.5% 100%, 45% 0%, 47.5% 100%, 50% 0%, 52.5% 100%, 55% 0%, 57.5% 100%, 60% 0%, 62.5% 100%, 65% 0%, 67.5% 100%, 70% 0%, 72.5% 100%, 75% 0%, 77.5% 100%, 80% 0%, 82.5% 100%, 85% 0%, 87.5% 100%, 90% 0%, 92.5% 100%, 95% 0%, 97.5% 100%, 100% 0%, 100% 100%, 0% 100%);
            }
            /* ✅ Conteneur des boutons - toujours visible à l'écran, caché à l'impression */
            .button-container {
              position: fixed;
              bottom: 20px;
              left: 0;
              right: 0;
              display: flex;
              justify-content: center;
              gap: 15px;
              z-index: 1000;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="h-1 bg-gray-50 serrated-edge"></div>
            
            <!-- Header -->
            <div class="px-5 pt-6 pb-4 text-center">
              <div class="flex flex-col items-center gap-2 mb-4">
                <div class="w-10 h-10 bg-[#002868] rounded-xl flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-xl">restaurant</span>
                </div>
                <h1 class="font-semibold text-lg tracking-tight text-[#002868]">Petite Bouffe</h1>
                <p class="text-[9px] font-light text-gray-400 uppercase tracking-wider">Gastronomie Fine</p>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-gray-100 text-[10px]">
                <div class="text-left">
                  <p class="text-gray-400 text-[9px] uppercase tracking-wider font-light">Date & Heure</p>
                  <p class="text-gray-700 font-normal text-xs">${dateStr} • ${heureStr}</p>
                </div>
                <div class="text-right">
                  <p class="text-gray-400 text-[9px] uppercase tracking-wider font-light">N° Facture</p>
                  <p class="text-gray-700 font-normal text-xs">#${numeroFacture}</p>
                </div>
              </div>
            </div>
            
            <!-- Table info -->
            <div class="px-5 pt-2 pb-1">
              <div class="flex justify-center items-center bg-gray-50/50 p-3 rounded-xl">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-gray-300 text-base">table_restaurant</span>
                  <span class="text-xs font-normal text-gray-600">Table ${commande.tableNom || commande.tableId}</span>
                </div>
              </div>
            </div>
            
            <!-- Articles -->
            <div class="px-5 py-3">
              <table class="w-full text-[11px]">
                <thead>
                  <tr class="border-t border-gray-100">
                    <th class="text-left py-2 font-medium text-gray-400 text-[9px] uppercase tracking-wider">Article</th>
                    <th class="text-center py-2 font-medium text-gray-400 text-[9px] uppercase tracking-wider w-10">Qté</th>
                    <th class="text-right py-2 font-medium text-gray-400 text-[9px] uppercase tracking-wider w-14">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    lignes.length === 0
                      ? `
                    <tr>
                      <td colspan="3" class="text-center py-6 text-gray-300 font-light text-xs">Aucun détail disponible</td>
                    </tr>
                  `
                      : lignes
                          .map(
                            (l) => `
                    <tr class="border-b border-gray-50">
                      <td class="py-2 font-light text-gray-700">${(l.platNom || l.nom || "Plat").substring(0, 25)}</td>
                      <td class="text-center py-2 font-light text-gray-500">${l.quantite || 0}</td>
                      <td class="text-right py-2 font-normal text-gray-700">${((l.prixUnitaire || 0) * (l.quantite || 0)).toLocaleString("fr-FR")}</td>
                    </tr>
                  `,
                          )
                          .join("")
                  }
                </tbody>
              </table>
            </div>
            
            <!-- Total -->
            <div class="px-5 py-3">
              <div class="bg-gradient-to-r from-[#002868] to-[#001a4a] rounded-xl p-4">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-light uppercase tracking-wider text-white/70">Total à payer</span>
                  <div class="flex items-baseline gap-1">
                    <span class="text-xl font-semibold tracking-tight text-white">${total.toLocaleString("fr-FR")}</span>
                    <span class="text-[10px] font-light uppercase text-white/70">Ar</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="px-5 py-5 text-center bg-gray-50/30">
              <p class="font-medium text-[11px] text-[#002868] mb-1 uppercase tracking-wider">Merci de votre confiance</p>
              <p class="text-[9px] font-light text-gray-400 italic">Une expérience signée Petite Bouffe</p>
              
              <!-- Mini code barre -->
              <div class="flex flex-col items-center mt-3">
                <div class="flex justify-center gap-[1px] h-4 mb-1">
                  ${Array(25)
                    .fill()
                    .map(() => `<div class="w-[2px] bg-gray-300"></div>`)
                    .join("")}
                </div>
                <p class="text-[6px] font-mono text-gray-300 tracking-wider">${Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
              </div>
            </div>
            
            <div class="h-1 bg-gray-50 serrated-edge rotate-180"></div>
          </div>
          
          <!-- ✅ Boutons en bas - class "no-print" pour être cachés à l'impression -->
          <div class="button-container no-print">
            <button onclick="window.close()" style="background: #9ca3af; color: white; border: none; padding: 10px 24px; border-radius: 30px; font-size: 14px; font-weight: 500; cursor: pointer;">
              Fermer
            </button>
            <button onclick="window.print()" style="background: #002868; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-size: 14px; font-weight: 500; cursor: pointer;">
              Imprimer
            </button>
          </div>
          
          <script>
            let printed = false;
            
            // Éviter les impressions multiples
            const printBtn = document.querySelector('.button-container button:last-child');
            if (printBtn) {
              printBtn.onclick = function(e) {
                e.preventDefault();
                if (!printed) {
                  printed = true;
                  window.print();
                }
              };
            }
            
            // Fermeture automatique après impression
            window.onafterprint = function() {
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }

    if (onClose) {
      onClose();
    }
  };

  // Ouvre directement l'aperçu sans modal
  useEffect(() => {
    openPreview();
  }, []);

  return null;
};

export default Facture;
