
import { GoogleGenAI, Type, GenerateContentResponse, Chat, Modality } from "@google/genai";
import { UserStats, AIInsight, Game, Platform, Achievement, Badge } from "../types";

// Cache keys
const INSIGHT_CACHE_KEY = 'nexus_ai_insight_cache';

/**
 * Gets a fresh AI client instance.
 * Guidelines: Always use a named parameter for apiKey and process.env.API_KEY directly.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Protocolo de Emergência: Fallback para quando o Oráculo excede a cota.
 */
const FALLBACK_INSIGHT: AIInsight = {
  personaTitle: "Guerreiro do Legado Nexus",
  description: "Um veterano sintonizado cujos feitos transcendem os limites da rede. Sua trajetória é marcada pela resiliência e busca incessante pela glória imortalizada.",
  suggestedGenres: ["RPG de Ação", "Estratégia", "Souls-like"],
  improvementTip: "A consistência é sua maior arma. Mantenha o foco nos marcos raros para elevar seu Prestige.",
  potentialBadges: ["Elite Operative", "Hall Keeper"]
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
      // Normalizing error check for 429
      const errorStr = JSON.stringify(lastError);
      const isRateLimit = lastError?.status === 429 || errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit && i < maxRetries) {
        const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Nexus AI: Cota excedida. Tentando novamente em ${Math.round(waitTime)}ms... (Tentativa ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw lastError;
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
        responseModalities: [Modality.AUDIO],
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
 * Analisa o perfil gamer e gera o DNA. Usa Flash para evitar 429 em massa.
 */
export const analyzeGamingProfile = async (userStats: UserStats, forceRefresh = false): Promise<AIInsight | null> => {
  // Check Cache
  if (!forceRefresh) {
    const cached = sessionStorage.getItem(`${INSIGHT_CACHE_KEY}_${userStats.nexusId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.achievementCount === userStats.totalAchievements) {
          return parsed.insight;
        }
      } catch (e) {}
    }
  }

  try {
    return await withRetry(async () => {
      const ai = getAiClient();
      if (!ai) return FALLBACK_INSIGHT;

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
        model: 'gemini-3-flash-preview',
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

      return insight || FALLBACK_INSIGHT;
    });
  } catch (err) {
    console.error("AI Analysis failed, activating Fallback Protocol", err);
    return FALLBACK_INSIGHT;
  }
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

/**
 * Search for games using AI discovery.
 */
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

/**
 * Fixed truncated function: getTrendingGames
 */
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
      ...g, id: `trending-${Date.now()}-${Math.random()}`, hoursPlayed: 0, achievementCount: 0, lastPlayed: new Date().toISOString(),
      platform: g.platform as Platform || Platform.STEAM
    })) : [];
  }).catch(() => []);
};

/**
 * Fix for components/GameDetailView.tsx: Generates tips for achievements.
 */
export const getAchievementTip = async (gameTitle: string, achievement: Achievement): Promise<string> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return "O Oráculo está em silêncio no momento.";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dê uma dica técnica e curta de como desbloquear a conquista "${achievement.name}" (${achievement.description}) no jogo ${gameTitle}.`
    });
    return response.text || "Sem dicas disponíveis.";
  });
};

/**
 * Fix for components/NexusChronos.tsx: Generates an epic manifesto for the player.
 */
export const generatePlayerManifesto = async (userStats: UserStats): Promise<string> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return "";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um manifesto épico e curto (máximo 500 caracteres) para o jogador ${userStats.nexusId}. Ele possui ${userStats.totalHours}h e ${userStats.totalAchievements} conquistas. Foque em legado e glória.`
    });
    return response.text || "";
  });
};

/**
 * Fix for components/NexusChronos.tsx: Transforms raw journal input into an epic narrative.
 */
export const generateJournalNarrative = async (gameTitle: string, rawInput: string): Promise<{ narrative: string, mood: string }> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return { narrative: rawInput, mood: "Epic" };
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transforme o seguinte relato de jogo em uma crônica épica curta:\nJogo: ${gameTitle}\nRelato: ${rawInput}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            mood: { type: Type.STRING, enum: ["Triumphant", "Melancholic", "Intense", "Epic"] }
          },
          required: ["narrative", "mood"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : { narrative: rawInput, mood: "Epic" };
  });
};

/**
 * Fix for components/NexusOracle.tsx: Creates a stateful chat session with the Oracle.
 */
export const createOracleChat = (userStats?: UserStats): Chat => {
  const ai = getAiClient();
  if (!ai) throw new Error("AI client not available");
  
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Você é o Oráculo do Nexus, uma inteligência mística que conhece tudo sobre o universo dos games. 
      Sua missão é ajudar jogadores a desvendar lore, otimizar hardware e encontrar novos desafios. 
      ${userStats ? `Você está falando com ${userStats.nexusId}. O perfil dele tem ${userStats.totalHours}h de jogo e ${userStats.platinumCount} platinas.` : ''}
      Responda de forma heróica, mística e prestativa.`
    }
  });
};
