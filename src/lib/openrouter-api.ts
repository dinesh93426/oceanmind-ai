export type OpenRouterMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type OpenRouterResponse = {
  content: string;
  modelUsed: string;
  source: "OpenRouter DeepSeek (Live)" | "Marine AI Knowledge Engine";
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const STORAGE_KEY = "oceanmind_openrouter_api_key";

export const OPENROUTER_MODELS = [
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3 Chat", provider: "DeepSeek" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1 Reasoning", provider: "DeepSeek" },
];

/**
 * Retrieve OpenRouter API Key from .env or localStorage
 */
export function getOpenRouterApiKey(): string {
  const envKey =
    (typeof import.meta !== "undefined" && import.meta.env ? import.meta.env["VITE_OPENROUTER_API_KEY"] : undefined) ||
    (typeof process !== "undefined" && process.env ? process.env["VITE_OPENROUTER_API_KEY"] : undefined);

  if (typeof envKey === "string" && envKey.trim().length > 0) {
    return envKey.trim();
  }
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length > 0) return saved.trim();
  }
  return "";
}

/**
 * Save OpenRouter API Key to localStorage
 */
export function setOpenRouterApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent("openrouter-key-changed", { detail: key.trim() }));
  }
}

export function getOpenRouterModel(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("oceanmind_openrouter_model");
    if (saved) return saved;
  }
  return "deepseek/deepseek-chat";
}

export function setOpenRouterModel(modelId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("oceanmind_openrouter_model", modelId);
  }
}

/**
 * Send chat message history to OpenRouter DeepSeek Chat API
 */
export async function sendOpenRouterChatMessage(
  history: OpenRouterMessage[],
  selectedModel: string = "deepseek/deepseek-chat",
): Promise<OpenRouterResponse> {
  const apiKey = getOpenRouterApiKey();

  const systemMessage: OpenRouterMessage = {
    role: "system",
    content:
      "You are AquaIntel AI Marine Research Assistant, an expert oceanographer, marine biologist, and climate scientist. Provide detailed, accurate, research-grade answers about ocean conditions, marine species, coral reef health, thermal currents, and oceanography. Format your response cleanly using Markdown, including headers, bullet points, lists, and scientific references where applicable.",
  };

  const payloadMessages = [systemMessage, ...history];

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://aquaintel.ai",
        "X-Title": "AquaIntel AI Marine Assistant",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `OpenRouter API error (HTTP ${res.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content;
    if (!replyText) {
      throw new Error("No response content received from OpenRouter DeepSeek model.");
    }

    return {
      content: replyText,
      modelUsed: data.model || selectedModel,
      source: "OpenRouter DeepSeek (Live)",
      usage: data.usage,
    };
  } catch (err: unknown) {
    console.error("OpenRouter DeepSeek API call failed:", err);
    throw err;
  }
}
