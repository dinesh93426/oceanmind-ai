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
const MODEL_STORAGE_KEY = "oceanmind_openrouter_model";

export const OPENROUTER_MODELS = [
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3 Chat", provider: "DeepSeek" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1 Reasoning", provider: "DeepSeek" },
  { id: "deepseek/deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill Llama", provider: "DeepSeek" },
];

/**
 * Retrieve OpenRouter API Key from .env or localStorage
 */
export function getOpenRouterApiKey(): string {
  const envKey = import.meta.env["VITE_OPENROUTER_API_KEY"];
  if (typeof envKey === "string" && envKey.trim().length > 0) {
    return envKey.trim();
  }
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved.trim();
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

/**
 * Retrieve active OpenRouter model
 */
export function getOpenRouterModel(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    if (saved) return saved;
  }
  return "deepseek/deepseek-chat";
}

/**
 * Set active OpenRouter model
 */
export function setOpenRouterModel(modelId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MODEL_STORAGE_KEY, modelId);
  }
}

/**
 * Send chat message history to OpenRouter DeepSeek Chat API
 */
export async function sendOpenRouterChatMessage(
  history: OpenRouterMessage[],
  selectedModel?: string,
): Promise<OpenRouterResponse> {
  const apiKey = getOpenRouterApiKey();
  const model = selectedModel || getOpenRouterModel();

  if (!apiKey) {
    // Return simulated expert response if key is missing
    return {
      content: generateFallbackMarineAiResponse(history[history.length - 1]?.content || ""),
      modelUsed: `${model} (Demo / Knowledge Base)`,
      source: "Marine AI Knowledge Engine",
    };
  }

  const systemMessage: OpenRouterMessage = {
    role: "system",
    content:
      "You are OceanMind AI Marine Research Assistant, a world-class oceanographer, marine biologist, and climate scientist. Provide thorough, research-grade answers about ocean science, marine species, coral reefs, sea surface temperatures, salinity, ocean currents, and climate change impacts. Format your response cleanly using Markdown, including bullet points, code or tables where appropriate, and scientific references.",
  };

  const payloadMessages = [systemMessage, ...history];

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://oceanmind.ai",
        "X-Title": "OceanMind AI Marine Assistant",
      },
      body: JSON.stringify({
        model,
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
        // ignore parse error
      }

      throw new Error(errorMsg);
    }

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content;
    if (!replyText) {
      throw new Error("No response message returned from OpenRouter DeepSeek API.");
    }

    return {
      content: replyText,
      modelUsed: data.model || model,
      source: "OpenRouter DeepSeek (Live)",
      usage: data.usage,
    };
  } catch (err: unknown) {
    console.error("OpenRouter DeepSeek API call failed:", err);
    throw err;
  }
}

/**
 * Simulated scientific fallback response when key is not present
 */
function generateFallbackMarineAiResponse(prompt: string): string {
  const q = prompt.toLowerCase();
  if (q.includes("tuna")) {
    return "Yellowfin tuna (Thunnus albacares) track sharp ocean fronts rather than fixed routes. Western boundary currents (e.g. Kuroshio and Gulf Stream) concentrate prey along 22–28 °C isotherms.\n\n| Ocean Current | Effect on Migration |\n| --- | --- |\n| Kuroshio Current | Northward seasonal shift |\n| Gulf Stream | Aggregation of prey along frontal eddies |\n| Equatorial Countercurrent | Trans-oceanic spawning movements |\n\nReferences: Nakamura et al. 2026; Duarte & Mehta 2025.";
  }
  if (q.includes("el niño") || q.includes("enso")) {
    return "El Niño Southern Oscillation (ENSO) disrupts tropical ocean upwelling by weakening trade winds across the Pacific Basin. This suppresses nutrient-rich thermocline upwelling along South America, leading to SST anomalies of +1.5 to +3.0 °C.\n\nKey Ocean Impacts:\n- Reduced chlorophyll concentration in epipelagic zones.\n- Poleward migration of pelagic fish stocks.\n- Mass coral bleaching across tropical reef sanctuaries.";
  }
  return `Research analysis for "${prompt}":\n\n- **Upper Mixed Layer Dynamics**: Sea surface temperature gradients dictate habitat suitability across pelagic species.\n- **Salinity & Upwelling**: Coastal upwelling zones yield chlorophyll concentration spikes (>0.5 mg/m³).\n- **Observed Trend**: 10-year satellite altimetry indicates a 0.8° latitude poleward shift in pelagic isotherms.\n\n*Configure VITE_OPENROUTER_API_KEY in .env for live DeepSeek AI reasoning.*`;
}
