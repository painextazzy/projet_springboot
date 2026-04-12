// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Architectural Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low/30 -skew-x-12 transform translate-x-20 z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl z-0"></div>

        {/* Content Card */}
        <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Illustration Side */}
          <div className="flex justify-center md:justify-end order-1 md:order-2">
            <div className="relative w-64 h-64 md:w-80 md:h-80 group">
              <div className="absolute inset-0 bg-surface-container-high rounded-full transform group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute inset-4 border border-outline-variant/20 rounded-full flex items-center justify-center bg-surface-container-lowest shadow-2xl">
                <div className="flex flex-col items-center text-primary/40">
                  <span className="material-symbols-outlined text-8xl md:text-9xl mb-2">
                    smart_toy
                  </span>
                  <span className="material-symbols-outlined text-4xl transform rotate-45">
                    bolt
                  </span>
                </div>
              </div>
              {/* Floating Accent Icon */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-surface-container-lowest rounded-xl shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-3xl">
                  error
                </span>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="text-center md:text-left order-2 md:order-1 space-y-6">
            <div>
              <h1 className="font-headline font-extrabold text-8xl md:text-9xl text-primary/10 leading-none tracking-tighter mb-[-2rem]">
                404
              </h1>
              <h2 className="font-headline font-bold text-4xl md:text-5xl text-on-surface tracking-tight">
                Page Introuvable
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-lg md:text-xl text-secondary leading-relaxed font-medium">
                Oups ! Il semble que le service que vous cherchez ne répond pas
                ou n'existe plus.
              </p>
            </div>

            {/* Bouton retour */}
          </div>
        </div>
      </main>
    </div>
  );
}
