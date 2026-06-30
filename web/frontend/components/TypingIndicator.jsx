export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#0e2440] border border-ledger-line dark:border-white/10">
        <span className="text-xs text-ledger-slate font-mono">en train d'écrire</span>
        <span className="flex items-center gap-1">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ledger-gold inline-block" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ledger-gold inline-block" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ledger-gold inline-block" />
        </span>
      </div>
    </div>
  );
}
