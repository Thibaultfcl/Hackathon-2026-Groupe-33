import { createMockStream } from "../../../lib/mockStream";

export const runtime = "nodejs";

// Mission 2 : dès que l'équipe INFRA fournit l'URL, définir LLM_API_URL
// dans .env.local, ex: LLM_API_URL=http://localhost:11434/api/chat
// Format attendu (Ollama) :
//   POST { model: "phi3-financial", messages: [{role, content}, ...] }
//   -> réponses en ndjson streamées, chaque ligne: { message: { content }, done }
const LLM_API_URL = process.env.LLM_API_URL;
const LLM_MODEL = process.env.LLM_MODEL || "phi3-financial";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Requête invalide : JSON attendu.", { status: 400 });
  }

  const { messages, temperature, max_tokens } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Le champ 'messages' est requis.", { status: 400 });
  }

  // --- Mission 1 : pas d'API réelle configurée -> mock Lorem Ipsum ---
  if (!LLM_API_URL) {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const stream = createMockStream(lastUserMsg?.content || "");
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Mock-Source": "lorem-ipsum",
      },
    });
  }

  // --- Mission 2 : proxy vers le vrai backend (format Ollama) ---
  let upstream;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    upstream = await fetch(LLM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        stream: true,
        options: {
          temperature: temperature ?? 0.7,
          num_predict: max_tokens ?? 512,
        },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
  } catch (err) {
    const reason =
      err?.name === "AbortError"
        ? "Le modèle met trop de temps à répondre (timeout)."
        : "Impossible de contacter le serveur du modèle.";
    return new Response(reason, { status: 504 });
  }

  if (!upstream.ok) {
    const status = upstream.status;
    const reason =
      status === 503
        ? "Le modèle Phi-3.5-Financial est indisponible pour le moment."
        : `Erreur du serveur modèle (HTTP ${status}).`;
    return new Response(reason, { status });
  }

  // Le backend Ollama renvoie du ndjson ; on extrait message.content
  // et on relaie un flux texte simple au client.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const chunk = json?.message?.content;
          if (chunk) controller.enqueue(encoder.encode(chunk));
        } catch {
          // ligne non-JSON, ignorée
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Mock-Source": "live",
    },
  });
}
