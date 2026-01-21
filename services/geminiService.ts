
import { GoogleGenAI, Type } from "@google/genai";
import { UserStats, AIInsight, Game, Platform, ChallengeType, Achievement, JournalEntry } from "../types";

// Helper to obtain a fresh GoogleGenAI client using process.env.API_KEY
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Nexus AI: API_KEY is missing. AI features will use fallback responses.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateJournalNarrative = async (gameTitle: string, rawInput: string): Promise<{ narrative: string, mood: string }> => {
  const ai = getAiClient();
  if (!ai) return { narrative: rawInput, mood: "Epic" };
  
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `O jogador disse o seguinte sobre sua sessão em "${gameTitle}": "${rawInput}". Transforme isso em uma entrada poética e emocionante para um diário de vida gamer.`,
      config: {
        systemInstruction: "Você é o Cronista do Nexus. Sua missão é elevar as experiências comuns de jogo ao nível de lendas épicas. Escreva em português, de forma envolvente e curta.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            mood: { type: Type.STRING, description: "A one-word description of the mood (e.g., Triumphant, Melancholic, Intense)" }
          },
          required: ["narrative", "mood"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to generate narrative");
  } catch (error) {
    return {
      narrative: rawInput,
      mood: "Epic"
    };
  }
};

export const analyzeGamingProfile = async (userStats: UserStats): Promise<AIInsight> => {
  const ai = getAiClient();
  if (!ai) {
    return {
      personaTitle: "The Nexus Explorer",
      description: "Você tem uma biblioteca diversa e uma forte dedicação aos seus jogos.",
      suggestedGenres: ["RPG", "Ação", "Indie"],
      improvementTip: "Tente explorar alguns títulos indie de nicho para ampliar seus horizontes."
    };
  }

  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analise os seguintes dados de jogador e forneça uma persona gamer em português: ${JSON.stringify(userStats)}`,
      config: {
        systemInstruction: "Você é um mestre analista de jogos. Categorize o usuário com base em seu tempo de jogo, conquistas e gêneros. Seja criativo, encorajador e escreva sempre em português do Brasil.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaTitle: { type: Type.STRING, description: "Um título criativo para a persona gamer do usuário." },
            description: { type: Type.STRING, description: "Um resumo de seu estilo de jogo e hábitos." },
            suggestedGenres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 gêneros que eles podem gostar a seguir." },
            improvementTip: { type: Type.STRING, description: "Uma dica de como eles podem melhorar ou diversificar seu jogo." }
          },
          required: ["personaTitle", "description", "suggestedGenres", "improvementTip"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to get persona insight");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      personaTitle: "The Nexus Explorer",
      description: "Você tem uma biblioteca diversa e uma forte dedicação aos seus jogos.",
      suggestedGenres: ["RPG", "Ação", "Indie"],
      improvementTip: "Tente explorar alguns títulos indie de nicho para ampliar seus horizontes."
    };
  }
};

export const getGameRecommendations = async (userStats: UserStats): Promise<{title: string, reason: string}[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Com base nesses jogos: ${userStats.recentGames.map(g => g.title).join(', ')}, recomende 3 novos jogos em português.`,
      config: {
        systemInstruction: "Você é um recomendador de jogos especialista. Para cada jogo, dê o título e uma razão curta de por que o jogador vai gostar, baseada no estilo dele.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["title", "reason"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (e) {
    return [];
  }
};

export const getTrendingGames = async (): Promise<Game[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Identifique os 8 jogos mais quentes (em hype) ou lançados nos últimos meses de 2024 e início de 2025 que estão dominando as discussões (PC, consoles).",
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é um especialista em tendências da indústria de games. Use a busca do Google para encontrar quais jogos estão sendo mais comentados agora, quais bateram recordes de jogadores e quais são as tendências de 'hype'.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              totalAchievements: { type: Type.NUMBER },
              coverUrl: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              hypeLevel: { type: Type.NUMBER, description: "Nível de hype de 1 a 100" }
            }
          }
        }
      }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((g: any) => ({
        ...g,
        id: `trending-${Math.random()}`,
        platform: g.platform as Platform || Platform.STEAM,
        hoursPlayed: 0,
        achievementCount: 0,
        lastPlayed: new Date().toISOString(),
        achievements: []
      }));
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch trending games:", e);
    return [];
  }
};

export const searchGamesWithAI = async (searchTerm: string): Promise<Game[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Busque por jogos existentes ou futuros relacionados a: "${searchTerm}".`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é o Oráculo do Nexus. Use a busca do Google para encontrar informações precisas sobre jogos reais, incluindo plataformas e capas. Se o jogo for de e-sport, destaque isso.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              totalAchievements: { type: Type.NUMBER },
              coverUrl: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text).map((g: any) => ({ ...g, id: `ai-${Math.random()}`, platform: g.platform as Platform || Platform.STEAM, hoursPlayed: 0, achievementCount: 0, lastPlayed: new Date().toISOString(), achievements: [] })) : [];
  } catch (error) {
    return [];
  }
};

export const fetchPublicProfileData = async (platform: Platform, username: string): Promise<{ games: Game[], totalHours: number }> => {
    const ai = getAiClient();
    if (!ai) return { games: [], totalHours: 0 };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Simule o rastreamento (scraping) de um perfil público de ${platform} para o usuário "${username}". Traga dados realistas baseados em perfis comuns dessa plataforma.`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "Você simula um crawler de estatísticas gamer (estilo R6Tracker). Use o Google Search para encontrar padrões de jogos populares na plataforma e gere dados fictícios, mas plausíveis para este usuário.",
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
                games: data.games.map((g: any) => ({
                    ...g,
                    id: `sync-${Math.random()}`,
                    platform,
                    lastPlayed: new Date().toISOString(),
                    achievements: []
                }))
            };
        }
        return { games: [], totalHours: 0 };
    } catch (e) {
        return { games: [], totalHours: 0 };
    }
};

export const generatePlayerManifesto = async (stats: UserStats): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Seu legado aguarda.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Escreva um manifesto épico e poético sobre o legado deste jogador com base em suas estatísticas: ${JSON.stringify(stats)}.`,
            config: {
                systemInstruction: "Você é o Poeta do Nexus. Escreva um texto emocionante em português do Brasil que exalte as conquistas, as horas de dedicação e a alma gamer do usuário."
            }
        });
        return response.text || "Seu legado aguarda.";
    } catch (e) {
        return "Seu legado aguarda.";
    }
}
