/**
 * Centralized AI Model Management
 * This file contains all AI model and provider configurations used throughout the application
 */

import { ServiceName } from "./types";

// ========================
// Type Definitions
// ========================

export interface AIProvider {
  id: ServiceName;
  name: string;
  apiLink: string;
  logo?: string;
  envKey: string;
  sdkInitializer: string;
  unstable?: boolean;
  requiresApiKey?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: ServiceName;
  logo?: string;
  features: {
    isFree?: boolean;
    isRecommended?: boolean;
    isUnstable?: boolean;
    maxTokens?: number;
    supportsVision?: boolean;
    supportsTools?: boolean;
    isPro?: boolean;
  };
  availability: {
    requiresApiKey: boolean;
    requiresPro: boolean;
  };
}

export interface ApiKey {
  service: ServiceName;
  key: string;
  addedAt: string;
}

export interface AIConfig {
  model: string;
  apiKeys: ApiKey[];
}

export interface GroupedModels {
  provider: ServiceName;
  name: string;
  models: AIModel[];
}

// ========================
// Provider Configurations
// ========================

export const PROVIDERS: Partial<Record<ServiceName, AIProvider>> = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    apiLink: "https://console.anthropic.com/",
    logo: "/logos/claude.png",
    envKey: "ANTHROPIC_API_KEY",
    sdkInitializer: "anthropic",
    unstable: false,
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    apiLink: "https://platform.openai.com/api-keys",
    logo: "/logos/chat-gpt-logo1.png",
    envKey: "OPENAI_API_KEY",
    sdkInitializer: "openai",
    unstable: false,
  },
  google: {
    id: "google",
    name: "Google",
    apiLink: "https://aistudio.google.com/app/apikey",
    logo: "/logos/gemini-logo.webp",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    sdkInitializer: "google",
    unstable: false,
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    apiLink: "https://openrouter.ai/account/api-keys",
    logo: "/logos/openrouter.png",
    envKey: "OPENROUTER_API_KEY",
    sdkInitializer: "openrouter",
    unstable: false,
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    apiLink: "https://ollama.com/",
    logo: "/logos/ollama.png",
    envKey: "",
    sdkInitializer: "ollama",
    unstable: false,
    requiresApiKey: false,
  },
};

