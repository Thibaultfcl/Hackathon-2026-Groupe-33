const STORAGE_KEY = "techcorp-fa:conversations";
const THEME_KEY = "techcorp-fa:theme";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadConversations() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY), []);
}

export function saveConversations(conversations) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // quota dépassé ou stockage indisponible : on ignore silencieusement
  }
}

export function loadTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(THEME_KEY) || "light";
}

export function saveTheme(theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

export function newConversation() {
  return {
    id: crypto.randomUUID(),
    title: "Nouvelle conversation",
    createdAt: Date.now(),
    messages: [],
  };
}

export function conversationTitleFromFirstMessage(text) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed || "Nouvelle conversation";
}

export function exportConversationAsText(conversation, format = "md") {
  const lines = [];
  if (format === "md") {
    lines.push(`# ${conversation.title}`);
    lines.push("");
    for (const m of conversation.messages) {
      const role = m.role === "user" ? "**Vous**" : "**Assistant**";
      lines.push(`${role} — ${new Date(m.timestamp).toLocaleString("fr-FR")}`);
      lines.push("");
      lines.push(m.content);
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  } else {
    lines.push(conversation.title);
    lines.push("=".repeat(conversation.title.length));
    lines.push("");
    for (const m of conversation.messages) {
      const role = m.role === "user" ? "Vous" : "Assistant";
      lines.push(`[${role} - ${new Date(m.timestamp).toLocaleString("fr-FR")}]`);
      lines.push(m.content);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
