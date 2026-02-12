type LlamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LlamaChatResponse = {
  choices?: Array<{
    message?: { role?: string; content?: string };
  }>;
};

const DEFAULT_LLAMA_BASE_URL = "http://127.0.0.1:8082";
const DEFAULT_LLAMA_MODEL = "Meta-Llama-3.1-8B-Instruct-IQ2_M.gguf";

function resolveBaseUrl() {
  return (process.env.LLAMA_BASE_URL ?? DEFAULT_LLAMA_BASE_URL).replace(/\/$/, "");
}

function resolveModel() {
  return process.env.LLAMA_MODEL ?? DEFAULT_LLAMA_MODEL;
}

export async function chatWithLlama(params: {
  messages: LlamaMessage[];
  maxTokens?: number;
  temperature?: number;
}) {
  const { messages, maxTokens = 512, temperature = 0.4 } = params;
  const baseUrl = resolveBaseUrl();
  const model = resolveModel();

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    }),
    signal: AbortSignal.timeout(60_000)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `llama.cpp error (${response.status}): ${body || response.statusText}`
    );
  }

  const data = (await response.json()) as LlamaChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("llama.cpp returned an empty response.");
  }

  return content;
}
