"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ messages, isStreaming, errorMessage }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 w-12 h-12 border border-ledger-gold flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 13L8 7L11.5 10.5L17 4" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display text-lg text-ledger-ink dark:text-ledger-paper mb-1">
            Bonjour, comment puis-je vous aider ?
          </p>
          <p className="text-sm text-ledger-slate">
            Posez une question sur vos comptes, vos ratios ou vos prévisions financières.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto ledger-scroll px-3 sm:px-6 py-4 space-y-3">
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} timestamp={m.timestamp} />
      ))}
      {isStreaming && <TypingIndicator />}
      {errorMessage && (
        <div className="flex justify-start">
          <div className="max-w-[85%] sm:max-w-[70%] px-4 py-3 text-sm bg-ledger-rose/10 border border-ledger-rose/40 text-ledger-rose">
            {errorMessage}
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
