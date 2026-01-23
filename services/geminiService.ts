
import { GoogleGenAI, Type, GenerateContentResponse, Chat, Modality } from "@google/genai";
import { UserStats, AIInsight, Game, Platform, Achievement, Badge } from "../types";

// Cache keys
const INSIGHT_CACHE_KEY = 'nexus_ai_insight_cache';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper para lidar com retentativas em caso de erro 429 (Quota Exceeded)
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err?.message?.includes('429') || err?.status === 429 || JSON.stringify(err).includes('429');
      
      if (isRateLimit && i < maxRetries) {
        const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Nexus AI: Cota excedida. Tentando novamente em ${Math.round(waitTime)}ms... (Tentativa ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Generates speech from text using the Oracle's voice.
 */
export const generateOracleSpeech = async (text: string): Promise<string | undefined> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return undefined;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga de forma heróica e mística: ${text}` }] }],
      config: {
        responseModalalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }).catch(() => undefined);
};

/**
 * Analisa o perfil gamer e gera o DNA. Inclui cache de sessão.
 */
export const analyzeGamingProfile = async (userStats: UserStats, forceRefresh = false): Promise<AIInsight | null> => {
  // Check Cache
  if (!forceRefresh) {
    const cached = sessionStorage.getItem(`${INSIGHT_CACHE_KEY}_${userStats.nexusId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Only use cache if it was for the same achievement count (simple heuristic)
        if (parsed.achievementCount === userStats.totalAchievements) {
          return parsed.insight;
        }
      } catch (e) {}
    }
  }

  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `
      Analise o seguinte perfil gamer unificado:
      - Total de Horas: ${userStats.totalHours}
      - Conquistas Totais: ${userStats.totalAchievements}
      - Platinas: ${userStats.platinumCount}
      - Jogos Recentes: ${userStats.recentGames.slice(0, 5).map(g => `${g.title} (${g.platform})`).join(", ")}
      
      Gere um JSON com:
      1. personaTitle: Nome épico.
      2. description: Narrativa curta da jornada.
      3. suggestedGenres: 3 gêneros.
      4. improvementTip: Dica técnica.
      5. potentialBadges: 2 nomes de badges.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedGenres: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementTip: { type: Type.STRING },
            potentialBadges: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["personaTitle", "description", "suggestedGenres", "improvementTip", "potentialBadges"]
        }
      }
    });

    const insight = response.text ? JSON.parse(response.text) : null;
    
    if (insight) {
      sessionStorage.setItem(`${INSIGHT_CACHE_KEY}_${userStats.nexusId}`, JSON.stringify({
        achievementCount: userStats.totalAchievements,
        insight
      }));
    }

    return insight;
  }).catch(err => {
    console.error("AI Analysis failed after retries", err);
    return null;
  });
};

/**
 * Pesquisa pública de dados com retry.
 */
export const fetchPublicProfileData = async (platform: Platform, username: string): Promise<{ games: Game[], totalHours: number, sources: any[] }> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return { games: [], totalHours: 0, sources: [] };
    
    const cleanUsername = username.replace('@', '').trim();
    const scraperPrompt = `
      Aja como um Nexus Intelligent Crawler.
      ALVO: Usuário ${cleanUsername} na plataforma ${platform}.
      GROUNDING: Use Google Search para encontrar estatísticas públicas (horas, conquistas, jogos recentes).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: scraperPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalHours: { type: Type.NUMBER },
            games: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  title: { type: Type.STRING }, 
                  hoursPlayed: { type: Type.NUMBER }, 
                  achievementCount: { type: Type.NUMBER }, 
                  totalAchievements: { type: Type.NUMBER }, 
                  coverUrl: { type: Type.STRING }, 
                  genres: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              } 
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return { 
        totalHours: data.totalHours || 0, 
        games: (data.games || []).map((g: any) => ({ ...g, id: `nx-${Date.now()}-${Math.random()}`, platform })),
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }
    return { games: [], totalHours: 0, sources: [] };
  }).catch(() => ({ games: [], totalHours: 0, sources: [] }));
};

export const searchGamesWithAI = async (query: string): Promise<Game[]> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return [];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Encontre 4 jogos relacionados a: "${query}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              coverUrl: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              totalAchievements: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text).map((g: any) => ({
      ...g, id: `search-${Date.now()}-${Math.random()}`, hoursPlayed: 0, achievementCount: 0, lastPlayed: new Date().toISOString(),
      platform: g.platform as Platform || Platform.STEAM
    })) : [];
  }).catch(() => []);
};

export const getTrendingGames = async (): Promise<Game[]> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return [];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Quais são os 4 jogos mais populares do momento?",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              coverUrl: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              hypeLevel: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text).map((g: any) => ({
      ...g, id: `trend-${Date.now()}-${Math.random()}`, hoursPlayed: 0, achievementCount: 0, totalAchievements: 50, lastPlayed: new Date().toISOString(),
      platform: g.platform as Platform || Platform.STEAM
    })) : [];
  }).catch(() => []);
};

export const getGameRecommendations = async (userStats: UserStats): Promise<{title: string, reason: string}[]> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return [];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Recomende 3 jogos para este perfil: ${JSON.stringify(userStats.recentGames.map(g => g.title))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  }).catch(() => []);
};

export const createOracleChat = (userStats?: UserStats): Chat | null => {
  const ai = getAiClient();
  if (!ai) return null;
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "Você é o Oráculo do Nexus. Seu tom é sábio, técnico e inspirador.",
    },
  });
};

export const getAchievementTip = async (gameTitle: string, achievementName: string, description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Oráculo offline.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Dica curta para "${achievementName}" em "${gameTitle}": "${description}"`,
  });
  return response.text || "Nenhuma dica disponível.";
};

export const generatePlayerManifesto = async (userStats: UserStats): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "";
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crie um manifesto épico para ${userStats.nexusId} (${userStats.totalHours}h).`,
  });
  return response.text || "";
};

export const generateJournalNarrative = async (gameTitle: string, rawInput: string): Promise<{ narrative: string, mood: string }> => {
  const ai = getAiClient();
  if (!ai) return { narrative: rawInput, mood: "Neutral" };
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transforme em narrativa épica: "${rawInput}" (${gameTitle})`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING },
          mood: { type: Type.STRING }
        }
      }
    }
  });
  return response.text ? JSON.parse(response.text) : { narrative: rawInput, mood: "Epic" };
};
