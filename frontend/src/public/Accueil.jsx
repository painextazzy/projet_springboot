import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Composant Navbar
function Navbar({ onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Réinitialiser AOS après chaque rendu
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <nav
      className={`
      fixed top-0 w-full h-20 z-50 transition-all duration-500
      ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg"
          : "bg-white/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(25,28,30,0.06)]"
      }
      flex justify-between items-center px-4 md:px-8
    `}
    >
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-[#191c1e] font-headline flex items-center group">
          <span className="material-symbols-outlined align-middle mr-2 text-2xl transition-transform group-hover:rotate-12 duration-300">
            chef_hat
          </span>
          <span className="relative">
            La petite bouffe
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </span>
        </span>
        <div className="hidden md:flex items-center gap-8">
          {["Accueil", "Notre Carte", "Réservations"].map((item, idx) => (
            <a
              key={idx}
              href="#"
              className="text-[#585e6c] hover:text-primary transition-all duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onLoginClick}
          className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-md font-body font-semibold text-sm transition-all hover:scale-105 active:scale-90 group"
          data-aos="fade-left"
          data-aos-delay="200"
        >
          <span className="relative z-10">Se connecter</span>
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </button>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-secondary hover:bg-gray-100 rounded-lg transition-all"
        >
          <span
            className="material-symbols-outlined transition-transform duration-300"
            style={{ transform: isMenuOpen ? "rotate(90deg)" : "rotate(0)" }}
          >
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Menu mobile animé */}
      <div
        className={`
        absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg md:hidden overflow-hidden transition-all duration-500
        ${isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        <div className="flex flex-col p-4 gap-3">
          {["Accueil", "Notre Carte", "Réservations"].map((item, idx) => (
            <a
              key={idx}
              href="#"
              className="text-[#585e6c] hover:text-primary py-2 px-4 transition-all duration-300 hover:translate-x-2"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Composant Hero Section avec AOS
function HeroSection({ onStartClick }) {
  return (
    <section className="relative min-h-screen w-full bg-gradient-to-br from-surface-container-low to-surface overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col md:flex-row items-center gap-12 py-20 relative z-10">
        {/* Texte avec AOS */}
        <div
          className="w-full md:w-[55%] space-y-8"
          data-aos="fade-right"
          data-aos-duration="1000"
        >
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-surface leading-tight">
            Bienvenue chez <br />
            <span className="text-primary relative inline-block">
              Petite Bouffe
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 4 L200 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  className="text-primary/50"
                />
              </svg>
            </span>
          </h1>
          <p
            className="font-body text-lg md:text-xl text-secondary max-w-xl leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="800"
          >
            Une expérience culinaire d'exception où la tradition rencontre
            l'innovation. Découvrez une cuisine raffinée dans un cadre
            architectural unique.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4"
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-duration="800"
          >
            <button
              onClick={onStartClick}
              className="group relative overflow-hidden bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-md font-body font-semibold text-base transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="relative z-10">
                Appuyer pour commencer la gestion
              </span>
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12">
                arrow_forward
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
            </button>
          </div>
        </div>

        {/* Image avec AOS */}
        <div
          className="w-full md:w-[45%]"
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          <div className="relative p-3 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,48,125,0.12)] transform rotate-2 hover:rotate-0 transition-all duration-500 group">
            <div className="overflow-hidden rounded-[1.5rem]">
              <img
                alt="Restaurant interior"
                className="w-full h-[550px] object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7VekucTnZBRokzoO6jKhecgY--NPZu_rsfMyunN544UwK13NJ3MT5EqHI8rWExHLtvMAExkzm6ZEArk3vCHbQQsOHdgbLjr2bmbxH_waXWpHsGOmuZ7bo-9plXiSss-rY4XEAiQXUF5SFdSH9iIjli3NMBWsIFwhJaaTVxhi5hWXYxZbdmDVfJ7yHXRVLI7Ape3QaH7jsVsZ_rYIKDhb3PoPXjj5pQutWDLRg_14QE2tODdwIOIdwjQ2abRO_afPB-xYUjZg8_1Y"
              />
            </div>
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Flèche animée */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary/40 hidden md:block animate-bounce-slow"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <span className="material-symbols-outlined text-3xl">
          keyboard_double_arrow_down
        </span>
      </div>
    </section>
  );
}

// Page principale
export default function Accueil({ onLoginClick, onStartClick }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar onLoginClick={onLoginClick} />
      <main className="flex-1 pt-20">
        <HeroSection onStartClick={onStartClick} />
      </main>
    </div>
  );
}
