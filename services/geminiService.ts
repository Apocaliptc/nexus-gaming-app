
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

export const generatePlayerManifesto = async (userStats: UserStats): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Seu legado transcende os dados. A jornada continua...";
  
  const model = 'gemini-3-pro-preview';
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Escreva um manifesto épico e emocionante em português sobre a carreira deste jogador. Use os seguintes dados como base: ${JSON.stringify(userStats)}. O tom deve ser de biografia heroica.`,
      config: {
        systemInstruction: "Você é um historiador de mundos virtuais.",
      }
    });
    return response.text || "Sua jornada continua...";
  } catch (error) {
    return "Sua história é o que move o Nexus.";
  }
};

export const fetchPublicProfileData = async (platform: Platform, username: string): Promise<{ games: Game[], totalHours: number }> => {
  const ai = getAiClient();
  if (!ai) return { games: [], totalHours: 0 };
  
  const modelId = "gemini-3-flash-preview";
  const prompt = `Simule a busca de dados de um perfil público para "${username}" na plataforma "${platform}". Retorne 5 jogos realistas com conquistas.`;
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
                  genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                  achievements: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, rarity: { type: Type.STRING } } } }
                }
              }
            },
            totalHours: { type: Type.NUMBER }
          }
        }
      }
    });
    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        totalHours: data.totalHours,
        games: data.games.map((g: any) => ({
          ...g,
          id: `${platform}-${Date.now()}-${Math.random()}`,
          platform: platform,
          lastPlayed: new Date().toISOString()
        }))
      };
    }
    return { games: [], totalHours: 0 };
  } catch (error) {
    return { games: [], totalHours: 0 };
  }
};

export const searchGamesWithAI = async (searchTerm: string): Promise<Game[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Search for popular games related to: "${searchTerm}".`,
      config: {
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
    return response.text ? JSON.parse(response.text).map((g: any) => ({ ...g, id: `ai-${Math.random()}`, platform: Platform.STEAM, hoursPlayed: 0, achievementCount: 0, lastPlayed: new Date().toISOString(), achievements: [] })) : [];
  } catch (error) {
    return [];
  }
};
