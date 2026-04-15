// src/components/manager/Facture.jsx
import React, { useEffect, useRef } from "react";

const Facture = ({ commande, onClose }) => {
  const printRef = useRef();

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
    const printContent = document.getElementById("facture-content").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    // Auto-print seulement sur desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      setTimeout(() => {
        handlePrint();
      }, 500);
    }

    if (onClose) {
      setTimeout(() => onClose(), 2000);
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#f7f9fb",
        zIndex: 9999,
        overflowY: "auto",
        padding: "16px",
      }}
    >
      <div id="facture-content">
        <div
          className="receipt-container"
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            background: "white",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="h-1 bg-gray-100"
            style={{
              clipPath:
                "polygon(0% 0%, 2.5% 100%, 5% 0%, 7.5% 100%, 10% 0%, 12.5% 100%, 15% 0%, 17.5% 100%, 20% 0%, 22.5% 100%, 25% 0%, 27.5% 100%, 30% 0%, 32.5% 100%, 35% 0%, 37.5% 100%, 40% 0%, 42.5% 100%, 45% 0%, 47.5% 100%, 50% 0%, 52.5% 100%, 55% 0%, 57.5% 100%, 60% 0%, 62.5% 100%, 65% 0%, 67.5% 100%, 70% 0%, 72.5% 100%, 75% 0%, 77.5% 100%, 80% 0%, 82.5% 100%, 85% 0%, 87.5% 100%, 90% 0%, 92.5% 100%, 95% 0%, 97.5% 100%, 100% 0%, 100% 100%, 0% 100%)",
            }}
          ></div>

          <div className="px-5 pt-5 pb-3 text-center">
            <div className="flex flex-col items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-[#00307d] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">
                  restaurant
                </span>
              </div>
              <h1
                style={{ fontFamily: "Manrope, sans-serif" }}
                className="font-extrabold text-lg tracking-tight text-[#00307d]"
              >
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

          <div className="px-5 py-3">
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

          <div
            className="h-1 bg-gray-100"
            style={{
              clipPath:
                "polygon(0% 0%, 2.5% 100%, 5% 0%, 7.5% 100%, 10% 0%, 12.5% 100%, 15% 0%, 17.5% 100%, 20% 0%, 22.5% 100%, 25% 0%, 27.5% 100%, 30% 0%, 32.5% 100%, 35% 0%, 37.5% 100%, 40% 0%, 42.5% 100%, 45% 0%, 47.5% 100%, 50% 0%, 52.5% 100%, 55% 0%, 57.5% 100%, 60% 0%, 62.5% 100%, 65% 0%, 67.5% 100%, 70% 0%, 72.5% 100%, 75% 0%, 77.5% 100%, 80% 0%, 82.5% 100%, 85% 0%, 87.5% 100%, 90% 0%, 92.5% 100%, 95% 0%, 97.5% 100%, 100% 0%, 100% 100%, 0% 100%)",
              transform: "rotate(180deg)",
            }}
          ></div>
        </div>
      </div>

      {/* Bouton d'impression en bas */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center p-4 z-50"
        style={{
          background:
            "linear-gradient(to top, #f7f9fb 0%, rgba(247,249,251,0) 100%)",
        }}
      >
        <button
          onClick={handlePrint}
          className="flex items-center gap-3 bg-gradient-to-r from-[#00307d] to-[#0045ab] text-white px-6 py-3 rounded-full font-semibold shadow-lg active:scale-95 transition-all"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px" }}
          >
            print
          </span>
          <span>Imprimer la facture</span>
        </button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #facture-content, #facture-content * {
            visibility: visible;
          }
          #facture-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .fixed {
            display: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
        }
        
        @media (max-width: 480px) {
          button {
            padding: 12px 24px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Facture;
