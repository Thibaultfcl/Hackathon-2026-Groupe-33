"use client";

import { useRef, useState } from "react";

export default function ChatInput({ onSend, disabled, onExport, canExport }) {
  const [value, setValue] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoGrow = (e) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-ledger-line dark:border-white/10 bg-ledger-paper dark:bg-[#0e2440] px-3 sm:px-6 py-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-end border border-ledger-line dark:border-white/15 bg-white dark:bg-[#0a1c33] focus-within:border-ledger-gold transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={autoGrow}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ledger-slate disabled:opacity-50"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setExportOpen((o) => !o)}
            disabled={!canExport}
            className="p-2.5 border border-ledger-line dark:border-white/15 text-ledger-slate hover:text-ledger-ink dark:hover:text-ledger-paper hover:border-ledger-ink dark:hover:border-white/40 disabled:opacity-30 disabled:hover:text-ledger-slate transition-colors"
            aria-label="Exporter la conversation"
            title="Exporter la conversation"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v9m0 0L5.5 7.5M9 11l3.5-3.5M3 13.5v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {exportOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-36 bg-white dark:bg-[#0e2440] border border-ledger-line dark:border-white/15 shadow-lg text-sm z-10">
              <button
                onClick={() => {
                  onExport("md");
                  setExportOpen(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-ledger-paper dark:hover:bg-white/5"
              >
                Export .md
              </button>
              <button
                onClick={() => {
                  onExport("txt");
                  setExportOpen(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-ledger-paper dark:hover:bg-white/5"
              >
                Export .txt
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="px-4 sm:px-5 py-2.5 bg-ledger-emerald text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 transition-opacity"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
