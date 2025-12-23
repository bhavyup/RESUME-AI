import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOllama } from 'ollama-ai-provider';
import { LanguageModelV1 } from 'ai';
import { 
  getModelById, 
  getModelProvider,
  type AIConfig
} from '@/lib/ai-models';

// Re-export types for backward compatibility
export type { ApiKey, AIConfig } from '@/lib/ai-models';

/**
 * Initializes an AI client based on the provided configuration
 * Falls back to default OpenAI configuration if no config is provided
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  void useThinking; // Keep for future use

  // Handle Pro subscription with environment variables
  if (isPro && config) {
    const { model } = config;
    const modelData = getModelById(model);
    const resolvedModelId = modelData?.id ?? model;
    const provider = modelData ? getModelProvider(resolvedModelId) : undefined;
    
    if (!modelData || !provider) {
      throw new Error(`Unknown model: ${model}`);
    }

    // Create the appropriate SDK client based on provider
    switch (provider.id) {
      case 'ollama':
        // Ollama doesn't need an API key (local)
        return createOllama({
          baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api'
        })(resolvedModelId) as LanguageModelV1;
      
      case 'anthropic':
        const anthropicKey = process.env[provider.envKey];
        if (!anthropicKey) {
          throw new Error(`${provider.name} API key not found (${provider.envKey})`);
        }
        return createAnthropic({ apiKey: anthropicKey })(resolvedModelId) as LanguageModelV1;
      
      case 'openai':
        const openaiKey = process.env[provider.envKey];
        if (!openaiKey) {
          throw new Error(`${provider.name} API key not found (${provider.envKey})`);
        }
        // Check if this is actually an OpenRouter model (contains forward slash)
        if (resolvedModelId.includes('/')) {
          // Use OpenRouter for models with provider prefix
          const openRouterKey = process.env.OPENROUTER_API_KEY;
          if (!openRouterKey) {
            throw new Error('OpenRouter API key not found (OPENROUTER_API_KEY)');
          }
          return createOpenRouter({
            apiKey: openRouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
            headers: {
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              'X-Title': 'ResumeAI'
            },
            
          })(resolvedModelId) as LanguageModelV1;
        }
        // Regular OpenAI models
        return createOpenAI({ 
          apiKey: openaiKey,
          compatibility: 'strict'
        })(resolvedModelId) as LanguageModelV1;
      
      case 'google':
        const googleKey = process.env[provider.envKey];
        if (!googleKey) {
          throw new Error(`${provider.name} API key not found (${provider.envKey})`);
        }
        return createGoogleGenerativeAI({ apiKey: googleKey })(resolvedModelId) as LanguageModelV1;
      
      case 'openrouter':
        const openrouterKey = process.env[provider.envKey];
        if (!openrouterKey) {
          throw new Error(`${provider.name} API key not found (${provider.envKey})`);
        }
        return createOpenRouter({
          apiKey: openrouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeAI'
          }
        })(resolvedModelId) as LanguageModelV1;
      
      default:
        throw new Error(`Unsupported provider: ${provider.id}`);
    }
  }

  // Existing logic for free users
  if (!config) {
    return createOpenAI({ apiKey: '' })('no-model') as LanguageModelV1;
  }

  const { model, apiKeys } = config;
  const modelData = getModelById(model);
  const resolvedModelId = modelData?.id ?? model;
  const provider = modelData ? getModelProvider(resolvedModelId) : undefined;
  
  if (!modelData || !provider) {
    throw new Error(`Unknown model: ${model}`);
  }
  
  // Special case: Free models for all users
  // Also allow GPT OSS models to use server-side OpenRouter key
  if (modelData.features.isFree || resolvedModelId.includes('/')) {
    // Ollama models are always free (local) - NO API KEY NEEDED
    if (provider.id === 'ollama') {
      return createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api'
      })(resolvedModelId) as LanguageModelV1;
    }
    
    // For OpenRouter models (with slash), use OpenRouter key
    if (resolvedModelId.includes('/')) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) throw new Error('OpenRouter API key not found');
      
      return createOpenRouter({
        apiKey: openRouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'ResumeAI'
        }
      })(resolvedModelId) as LanguageModelV1;
    }
    
    // For regular free models that need API keys
    const envKey = process.env[provider.envKey];
    if (!envKey) throw new Error(`${provider.name} API key not found`);
    
    if (provider.id === 'openai') {
      return createOpenAI({ 
        apiKey: envKey,
        compatibility: 'strict',
      })(resolvedModelId) as LanguageModelV1;
    }
    
    if (provider.id === 'google') {
      return createGoogleGenerativeAI({ apiKey: envKey })(resolvedModelId) as LanguageModelV1;
    }
  }
  
  // For non-free models, user must provide their own API key
  const userApiKey = apiKeys.find(k => k.service === provider.id)?.key;
  if (!userApiKey) {
    throw new Error(`${provider.name} API key not found in user configuration`);
  }

  // Create the appropriate SDK client based on provider
  switch (provider.id) {
    case 'anthropic':
      return createAnthropic({ apiKey: userApiKey })(resolvedModelId) as LanguageModelV1;
    
    case 'openai':
      // Check if this is actually an OpenRouter model (contains forward slash)
      if (resolvedModelId.includes('/')) {
        // Use OpenRouter for models with provider prefix
        const openRouterKey = apiKeys.find(k => k.service === 'openrouter')?.key;
        if (!openRouterKey) {
          throw new Error('OpenRouter API key not found in user configuration');
        }
        return createOpenRouter({
          apiKey: openRouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeAI'
          }
        })(resolvedModelId) as LanguageModelV1;
      }
      // Regular OpenAI models
      return createOpenAI({ 
        apiKey: userApiKey,
        compatibility: 'strict'
      })(resolvedModelId) as LanguageModelV1;
    
    case 'google':
      return createGoogleGenerativeAI({ apiKey: userApiKey })(resolvedModelId) as LanguageModelV1;
    
    case 'openrouter':
      return createOpenRouter({
        apiKey: userApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'ResumeAI'
        }
      })(resolvedModelId) as LanguageModelV1;
    
    case 'ollama':
      // Ollama doesn't need API key - it's local
      return createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api'
      })(resolvedModelId) as LanguageModelV1;
    
    default:
      throw new Error(`Unsupported provider: ${provider.id}`);
  }
}
