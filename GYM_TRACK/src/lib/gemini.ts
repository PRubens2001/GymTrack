
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const getAi = () => {
  if (!ai) {
    // Tenta usar GYM_TRACK primeiro, depois GEMINI_API_KEY
    const apiKey = process.env.GYM_TRACK || process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "AI Studio Free Tier" || apiKey.length < 10) {
      throw new Error("Chave de API não encontrada ou inválida. Certifique-se de que o segredo GYM_TRACK contém o código da sua chave API.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export interface MealAnalysis {
  kcal: number;
  prot: number;
  carb: number;
  fat: number;
  explanation: string;
}

export const analyzeMeal = async (description: string, imageBase64?: string): Promise<MealAnalysis> => {
  const ai = getAi();
  
  const prompt = `
    Você é um especialista em nutrição e fitness. Analise a descrição da refeição e/ou a imagem fornecida.
    Estime os valores nutricionais (Calorias, Proteínas, Carboidratos e Gorduras).
    
    Descrição do usuário: "${description}"
    
    Explique como os valores foram calculados, mencionando os alimentos identificados e suas quantidades estimadas em massa (g).
  `;

  const contents: any[] = [];
  const parts: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: "image/jpeg"
      }
    });
  }
  
  contents.push({ parts });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          kcal: { type: Type.NUMBER, description: "Calorias totais" },
          prot: { type: Type.NUMBER, description: "Proteínas em gramas" },
          carb: { type: Type.NUMBER, description: "Carboidratos em gramas" },
          fat: { type: Type.NUMBER, description: "Gorduras em gramas" },
          explanation: { type: Type.STRING, description: "Explicação detalhada dos cálculos e alimentos" }
        },
        required: ["kcal", "prot", "carb", "fat", "explanation"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao analisar a refeição. Tente descrever melhor.");
  
  return JSON.parse(text);
};
