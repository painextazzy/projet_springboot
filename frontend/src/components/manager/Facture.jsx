// src/components/manager/Facture.jsx
import React, { useEffect, useState } from "react";

const Facture = ({ commande, onClose }) => {
  const [showPrintButton, setShowPrintButton] = useState(true);

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
    // Créer le contenu HTML de la facture
    const printContent = `
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
            .no-print { display: none !important; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            background: #f7f9fb;
            display: flex;
            flex-direction: column;
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
          
          /* Styles du bouton d'impression responsive */
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            padding: 16px;
            background: linear-gradient(to top, rgba(247,249,251,1) 0%, rgba(247,249,251,0) 100%);
            z-index: 1000;
          }
          
          .print-button-bottom {
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #00307d 0%, #0045ab 100%);
            color: white;
            border: none;
            padding: 14px 32px;
            border-radius: 60px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(0, 48, 125, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Inter', sans-serif;
          }
          
          .print-button-bottom:active {
            transform: scale(0.98);
          }
          
          .print-icon-bottom {
            font-size: 22px;
            font-weight: 400;
          }
          
          /* Responsive */
          @media (max-width: 480px) {
            .print-button-bottom {
              padding: 12px 28px;
              font-size: 15px;
              gap: 10px;
            }
            
            .print-icon-bottom {
              font-size: 20px;
            }
            
            .print-footer {
              padding: 12px;
            }
          }
          
          @media (max-width: 380px) {
            .print-button-bottom {
              padding: 10px 24px;
              font-size: 14px;
              gap: 8px;
            }
            
            .print-icon-bottom {
              font-size: 18px;
            }
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
                  <tr><td colspan="3" class="text-center py-4 text-gray-400 text-[10px]">Aucun détail disponible</td></td>
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
        
        <!-- Bouton d'impression en bas avec icône - NE S'IMPRIME PAS -->
        <div class="print-footer no-print">
          <button onclick="window.print()" class="print-button-bottom">
            <span class="material-symbols-outlined print-icon-bottom">print</span>
            <span>Imprimer la facture</span>
          </button>
        </div>
        
        <script>
          // Pour mobile, attendre que la page soit chargée
          document.addEventListener('DOMContentLoaded', function() {
            // Ne pas imprimer automatiquement sur mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
              setTimeout(function() { window.print(); }, 500);
            }
          });
        </script>
      </body>
      </html>
    `;

    // Sur mobile, utiliser une nouvelle fenêtre ou un iframe
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Sur mobile, créer un iframe invisible
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // Afficher le bouton d'impression dans l'iframe
      setTimeout(() => {
        const printButton = iframeDoc.querySelector(".print-button-bottom");
        if (printButton) {
          printButton.style.display = "flex";
        }
        // Rendre l'iframe visible
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.zIndex = "9999";
        iframe.style.background = "#f7f9fb";
      }, 100);
    } else {
      // Sur desktop, utiliser window.open
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      }
    }
  };

  useEffect(() => {
    // Ne pas imprimer automatiquement sur mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      handlePrint();
    } else {
      // Sur mobile, afficher le bouton d'impression dans le composant principal
      setShowPrintButton(true);
    }

    if (onClose) {
      setTimeout(() => onClose(), 1000);
    }
  }, []);

  // Version mobile : afficher la facture directement dans le composant
  if (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) &&
    showPrintButton
  ) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#f7f9fb",
          zIndex: 9999,
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            background: "white",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
          }}
        >
          {/* Contenu de la facture */}
          <div className="h-1 bg-gray-100 serrated-edge"></div>

          <div className="px-5 pt-5 pb-3 text-center">
            <div className="flex flex-col items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-[#00307d] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">
                  restaurant
                </span>
              </div>
              <h1 className="font-headline font-extrabold text-lg tracking-tight text-[#00307d]">
                Petite Bouffe
              </h1>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                Gastronomie Fine
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-200 text-[10px]">
              <div className="text-left">
                <p className="text-gray-400 text-[8px] uppercase font-semibold">
                  Date & Heure
                </p>
                <p className="text-gray-800 font-medium text-[11px]">
                  {dateStr} {heureStr}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-[8px] uppercase font-semibold">
                  N° Facture
                </p>
                <p className="text-gray-800 font-medium text-[11px]">
                  #{numeroFacture}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pt-1 pb-2">
            <div className="flex justify-center items-center bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">
                  table_restaurant
                </span>
                <span className="text-xs font-medium text-gray-700">
                  Table {commande.tableNom || commande.tableId}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 mx-5"></div>

          <div className="px-5 py-3 receipt-paper">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1.5 font-semibold text-gray-500">
                    Article
                  </th>
                  <th className="text-center py-1.5 font-semibold text-gray-500 w-10">
                    Qté
                  </th>
                  <th className="text-right py-1.5 font-semibold text-gray-500 w-14">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {lignes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-4 text-gray-400 text-[10px]"
                    >
                      Aucun détail disponible
                    </td>
                  </tr>
                ) : (
                  lignes.map((l, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-1.5 font-medium text-gray-800 text-[11px]">
                        {l.platNom || l.nom || "Plat"}
                      </td>
                      <td className="text-center py-1.5 text-gray-500 text-[11px]">
                        {l.quantite || 0}
                      </td>
                      <td className="text-right py-1.5 font-semibold text-gray-800 text-[11px]">
                        {(
                          (l.prixUnitaire || 0) * (l.quantite || 0)
                        ).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3">
            <div className="bg-gradient-to-r from-[#00307d] to-[#0045ab] rounded-xl p-3 text-white">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
                  Total à payer
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold tracking-tight">
                    {total.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase">
                    Ar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 text-center bg-gray-50/30">
            <p className="font-semibold text-[11px] text-[#00307d] mb-1 uppercase tracking-wider">
              Merci de votre confiance
            </p>
            <p className="text-[9px] text-gray-400 italic">
              Une expérience signée Petite Bouffe
            </p>

            <div className="flex flex-col items-center mt-2">
              <div className="flex justify-center gap-[1px] h-4 mb-1">
                {Array(20)
                  .fill()
                  .map((_, i) => (
                    <div key={i} className="w-[2px] bg-gray-300"></div>
                  ))}
              </div>
              <p className="text-[6px] font-mono text-gray-300 tracking-wider">
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="h-1 bg-gray-100 serrated-edge rotate-180"></div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-[#f7f9fb] to-transparent">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 bg-gradient-to-r from-[#00307d] to-[#0045ab] text-white px-8 py-3 rounded-full font-semibold shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">print</span>
            <span>Imprimer la facture</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Facture;
