import { createHash } from "crypto";

export type Citation = {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  score?: number;
};

type RetrievalResult = {
  doc_id?: string | null;
  title?: string | null;
  url?: string | null;
  text?: string | null;
  score?: number | null;
};

type RetrievalResponse = {
  query: string;
  k: number;
  results: RetrievalResult[];
};

const DEFAULT_RETRIEVAL_URL = "http://localhost:8081";

function buildSnippet(text: string, maxLength = 220) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}

function stableIdFromResult(result: RetrievalResult, index: number) {
  if (result.doc_id && result.doc_id.trim()) {
    return result.doc_id.trim();
  }
  const seed = `${result.title ?? ""}|${result.url ?? ""}|${result.text ?? ""}|${index}`;
  return createHash("sha1").update(seed).digest("hex");
}

export async function search(query: string, k: number) {
  const baseUrl = process.env.RETRIEVAL_URL ?? DEFAULT_RETRIEVAL_URL;
  const url = `${baseUrl.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&k=${k}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        citations: [] as Citation[],
        contextText: "",
        offlineMessage: "Retrieval server returned an error.",
      };
    }

    const data = (await response.json()) as RetrievalResponse;
    const results = Array.isArray(data.results) ? data.results : [];

    const citations = results.map((result, index) => {
      const title = result.title?.trim() || "Untitled source";
      const snippetSource = result.text?.trim() || "";
      return {
        id: stableIdFromResult(result, index),
        title,
        url: result.url?.trim() || undefined,
        snippet: buildSnippet(snippetSource),
        score: typeof result.score === "number" ? result.score : undefined,
      } as Citation;
    });

    const contextText = citations
      .map((citation) => citation.snippet)
      .filter(Boolean)
      .join("\n\n");

    return { citations, contextText, offlineMessage: "" };
  } catch (error) {
    return {
      citations: [] as Citation[],
      contextText: "",
      offlineMessage: "Retrieval server is offline. Start it with `uvicorn scripts.retrieval_server:app --reload --port 8081`."
    };
  }
}
