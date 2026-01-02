
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, GeneratedContent } from "../types";

const extractJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    // If simple parse fails, try to find JSON block in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        throw new Error("The Magic Brain sent a jumbled message! Please try again.");
      }
    }
    throw new Error("The Magic Brain forgot how to write in code! Please try again.");
  }
};

export const generateKidMagic = async (userData: UserData): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `
    Create a personalized "Magic Kit" for a child named ${userData.name}.
    Info: Age ${userData.age}, Loves ${userData.favoriteAnimal}, Favorite color is ${userData.favoriteColor}, Loves eating ${userData.favoriteFood}, and enjoys ${userData.hobby}.

    I need exactly this JSON format:
    {
      "poem": "An 8-line rhyming poem",
      "wordSearchWords": ["WORD1", "WORD2", ... 15-20 total],
      "coloringPrompt": "A detailed description for a coloring page"
    }

    The poem must have a clear AABB or ABAB rhyme scheme.
    The words must be related to ${userData.name}'s interests.
    The coloringPrompt should describe ${userData.name} with a ${userData.favoriteAnimal} in a land of ${userData.favoriteFood}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The Magic Brain was too shy to speak! (Empty response).");
    }

    return extractJSON(text);
  } catch (error: any) {
    console.error("Gemini Text Error:", error);
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("401")) {
      throw new Error("The Magic Wand's battery is empty! (Check your API Key).");
    }
    if (error.message?.includes("safety") || error.message?.includes("blocked")) {
      throw new Error("The Magic Wand got scared! (Safety Filter). Try different words!");
    }
    throw error;
  }
};

export const regeneratePoem = async (userData: UserData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Create a NEW 8-line rhyming poem for ${userData.name}. 
  Context: Loves ${userData.favoriteAnimal}, ${userData.favoriteColor}, ${userData.favoriteFood}, and ${userData.hobby}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a master children's poet. Use simple, delightful rhymes (AABB or ABAB).",
    }
  });
  return response.text || "Oops, the rhyme got lost in the clouds!";
};

export const regenerateWordSearchWords = async (userData: UserData): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Return a JSON object with a "words" key containing 15-20 words for ${userData.name}. 
  Context: ${userData.favoriteAnimal}, ${userData.favoriteColor}, ${userData.favoriteFood}, ${userData.hobby}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });
  
  const text = response.text;
  if (!text) return ["MAGIC", "AYLA", "BAYLA", "FUN"];
  
  const result = extractJSON(text);
  return result.words || ["MAGIC", "AYLA", "BAYLA", "FUN"];
};

export const generateColoringImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const fullPrompt = `Pure black and white line art coloring page for kids. Bold outlines, white background, no shading. Scene: ${prompt}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Gemini Image Error:", e);
  }
  
  throw new Error("The magic paintbrush ran out of ink! (Image generation failed).");
};
