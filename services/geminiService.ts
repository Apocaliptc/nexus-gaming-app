
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
      systemInstruction: `Você é o Oráculo do Nexus. 
      Sua personalidade é técnica, sábia e gamer. 
      ${statsContext}
      Responda em português do Brasil.`,
    },
  });
};

export const fetchPublicProfileData = async (platform: Platform, username: string): Promise<{ games: Game[], totalHours: number, sources: any[] }> => {
  const ai = getAiClient();
  if (!ai) return { games: [], totalHours: 0, sources: [] };
  
  const cleanUsername = username.replace('@', '').trim();

  const missionPrompt = `
    INSTRUÇÃO DE EXTRAÇÃO RADICAL (BYPASS DE BARREIRAS):
    1. Pesquise por perfis públicos de "${cleanUsername}" no PlayStation.
    2. Fontes OBRIGATÓRIAS: psnprofiles.com/${cleanUsername}, exophase.com/psn/user/${cleanUsername}/, e psntrophyleaders.com.
    3. Ignore avisos de "Privacidade" a menos que NÃO exista lista de jogos. Se houver 1 jogo visível, EXTRAIA TUDO.
    4. Capture: Nome dos jogos, % de troféus, quantidade de platinas e horas totais (se disponíveis).
    
    ESTIMATIVA DE HORAS (Caso o site não informe):
    - Cada Troféu de Platina = 50h
    - Cada 1% de progresso em um jogo AAA = 0.8h
    - Use esses cálculos para preencher "totalHours" se estiver em branco.

    RETORNE JSON:
    {
      "totalHours": número,
      "platinumCount": número,
      "games": [
        {
          "title": "Nome exato",
          "hoursPlayed": número,
          "achievementCount": troféus ganhos,
          "totalAchievements": total do jogo,
          "coverUrl": "url",
          "genres": ["gênero"]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: missionPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Orçamento de pensamento máximo para analisar profundamente os resultados da busca
        thinkingConfig: { thinkingBudget: 15000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalHours: { type: Type.NUMBER },
            platinumCount: { type: Type.NUMBER },
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
                },
                required: ["title", "hoursPlayed"]
              } 
            }
          },
          required: ["totalHours", "games"]
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    if (response.text) {
      const data = JSON.parse(response.text);
      
      const timestamp = Date.now();
      return { 
        totalHours: data.totalHours || 0, 
        games: data.games.map((g: any, index: number) => ({ 
          ...g, 
          id: `nx-${platform}-${g.title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`, 
          platform, 
          lastPlayed: new Date().toISOString(), 
          achievements: Array.from({ length: g.totalAchievements || 10 }).map((_, i) => ({
            id: `ach-${timestamp}-${index}-${i}`,
            name: `Troféu ${i + 1}`,
            description: `Sincronizado do ecossistema ${platform}`,
            iconUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${g.title}-${i}`,
            unlockedAt: i < (g.achievementCount || 0) ? new Date().toISOString() : undefined
          }))
        })),
        sources
      };
    }
    return { games: [], totalHours: 0, sources: [] };
  } catch (e) { 
    console.error("Nexus Scraper Error:", e);
    return { games: [], totalHours: 0, sources: [] }; 
  }
};

export const getAchievementTip = async (gameTitle: string, achievementName: string, description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Offline.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Como conquistar "${achievementName}" em "${gameTitle}"? Descrição: "${description}".`,
      config: { systemInstruction: "Mestre em troféus." }
    });
    return response.text || "Sem dicas.";
  } catch (e) { return "Erro."; }
};

export const analyzeGamingProfile = async (userStats: UserStats): Promise<AIInsight> => {
  const ai = getAiClient();
  if (!ai) return { personaTitle: "Nexus Explorer", description: "...", suggestedGenres: [], improvementTip: "" };
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise este perfil: ${JSON.stringify(userStats)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedGenres: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementTip: { type: Type.STRING }
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (e) { return null as any; }
};

export const generateJournalNarrative = async (gameTitle: string, rawInput: string): Promise<{ narrative: string, mood: string }> => {
  const ai = getAiClient();
  if (!ai) return { narrative: rawInput, mood: "Epic" };
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crônica de: Jogo ${gameTitle}, Relato ${rawInput}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { narrative: { type: Type.STRING }, mood: { type: Type.STRING } }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : { narrative: rawInput, mood: "Epic" };
  } catch (error) { return { narrative: rawInput, mood: "Epic" }; }
};

export const getGameRecommendations = async (userStats: UserStats): Promise<{title: string, reason: string}[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Recomendações para: ${userStats.recentGames.map(g => g.title).join(', ')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } }
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
      contents: "Games hypados agora.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Platform.STEAM },
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
      contents: `Busque o jogo: ${searchTerm}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                title: { type: Type.STRING },
                platform: { type: Platform.STEAM },
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

export const generatePlayerManifesto = async (stats: UserStats): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Legado.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Manifesto para: ${JSON.stringify(stats)}`,
      config: { systemInstruction: "Poeta do Nexus." }
    });
    return response.text || "...";
  } catch (e) { return "..."; }
};
