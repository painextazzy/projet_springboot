// pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword({ email });
      
      setSuccess("Un email de réinitialisation a été envoyé !");
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Aucun compte trouvé avec cet email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover filter brightness-[0.7] blur-[4px]"
          alt="Gourmet dish background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6RxvHE1mQwUfKaYMoypfECYU0A7le7z5maPcfWqGljU9aTJlh5oCm3iu9rAQpltrVlfJKb6srUnnp5cW3h0T7-RO3hZBBj8upcVwnYPTfBzUUDA4it2r217ns-Uf0fgNfPc70RcxMsOg-1K5sPm0mAzlORHBngAVLi7VpbVmP4fysaar9uJv3oULNGOODdPU2pvM38RqD7aulUr7Vn8ZuFGklQpvrtb7Y7guul5LLp62ePcscaE8iUmk8t9zcryrwsi9-NDW4BCA"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Reset Password Container */}
      <main
        className="relative z-10 w-full max-w-[480px] px-6 py-12 md:py-16"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="glass-card p-8 md:p-10 rounded-2xl shadow-2xl flex flex-col items-center border border-white/20">
          {/* Header */}
          <div
            className="mb-8 text-center"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/20">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock_reset
              </span>
            </div>
            <h1 className="font-headline font-bold text-3xl tracking-tight text-[#111827]">
              Reset Password
            </h1>
            <p className="font-body text-sm font-medium text-secondary mt-2">
              Enter your email to reset your password.
            </p>
          </div>

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div
                className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="text-green-600 text-sm text-center py-2 bg-green-50 rounded-lg"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {success}
              </div>
            )}

            {/* Email Address */}
            <div
              className="space-y-2"
              data-aos="fade-right"
              data-aos-delay="400"
            >
              <label className="block text-[11px] font-bold tracking-wider text-on-surface-variant px-1 uppercase">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-blue-600 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all duration-200 text-on-surface placeholder:text-outline/40 shadow-sm"
                  placeholder="hello@alignui.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Reset Password Button */}
            <div className="pt-3" data-aos="fade-up" data-aos-delay="500">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-headline font-bold text-sm tracking-[0.05rem] shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-200 uppercase flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    SENDING...
                  </>
                ) : (
                  "RESET PASSWORD"
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div
            className="mt-8 text-center space-y-3"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-[13px] text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to login
            </button>
            
            <div>
              <button
                type="button"
                onClick={() => {
                  // Gérer accès perdu
                  console.log("Try another method");
                }}
                className="text-[12px] text-blue-600 hover:text-blue-700 transition-colors"
              >
                Don't have access anymore?
                <br />
                Try another method
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="mt-8 flex justify-center space-x-10"
          data-aos="fade-up"
          data-aos-delay="700"
        >
          <a
            href="#"
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors tracking-[0.15em] uppercase"
          >
            Support
          </a>
          <a
            href="#"
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors tracking-[0.15em] uppercase"
          >
            Sécurité
          </a>
          <a
            href="#"
            className="text-[11px] font-bold text-white/90 hover:text-white transition-colors tracking-[0.15em] uppercase"
          >
            Petite Bouffe RMS
          </a>
        </footer>
      </main>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .material-symbols-outlined {
          font-variation-settings:
            "FILL" 0,
            "wght" 300,
            "GRAD" 0,
            "opsz" 24;
        }
      `}</style>
    </div>
  );
}