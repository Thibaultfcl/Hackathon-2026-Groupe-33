"use client";

import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import {
  loadConversations,
  saveConversations,
  loadTheme,
  saveTheme,
  newConversation,
  conversationTitleFromFirstMessage,
  exportConversationAsText,
  downloadTextFile,
} from "../lib/storage";

export default function Page() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [settings, setSettings] = useState({ temperature: 0.7, maxTokens: 512 });
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef(null);

  // Hydratation depuis localStorage (Mission 3)
  useEffect(() => {
    const saved = loadConversations();
    const theme = loadTheme();
    setDarkMode(theme === "dark");
    if (saved.length > 0) {
      setConversations(saved);
      setActiveId(saved[0].id);
    } else {
      const conv = newConversation();
      setConversations([conv]);
      setActiveId(conv.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveTheme(darkMode ? "dark" : "light");
  }, [darkMode, hydrated]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  function updateActiveConversation(updater) {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? updater(c) : c))
    );
  }

  function handleNewConversation() {
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setErrorMessage(null);
    setSidebarOpen(false);
  }

  function handleDeleteConversation(id) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) {
        if (next.length > 0) {
          setActiveId(next[0].id);
        } else {
          const conv = newConversation();
          setActiveId(conv.id);
          return [conv];
        }
      }
      return next;
    });
  }

  async function handleSend(text) {
    if (!activeConversation) return;
    setErrorMessage(null);

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() };
    const isFirstMessage = activeConversation.messages.length === 0;

    updateActiveConversation((c) => ({
      ...c,
      title: isFirstMessage ? conversationTitleFromFirstMessage(text) : c.title,
      messages: [...c.messages, userMsg],
    }));

    setIsStreaming(true);

    const payloadMessages = [...activeConversation.messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur serveur (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = crypto.randomUUID();
      let accumulated = "";
      let bubbleCreated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        accumulated += chunk;

        if (!bubbleCreated) {
          bubbleCreated = true;
          updateActiveConversation((c) => ({
            ...c,
            messages: [
              ...c.messages,
              { id: assistantId, role: "assistant", content: accumulated, timestamp: Date.now() },
            ],
          }));
        } else {
          updateActiveConversation((c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            ),
          }));
        }
      }

      if (!bubbleCreated) {
        // Flux vide : on évite une bulle assistante fantôme
        setErrorMessage("Le modèle n'a renvoyé aucune réponse. Réessayez.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setErrorMessage("Génération interrompue.");
      } else {
        setErrorMessage(
          err.message?.length < 200
            ? err.message
            : "Une erreur est survenue lors de la génération de la réponse."
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleExport(format) {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const content = exportConversationAsText(activeConversation, format);
    const safeTitle = activeConversation.title.replace(/[^\w\- ]/g, "").trim() || "conversation";
    downloadTextFile(`${safeTitle}.${format}`, content);
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="h-screen flex flex-col bg-ledger-paper dark:bg-[#0a1c33] text-ledger-ink dark:text-ledger-paper">
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        <div className="flex flex-1 min-h-0 relative">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar
            open={sidebarOpen}
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setSidebarOpen(false);
            }}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
            settings={settings}
            onSettingsChange={setSettings}
          />

          <main className="flex-1 min-w-0 flex flex-col">
            <ChatWindow
              messages={activeConversation?.messages || []}
              isStreaming={isStreaming}
              errorMessage={errorMessage}
            />
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
              onExport={handleExport}
              canExport={(activeConversation?.messages.length || 0) > 0}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
