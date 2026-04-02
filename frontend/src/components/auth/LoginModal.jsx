import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Fermer avec la touche Echap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Gérer le clic en dehors du modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appel vers le backend Spring Boot
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Stocker les infos utilisateur
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('role', data.role);
        
        onClose();
        
        // Redirection avec React Router
        if (data.role === 'SERVEUR') {
          navigate('/serveur');
        } else if (data.role === 'MANAGER') {
          navigate('/manager');
        }
      } else {
        const errorText = await response.text();
        setError(errorText || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay (fond sombre avec flou) */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="w-full max-w-sm transition-all duration-300 animate-in fade-in zoom-in"
        >
          {/* Glass Panel Card - Conteneur VERTICAL LONG */}
          <div className="backdrop-blur-[20px] bg-white/90 rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Bouton X pour fermer */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
            
            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1">
              {/* Logo / Brand Header */}
              <div className="pt-8 pb-4 text-center">
                <h1 className="font-headline text-xl font-extrabold tracking-tight text-primary">
                  Petite Bouffe
                </h1>
                <p className="font-label text-[10px] uppercase tracking-wider text-secondary mt-0.5">
                  Management Systems
                </p>
              </div>
              
              {/* Formulaire */}
              <div className="px-6 pb-8">
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label className="block font-label text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                      Utilisateur
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-lg">
                        person
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-0 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant text-sm border border-transparent focus:border-outline-variant/15"
                        placeholder="serveur@resto.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block font-label text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                      Mot de passe
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-lg">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-0 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant text-sm border border-transparent focus:border-outline-variant/15"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {/* Afficher mot de passe */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-password"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary border-outline-variant rounded focus:ring-1 focus:ring-primary/20"
                    />
                    <label
                      htmlFor="show-password"
                      className="text-xs text-secondary cursor-pointer select-none"
                    >
                      Afficher le mot de passe
                    </label>
                  </div>

                  {/* Erreur */}
                  {error && (
                    <div className="bg-red-50 text-red-600 p-2 rounded-xl text-xs text-center">
                      {error}
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#00307d] to-[#0045ab] text-white py-3 rounded-xl font-headline font-bold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <span className="material-symbols-outlined text-base">
                          login
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}