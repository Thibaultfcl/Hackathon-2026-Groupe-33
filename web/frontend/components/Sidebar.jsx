"use client";

export default function Sidebar({
  open,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  settings,
  onSettingsChange,
}) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 shrink-0
        bg-ledger-paper dark:bg-[#0e2440] border-r border-ledger-line dark:border-white/10
        flex flex-col transition-transform duration-200 ease-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-ledger-ink text-ledger-paper dark:bg-ledger-gold dark:text-ledger-ink text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <span className="text-base leading-none">+</span> Nouvelle conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto ledger-scroll px-2">
        <p className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wider text-ledger-slate font-mono">
          Historique
        </p>
        {conversations.length === 0 && (
          <p className="px-2 py-3 text-sm text-ledger-slate">
            Aucune conversation enregistrée.
          </p>
        )}
        <ul className="space-y-0.5">
          {conversations.map((c) => (
            <li key={c.id}>
              <div
                className={`
                  group flex items-center gap-1 px-2 py-2 cursor-pointer border-l-2 text-sm
                  ${
                    c.id === activeId
                      ? "border-ledger-gold bg-ledger-ink/5 dark:bg-white/5 text-ledger-ink dark:text-ledger-paper"
                      : "border-transparent hover:bg-ledger-ink/5 dark:hover:bg-white/5 text-ledger-slate"
                  }
                `}
                onClick={() => onSelect(c.id)}
              >
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-ledger-slate hover:text-ledger-rose px-1 transition-opacity"
                  aria-label="Supprimer la conversation"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 border-t border-ledger-line dark:border-white/10 space-y-3">
        <p className="text-[11px] uppercase tracking-wider text-ledger-slate font-mono">
          Paramètres de génération
        </p>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label htmlFor="temperature" className="text-ledger-slate">
              Temperature
            </label>
            <span className="font-mono text-ledger-ink dark:text-ledger-paper">
              {settings.temperature.toFixed(1)}
            </span>
          </div>
          <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) =>
              onSettingsChange({ ...settings, temperature: parseFloat(e.target.value) })
            }
            className="w-full accent-ledger-gold"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <label htmlFor="max_tokens" className="text-ledger-slate">
              Max tokens
            </label>
            <span className="font-mono text-ledger-ink dark:text-ledger-paper">
              {settings.maxTokens}
            </span>
          </div>
          <input
            id="max_tokens"
            type="range"
            min="64"
            max="2048"
            step="64"
            value={settings.maxTokens}
            onChange={(e) =>
              onSettingsChange({ ...settings, maxTokens: parseInt(e.target.value, 10) })
            }
            className="w-full accent-ledger-gold"
          />
        </div>
      </div>
    </aside>
  );
}
