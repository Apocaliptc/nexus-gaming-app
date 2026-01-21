
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { UserStats, AIInsight, Game, Platform, Achievement, JournalEntry } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Nexus AI: API_KEY is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const createOracleChat = (userStats?: UserStats): Chat | null => {
  const ai = getAiClient();
  if (!ai) return null;

  const statsContext = userStats 
    ? `O usuário atual tem ${userStats.totalHours}h de jogo e seus jogos recentes incluem: ${userStats.recentGames.map(g => g.title).join(', ')}.` 
    : "";

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Você é o Oráculo do Nexus, a inteligência artificial definitiva e guardiã do conhecimento gamer. 
      Sua especialidade abrange: Lore profunda de jogos, estratégias de combate, especificações técnicas de hardware, história da indústria e recomendações personalizadas.
      ${statsContext}
      Sua personalidade é sábia, um pouco misteriosa, mas extremamente prestativa e técnica quando necessário. 
      Responda sempre em português do Brasil, use formatação Markdown para clareza e seja apaixonado por jogos.`,
    },
  });
};

export const getAchievementTip = async (gameTitle: string, achievementName: string, description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "O Oráculo está offline no momento. Tente novamente mais tarde.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Como eu conquisto o troféu "${achievementName}" no jogo "${gameTitle}"? A descrição oficial é: "${description}". Me dê 3 dicas práticas e rápidas.`,
      config: {
        systemInstruction: "Você é um mestre em detonados e guias de troféus (estilo PowerPyx). Forneça dicas técnicas, passos claros e configurações sugeridas para obter a conquista mencionada. Seja direto e use português do Brasil."
      }
    });
    return response.text || "Não consegui encontrar uma estratégia para este troféu específico.";
  } catch (e) {
    return "Erro ao contatar o Plano de Dados do Oráculo.";
  }
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
  if (!ai) return { personaTitle: "Nexus Explorer", description: "...", suggestedGenres: [], improvementTip: "" };

  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analise: ${JSON.stringify(userStats)}`,
      config: {
        systemInstruction: "Analista de jogos. Categorize o usuário. Português.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedGenres: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementTip: { type: Type.STRING }
          },
          required: ["personaTitle", "description", "suggestedGenres", "improvementTip"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (e) { return null as any; }
};

export const getGameRecommendations = async (userStats: UserStats): Promise<{title: string, reason: string}[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Recomende 3 jogos para: ${userStats.recentGames.map(g => g.title).join(', ')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } },
            required: ["title", "reason"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (e) { return []; }
};

export const getTrendingGames = async (): Promise<Game[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Jogos em hype 2024/2025.",
      config: {
        tools: [{ googleSearch: {} }],
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
              hypeLevel: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((g: any) => ({ ...g, id: `tr-${Math.random()}`, lastPlayed: new Date().toISOString(), hoursPlayed: 0, achievementCount: 0, achievements: [] }));
    }
    return [];
  } catch (e) { return []; }
};

export const searchGamesWithAI = async (searchTerm: string): Promise<Game[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Busque: ${searchTerm}`,
      config: {
        tools: [{ googleSearch: {} }],
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
    return response.text ? JSON.parse(response.text).map((g: any) => ({ ...g, id: `ai-${Math.random()}`, hoursPlayed: 0, achievementCount: 0, lastPlayed: new Date().toISOString(), achievements: [] })) : [];
  } catch (e) { return []; }
};

export const fetchPublicProfileData = async (platform: Platform, username: string): Promise<{ games: Game[], totalHours: number }> => {
  const ai = getAiClient();
  if (!ai) return { games: [], totalHours: 0 };
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rastreie perfil de ${platform} para "${username}".`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalHours: { type: Type.NUMBER },
            games: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, hoursPlayed: { type: Type.NUMBER }, achievementCount: { type: Type.NUMBER }, totalAchievements: { type: Type.NUMBER }, coverUrl: { type: Type.STRING }, genres: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
          }
        }
      }
    });
    if (response.text) {
      const data = JSON.parse(response.text);
      return { totalHours: data.totalHours || 0, games: data.games.map((g: any) => ({ ...g, id: `syn-${Math.random()}`, platform, lastPlayed: new Date().toISOString(), achievements: [] })) };
    }
    return { games: [], totalHours: 0 };
  } catch (e) { return { games: [], totalHours: 0 }; }
};

export const generatePlayerManifesto = async (stats: UserStats): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Seu legado aguarda.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Manifesto para: ${JSON.stringify(stats)}`,
      config: { systemInstruction: "Poeta do Nexus. Português." }
    });
    return response.text || "...";
  } catch (e) { return "..."; }
};