// ========================
// Model Definitions
// ========================

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: "o3",
    name: "o3",
    provider: "openai",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gpt-5.1",
    name: "GPT-5.1",
    provider: "openai",
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 1047576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "openai",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 1047576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    features: {
      isUnstable: false,
      maxTokens: 1047576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    features: {
      isFree: true,
      isUnstable: false,
      maxTokens: 1047576,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },

  // Anthropic Models
  {
    id: "claude-opus-4-5-20250501",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "claude-sonnet-4-5-20250501",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "claude-haiku-4-5-20250501",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },

  // Google Gemini Models
  {
    id: "gemini-3.0-pro",
    name: "Gemini 3.0 Pro",
    provider: "google",
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 1048576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gemini-2.5-pro-preview-05-06",
    name: "Gemini 2.5 Pro",
    provider: "google",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 1048576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash",
    provider: "google",
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 1048576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash (Free)",
    provider: "google",
    features: {
      isFree: true,
      isRecommended: false,
      isUnstable: false,
      maxTokens: 1048576,
      supportsVision: true,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },

  // Ollama Local Models
  {
    id: "qwen2.5:7b-instruct-q4_K_M",
    name: "Qwen 2.5 7B (Local)",
    provider: "ollama",
    logo: "/logos/qwen-color.svg",
    features: {
      isFree: true,
      isRecommended: true,
      maxTokens: 32768,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  {
    id: "qwen2.5-coder:7b-instruct-q4_K_M",
    name: "Qwen 2.5 Coder 7B (Local)",
    provider: "ollama",
    logo: "/logos/qwen-color.svg",
    features: {
      isFree: true,
      maxTokens: 32768,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  {
    id: "mistral:7b-instruct-q4_K_M",
    name: "Mistral 7B (Local)",
    provider: "ollama",
    logo: "/logos/mistral-color.png",
    features: {
      isFree: true,
      maxTokens: 32768,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  {
    id: "llama3.2:3b-instruct-q8_0",
    name: "Llama 3.2 3B (Local)",
    provider: "ollama",
    logo: "/logos/llama-logo.png",
    features: {
      isFree: true,
      maxTokens: 8192,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  {
    id: "qwen2.5:3b-instruct",
    name: "Qwen 2.5 3B (Local)",
    provider: "ollama",
    logo: "/logos/qwen-color.svg",
    features: {
      isFree: true,
      maxTokens: 32768,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  // Hermes 3 - Best local model for tool/function calling
  {
    id: "hermes3:8b",
    name: "Hermes 3 8B (Local)",
    provider: "ollama",
    logo: "/logos/ollama.png",
    features: {
      isFree: true,
      maxTokens: 32768,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  // Llama 3.1 - Official Meta model with native tool calling
  {
    id: "llama3.1:latest",
    name: "Llama 3.1 8B (Local)",
    provider: "ollama",
    logo: "/logos/llama-logo.png",
    features: {
      isFree: true,
      isRecommended: true,
      maxTokens: 128000,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },
  // Mistral Nemo 12B - Larger model with better tool support
  {
    id: "mistral-nemo:12b-instruct-2407-q4_K_M",
    name: "Mistral Nemo 12B (Local)",
    provider: "ollama",
    logo: "/logos/mistral-color.png",
    features: {
      isFree: true,
      maxTokens: 128000,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false,
    },
  },

  // OpenRouter Free Models (requires OpenRouter API key, but models are free)
  {
    id: "mistralai/devstral-2512:free",
    name: "Devstral 2 123B ",
    provider: "openrouter",
    logo: "/logos/mistral-color.png",
    features: {
      isFree: true,
      isRecommended: true,
      maxTokens: 262144,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "mistralai/devstral-small",
    name: "Devstral Small 1.1",
    provider: "openrouter",
    logo: "/logos/mistral-color.png",
    features: {
      isFree: true,
      maxTokens: 131072,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 3 Nano 30B",
    provider: "openrouter",
    logo: "/logos/nvidia-color.png",
    features: {
      isFree: true,
      maxTokens: 256000,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "qwen/qwen3-coder:free",
    name: "Qwen 3 Coder 480B",
    provider: "openrouter",
    logo: "/logos/qwen-color.svg",
    features: {
      isFree: true,
      isRecommended: true,
      maxTokens: 262144,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B",
    provider: "openrouter",
    logo: "/logos/chat-gpt-logo1.png",
    features: {
      isFree: true,
      isRecommended: true,
      maxTokens: 131072,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    provider: "openrouter",
    logo: "/logos/openrouter.png",
    features: {
      isFree: true,
      maxTokens: 163840,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
  {
    id: "openai/gpt-oss-120b:free",
    name: "GPT-OSS 120B",
    provider: "openrouter",
    logo: "/logos/chat-gpt-logo1.png",
    features: {
      isFree: true,
      isRecommended: true,
      maxTokens: 131072,
      supportsVision: false,
      supportsTools: true,
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false,
    },
  },
];

// ========================
// Legacy ID Aliases
// ========================

// Map legacy or shorthand model IDs to current canonical IDs
const MODEL_ALIASES: Record<string, string> = {
  // Old GPT models
  "gpt-4-turbo": "gpt-4.1",
  "gpt-4o": "gpt-4.1",
  // Old Claude models
  "claude-4-sonnet": "claude-sonnet-4-20250514",
  "claude-3-sonnet-20240229": "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-20241022": "claude-3-7-sonnet-20250219",
  // Old Gemini models
  "gemini-pro": "gemini-3.0-pro",
  "gemini-1.5-pro": "gemini-2.5-pro-preview-05-06",
  "gemini-1.5-flash": "gemini-2.5-flash-preview-05-20",
};

// ========================
// Default Model Configuration
// ========================

export const DEFAULT_MODELS = {
  PRO_USER: "claude-opus-4-5-20250501",
  FREE_USER: "gemini-2.0-flash",
} as const;

// ========================
// Model Designations for Different Use Cases
// ========================

/**
 * Designated models for specific use cases throughout the application.
 * Change these to update which models are used globally.
 */
export const MODEL_DESIGNATIONS = {
  // Fast & cheap model for parsing, simple tasks, quick analysis
  FAST_CHEAP: "gpt-4.1-mini",

  // Alternative fast & cheap option (free for all users)
  FAST_CHEAP_FREE: "gemini-2.0-flash",

  // Frontier model for complex tasks, deep analysis, best quality
  FRONTIER: "claude-opus-4-5-20250501",

  // Alternative frontier model
  FRONTIER_ALT: "gpt-5.1",

  // Balanced model - good quality but faster/cheaper than frontier
  BALANCED: "gemini-2.5-flash-preview-05-20",

  // Vision-capable model for image analysis
  VISION: "gemini-3.0-pro",

  // Default models by user type
  DEFAULT_PRO: "claude-opus-4-5-20250501",
  DEFAULT_FREE: "gemini-2.0-flash",
} as const;

// Type for model designations
export type ModelDesignation = keyof typeof MODEL_DESIGNATIONS;

// ========================
// Utility Functions
// ========================

/**
 * Get all providers as an array
 */
export function getProvidersArray(): AIProvider[] {
  return Object.values(PROVIDERS);
}

/**
 * Get a model by its ID
 */
export function getModelById(id: string): AIModel | undefined {
  const resolvedId = MODEL_ALIASES[id] || id;
  return AI_MODELS.find((model) => model.id === resolvedId);
}

/**
 * Get a provider by its ID
 */
export function getProviderById(id: ServiceName): AIProvider | undefined {
  return PROVIDERS[id];
}

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: ServiceName): AIModel[] {
  return AI_MODELS.filter((model) => model.provider === provider);
}

/**
 * Check if a model is available for a user
 */
export function isModelAvailable(
  modelId: string,
  isPro: boolean,
  apiKeys: ApiKey[]
): boolean {
  modelId = MODEL_ALIASES[modelId] || modelId;
  // Pro users have access to all models
  //if (isPro) return true;

  const model = getModelById(modelId);
  if (!model) return false;

  // Free model (gpt-4.1-nano)
  if (model.features.isFree) return true;

  // Check if this is an OpenRouter model (contains forward slash)
  if (modelId.includes("/")) {
    return apiKeys.some((key) => key.service === "openrouter");
  }

  // Check if user has the required API key
  return apiKeys.some((key) => key.service === model.provider);
}

/**
 * Get the default model for a user type
 */
export function getDefaultModel(isPro: boolean): string {
  return isPro ? DEFAULT_MODELS.PRO_USER : DEFAULT_MODELS.FREE_USER;
}

export function getSelectedModel(): string {
  if (typeof window !== "undefined") {
    const storedModel = localStorage.getItem("resumeai-default-model");
    return storedModel || getDefaultModel(false);
  }
  return getDefaultModel(false);
}

/**
 * Get the provider for a model
 */
export function getModelProvider(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId);
  if (!model) return undefined;
  return getProviderById(model.provider);
}

export function isValidModelId(id: string): boolean {
  const model = getModelById(id);
  return !!model;
}

/**
 * Group models by provider for display
 */
export function groupModelsByProvider(): GroupedModels[] {
  const providerOrder: ServiceName[] = [
    "anthropic",
    "openai",
    "google",
    "openrouter",
    "ollama",
  ];
  const grouped = new Map<ServiceName, AIModel[]>();

  // Group models by provider
  AI_MODELS.forEach((model) => {
    if (!grouped.has(model.provider)) {
      grouped.set(model.provider, []);
    }
    grouped.get(model.provider)!.push(model);
  });

  // Return in ordered format
  return providerOrder
    .map((providerId) => {
      const provider = getProviderById(providerId);
      if (!provider) return null;

      return {
        provider: providerId,
        name: provider.name,
        models: grouped.get(providerId) || [],
      };
    })
    .filter(
      (group): group is GroupedModels =>
        group !== null && group.models.length > 0
    );
}

/**
 * Get selectable models for a user
 */
export function getSelectableModels(
  isPro: boolean,
  apiKeys: ApiKey[]
): AIModel[] {
  return AI_MODELS.filter((model) =>
    isModelAvailable(model.id, isPro, apiKeys)
  );
}

/**
 * Determine which SDK to use for a model
 */
export function getModelSDKConfig(
  modelId: string
): { provider: AIProvider; modelId: string } | undefined {
  const model = getModelById(modelId);
  if (!model) return undefined;

  const provider = getProviderById(model.provider);
  if (!provider) return undefined;

  return { provider, modelId };
}
