"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ role, content, timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[85%] sm:max-w-[70%] px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "bg-ledger-ink text-ledger-paper dark:bg-ledger-gold dark:text-ledger-ink"
              : "bg-white dark:bg-[#0e2440] border border-ledger-line dark:border-white/10 text-ledger-ink dark:text-ledger-paper"
          }
        `}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: (props) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full text-xs border-collapse" {...props} />
                  </div>
                ),
                th: (props) => (
                  <th
                    className="border border-ledger-line dark:border-white/10 px-2 py-1 text-left font-mono bg-ledger-paper dark:bg-white/5"
                    {...props}
                  />
                ),
                td: (props) => (
                  <td className="border border-ledger-line dark:border-white/10 px-2 py-1" {...props} />
                ),
                code: ({ inline, className, children, ...props }) =>
                  inline ? (
                    <code
                      className="px-1 py-0.5 bg-ledger-paper dark:bg-white/10 font-mono text-[12px]"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-ledger-ink text-ledger-paper dark:bg-black/40 p-3 overflow-x-auto my-2 text-[12px] font-mono">
                      <code {...props}>{children}</code>
                    </pre>
                  ),
                p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                ul: (props) => <ul className="list-disc pl-5 mb-2 space-y-0.5" {...props} />,
                ol: (props) => <ol className="list-decimal pl-5 mb-2 space-y-0.5" {...props} />,
              }}
            >
              {content || " "}
            </ReactMarkdown>
          </div>
        )}
        <p
          className={`mt-1.5 text-[10px] font-mono ${
            isUser ? "text-ledger-paper/50 dark:text-ledger-ink/50" : "text-ledger-slate"
          }`}
        >
          {new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
