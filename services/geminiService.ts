
import { GoogleGenAI, Type } from "@google/genai";
import { UserStats, AIInsight, Game, Platform, ChallengeType, Achievement, JournalEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateJournalNarrative = async (gameTitle: string, rawInput: string): Promise<{ narrative: string, mood: string }> => {
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
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze the following user stats and provide a gaming persona: ${JSON.stringify(userStats)}`,
      config: {
        systemInstruction: "You are a master gaming analyst. Categorize the user based on their playtime, achievements, and genres. Be creative and encouraging.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaTitle: { type: Type.STRING, description: "A creative title for the user's gaming persona." },
            description: { type: Type.STRING, description: "A summary of their gaming style and habits." },
            suggestedGenres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 genres they might enjoy next." },
            improvementTip: { type: Type.STRING, description: "A tip on how they can improve or diversify their gaming." }
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
      description: "You have a diverse library and a strong dedication to your games.",
      suggestedGenres: ["RPG", "Action", "Indie"],
      improvementTip: "Try exploring some niche indie titles to broaden your horizons."
    };
  }
};

export const generatePlayerManifesto = async (userStats: UserStats): Promise<string> => {
  const model = 'gemini-3-pro-preview';
  try {
    const response = await ai.models.generateContent({
      model,
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
  const modelId = "gemini-3-flash-preview";
  const prompt = `Simulate a public profile data fetch for "${username}" on "${platform}". Return 5 realistic games with achievements.`;
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
