
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { UserStats, AIInsight, Game, Platform, Achievement, Badge, CollectionItem } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorStr = JSON.stringify(lastError);
      if ((lastError?.status === 429 || errorStr.includes('429')) && i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export const analyzeGamingProfile = async (stats: UserStats, force = false): Promise<AIInsight | null> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return null;

    const prompt = `Analise este perfil de jogador e retorne um JSON:
    ID: ${stats.nexusId}
    Horas: ${stats.totalHours}
    Conquistas: ${stats.totalAchievements}
    Jogos: ${stats.recentGames.map(g => g.title).join(', ')}
    Gêneros: ${stats.genreDistribution.map(d => d.name).join(', ')}
    
    Retorne no formato:
    {
      "personaTitle": "Título Épico",
      "description": "Descrição curta do estilo",
      "suggestedGenres": ["Gênero 1", "Gênero 2"],
      "improvementTip": "Dica de performance",
      "potentialBadges": ["Badge 1", "Badge 2"]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  });
};

export const parseCollectionSpreadsheet = async (text: string): Promise<CollectionItem[]> => {
  return withRetry(async () => {
    const ai = getAiClient();
    if (!ai) return [];

    const prompt = `
      Transforme o seguinte texto de planilha em uma lista JSON de objetos CollectionItem.
      TEXTO:
      """
      ${text}
      """
      REGRAS DE MAPEAMENTO:
      - 'name': Nome do console ou jogo.
      - 'type': 'Console', 'Game', 'Accessory'.
      - 'condition': Sealed, CIB, Loose, Boxed, Refurbished.
      - 'value': Preço/valor numérico (remova moedas, use apenas o número).
      - 'status': 'collection'.
      - Gere um 'id' único (string) para cada.
      - Use imagens genéricas do picsum placeholder para 'imageUrl' baseadas no tipo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              condition: { type: Type.STRING },
              value: { type: Type.NUMBER },
              status: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["id", "name", "type", "condition", "value", "status", "imageUrl"]
          }
        }
      }
    });

    try {
      const items = JSON.parse(response.text || '[]');
      return items.map((item: any) => ({
        ...item,
        ownerId: 'me',
        dateAdded: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Parse Error", e);
      return [];
    }
  });
};

export const createOracleChat = (stats?: UserStats): Chat => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");
  
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Você é o Oráculo Nexus, um mestre em hardware, lore de games e análise de performance. 
      Se o usuário fornecer dados de perfil (${stats?.nexusId}), use-os para dar conselhos personalizados. 
      Seja épico, misterioso porém técnico.`
    }
  });
};

export const searchGamesWithAI = async (query: string): Promise<Game[]> => {
  const ai = getAiClient();
  if (!ai) return [];
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Pesquise o jogo "${query}" e retorne uma lista de 4 jogos similares como JSON Game[]. Inclua coverUrl real de CDN pública se possível ou placeholder.`
  });
  return JSON.parse(response.text || '[]');
};

export const getTrendingGames = async (): Promise<any[]> => {
  return [
    { id: 't1', title: 'GTA VI', platform: Platform.PSN, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7id9.jpg', hypeLevel: 99, genres: ['Action', 'Open World'] },
    { id: 't2', title: 'Elden Ring: Shadow', platform: Platform.STEAM, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vda.jpg', hypeLevel: 95, genres: ['RPG', 'Souls'] },
    { id: 't3', title: 'Monster Hunter Wilds', platform: Platform.PSN, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co84sq.jpg', hypeLevel: 92, genres: ['Action', 'Hunt'] },
    { id: 't4', title: 'Hades II', platform: Platform.STEAM, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5v97.jpg', hypeLevel: 88, genres: ['Roguelike', 'Indie'] }
  ];
};

export const getAchievementTip = async (gameTitle: string, achievementName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Conecte sua API Key para obter dicas da IA.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Dê uma dica curta e prática de como desbloquear a conquista "${achievementName}" no jogo "${gameTitle}".`
  });
  return response.text || "Sem dicas disponíveis no momento.";
};

export const generatePlayerManifesto = async (stats: UserStats): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Erro na Matrix.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Escreva um manifesto épico de 3 parágrafos para o jogador ${stats.nexusId} baseado em seus ${stats.totalHours}h de jogo e foco em ${stats.genreDistribution[0]?.name || 'Games'}.`
  });
  return response.text || "";
};

export const generateJournalNarrative = async (game: string, input: string): Promise<{narrative: string, mood: string}> => {
  const ai = getAiClient();
  if (!ai) return { narrative: input, mood: 'Neutral' };
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transforme o relato "${input}" do jogo "${game}" em uma crônica épica de RPG. Retorne JSON: { "narrative": "...", "mood": "Epic/Intense/Melancholic/Triumphant" }`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{"narrative":"", "mood": "Neutral"}');
};

export const fetchPublicProfileData = async (platform: Platform, username: string): Promise<any> => {
  await new Promise(r => setTimeout(r, 2000));
  return {
    games: [
      { id: 'ext-1', title: 'God of War Ragnarok', platform, hoursPlayed: 65, achievementCount: 30, totalAchievements: 36, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg', genres: ['Action', 'Story'] },
      { id: 'ext-2', title: 'Spider-Man 2', platform, hoursPlayed: 40, achievementCount: 42, totalAchievements: 42, coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6m9v.jpg', genres: ['Action', 'Open World'] }
    ],
    totalHours: 105,
    sources: [{ web: { uri: 'https://psnprofiles.com/' + username, title: 'PSNProfiles' } }]
  };
};
