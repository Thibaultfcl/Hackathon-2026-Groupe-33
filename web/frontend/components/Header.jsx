"use client";

export default function Header({ darkMode, onToggleDark, onToggleSidebar }) {
  return (
    <header className="relative">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-ledger-ink text-ledger-paper">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden -ml-1 p-1.5 hover:bg-white/10 rounded"
            aria-label="Afficher l'historique"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="24" height="24" stroke="#C9A227" strokeWidth="1.2" />
              <path d="M6 18L10.5 11L14 15L20 7" stroke="#C9A227" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="7" r="1.4" fill="#C9A227" />
            </svg>
            <div className="leading-tight">
              <p className="font-display text-base sm:text-lg tracking-tight">
                TechCorp <span className="text-ledger-gold">Financial</span> Assistant
              </p>
              <p className="hidden sm:block text-[11px] text-ledger-paper/50 font-mono tracking-wide">
                propulsé par Phi-3.5-Financial
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleDark}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          title={darkMode ? "Mode clair" : "Mode sombre"}
        >
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M9 1v2M9 15v2M1 9h2M15 9h2M3.5 3.5l1.4 1.4M13.1 13.1l1.4 1.4M3.5 14.5l1.4-1.4M13.1 4.9l1.4-1.4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M15 10.5A6.5 6.5 0 0 1 7.5 3a6.5 6.5 0 1 0 7.5 7.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="ticker-rule" />
    </header>
  );
}
