
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
  fat_total: number;
  fat_sat: number;
  fiber: number;
  explanation: string;
}

export interface DietGoalsAnalysis {
  kcal: number;
  prot: number;
  carb: number;
  fat_total: number;
  fat_sat: number;
  fiber: number;
  water_goal: number;
  explanation: string;
}

export const analyzeMeal = async (description: string, imageBase64?: string): Promise<MealAnalysis> => {
  const ai = getAi();
  
  const prompt = `
    Você é um especialista em nutrição e fitness. Analise a descrição da refeição e/ou a imagem fornecida.
    Estime os valores nutricionais (Calorias, Proteínas, Carboidratos, Gordura Total, Gordura Saturada e Fibras).
    
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

  let lastError;
  for (let i = 0; i < 2; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kcal: { type: Type.NUMBER, description: "Calorias totais" },
              prot: { type: Type.NUMBER, description: "Proteínas em gramas" },
              carb: { type: Type.NUMBER, description: "Carboidratos em gramas" },
              fat_total: { type: Type.NUMBER, description: "Gordura total em gramas" },
              fat_sat: { type: Type.NUMBER, description: "Gordura saturada em gramas" },
              fiber: { type: Type.NUMBER, description: "Fibras em gramas" },
              explanation: { type: Type.STRING, description: "Explicação detalhada dos cálculos e alimentos" }
            },
            required: ["kcal", "prot", "carb", "fat_total", "fat_sat", "fiber", "explanation"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Falha ao analisar a refeição. Tente descrever melhor.");
      
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
      if (i === 0) await new Promise(r => setTimeout(r, 1000)); // Espera 1s antes de tentar de novo
    }
  }
  throw lastError;
};

export const calculateDietGoals = async (profile: {
  weight: number;
  height: number;
  age: number;
  sex: 'masculino' | 'feminino';
  activityLevel: string;
  objective: 'emagrecer' | 'neutro' | 'ganhar_massa';
  bodyFat?: number;
  leanMass?: number;
}): Promise<DietGoalsAnalysis> => {
  const ai = getAi();
  
  const prompt = `
    Você é um especialista em nutrição esportiva e fisiologia. 
    Calcule as metas nutricionais diárias ideais para o seguinte perfil:
    - Peso: ${profile.weight}kg
    - Altura: ${profile.height}cm
    - Idade: ${profile.age} anos
    - Sexo Biológico: ${profile.sex}
    - Nível de Atividade (Exercícios + Trabalho): ${profile.activityLevel}
    - Objetivo: ${profile.objective}
    ${profile.bodyFat ? `- Percentual de Gordura: ${profile.bodyFat}%` : ''}
    ${profile.leanMass ? `- Massa Magra: ${profile.leanMass}kg` : ''}

    Forneça:
    1. Calorias totais (kcal)
    2. Proteínas (g) - Baseie em g/kg de peso ou massa magra se disponível.
    3. Carboidratos (g)
    4. Gordura Total (g)
    5. Gordura Saturada (g) - Deve ser uma fração saudável da gordura total.
    6. Fibras (g) - Baseie em g/1000kcal ou recomendações padrão.
    7. Meta de Água (ml) - Baseie no peso e nível de atividade.
    8. Explicação: Justifique os cálculos (TMB, GCD, divisões de macros) de forma profissional e motivadora.
  `;

  let lastError;
  for (let i = 0; i < 2; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kcal: { type: Type.NUMBER },
              prot: { type: Type.NUMBER },
              carb: { type: Type.NUMBER },
              fat_total: { type: Type.NUMBER },
              fat_sat: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              water_goal: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["kcal", "prot", "carb", "fat_total", "fat_sat", "fiber", "water_goal", "explanation"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Falha ao calcular metas. Tente novamente.");
      
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
      if (i === 0) await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw lastError;
};
