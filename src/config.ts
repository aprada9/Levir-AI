import fs from 'fs';
import path from 'path';
import toml from '@iarna/toml';

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    PORT: number;
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  MODELS: {
    OPENAI: {
      API_KEY: string;
    };
    GROQ: {
      API_KEY: string;
    };
    ANTHROPIC: {
      API_KEY: string;
    };
    GEMINI: {
      API_KEY: string;
    };
    OLLAMA: {
      API_URL: string;
    };
    CUSTOM_OPENAI: {
      API_URL: string;
      API_KEY: string;
      MODEL_NAME: string;
    };
  };
  API_ENDPOINTS: {
    SEARXNG: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const loadConfigFile = (): Config | null => {
  try {
    const configPath = path.join(__dirname, `../${configFileName}`);
    if (fs.existsSync(configPath)) {
      return toml.parse(fs.readFileSync(configPath, 'utf-8')) as any as Config;
    }
    return null;
  } catch (error) {
    console.warn(`Error loading config file: ${error}`);
    return null;
  }
};

const loadConfig = () => {
  // Load from file first as fallback
  const fileConfig = loadConfigFile() || {} as Config;
  
  // Create default structure if not present
  if (!fileConfig.GENERAL) fileConfig.GENERAL = {} as any;
  if (!fileConfig.MODELS) fileConfig.MODELS = {} as any;
  if (!fileConfig.API_ENDPOINTS) fileConfig.API_ENDPOINTS = {} as any;
  if (!fileConfig.MODELS.OPENAI) fileConfig.MODELS.OPENAI = {} as any;
  if (!fileConfig.MODELS.GROQ) fileConfig.MODELS.GROQ = {} as any;
  if (!fileConfig.MODELS.ANTHROPIC) fileConfig.MODELS.ANTHROPIC = {} as any;
  if (!fileConfig.MODELS.GEMINI) fileConfig.MODELS.GEMINI = {} as any;
  if (!fileConfig.MODELS.OLLAMA) fileConfig.MODELS.OLLAMA = {} as any;
  if (!fileConfig.MODELS.CUSTOM_OPENAI) fileConfig.MODELS.CUSTOM_OPENAI = {} as any;

  return fileConfig;
};

export const getPort = () => 
  parseInt(process.env.PORT || process.env.API_PORT || '') || 
  loadConfig().GENERAL.PORT;

export const getSimilarityMeasure = () =>
  process.env.SIMILARITY_MEASURE || 
  loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getKeepAlive = () => 
  process.env.KEEP_ALIVE || 
  loadConfig().GENERAL.KEEP_ALIVE;

export const getOpenaiApiKey = () => 
  process.env.OPENAI_API_KEY || 
  loadConfig().MODELS.OPENAI.API_KEY;

export const getGroqApiKey = () => 
  process.env.GROQ_API_KEY || 
  loadConfig().MODELS.GROQ.API_KEY;

export const getAnthropicApiKey = () => 
  process.env.ANTHROPIC_API_KEY || 
  loadConfig().MODELS.ANTHROPIC.API_KEY;

export const getGeminiApiKey = () => 
  process.env.GEMINI_API_KEY || 
  loadConfig().MODELS.GEMINI.API_KEY;

export const getSearxngApiEndpoint = () =>
  process.env.SEARXNG_API_URL || 
  loadConfig().API_ENDPOINTS.SEARXNG;

export const getOllamaApiEndpoint = () => 
  process.env.OLLAMA_API_URL || 
  loadConfig().MODELS.OLLAMA.API_URL;

export const getCustomOpenaiApiKey = () =>
  process.env.CUSTOM_OPENAI_API_KEY || 
  loadConfig().MODELS.CUSTOM_OPENAI.API_KEY;

export const getCustomOpenaiApiUrl = () =>
  process.env.CUSTOM_OPENAI_API_URL || 
  loadConfig().MODELS.CUSTOM_OPENAI.API_URL;

export const getCustomOpenaiModelName = () =>
  process.env.CUSTOM_OPENAI_MODEL_NAME || 
  loadConfig().MODELS.CUSTOM_OPENAI.MODEL_NAME;

const mergeConfigs = (current: any, update: any): any => {
  if (update === null || update === undefined) {
    return current;
  }

  if (typeof current !== 'object' || current === null) {
    return update;
  }

  const result = { ...current };

  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      const updateValue = update[key];

      if (
        typeof updateValue === 'object' &&
        updateValue !== null &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = mergeConfigs(result[key], updateValue);
      } else if (updateValue !== undefined) {
        result[key] = updateValue;
      }
    }
  }

  return result;
};

export const updateConfig = (config: RecursivePartial<Config>) => {
  const currentConfig = loadConfig();
  const mergedConfig = mergeConfigs(currentConfig, config);

  fs.writeFileSync(
    path.join(__dirname, `../${configFileName}`),
    toml.stringify(mergedConfig),
  );
};
