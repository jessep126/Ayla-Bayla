
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, GeneratedContent } from "../types";

export const generateKidMagic = async (userData: UserData): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `
    Create a personalized "Magic Kit" for a child named ${userData.name}.
    Info: Age ${userData.age}, Loves ${userData.favoriteAnimal}, Favorite color is ${userData.favoriteColor}, Loves eating ${userData.favoriteFood}, and enjoys ${userData.hobby}.

    I need:
    1. A short, fun, 8-line poem about ${userData.name} and their favorites. STICK TO A CLEAR RHYMING SCHEME (AABB or ABAB).
    2. A list of 15-20 challenging words related to ${userData.name} and their interests for a wordsearch.
    3. A detailed prompt for an image generator to create a "coloring book" style black and white line art image of ${userData.name} with a ${userData.favoriteAnimal} in a world made of ${userData.favoriteFood}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          poem: { type: Type.STRING, description: "A strictly rhyming poem for the child" },
          wordSearchWords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "15-20 challenging words related to the child"
          },
          coloringPrompt: { type: Type.STRING, description: "Prompt for coloring page image generation" }
        },
        required: ["poem", "wordSearchWords", "coloringPrompt"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return result;
};

export const regeneratePoem = async (userData: UserData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Create a NEW and DIFFERENT fun 8-line rhyming poem for ${userData.name}. 
  Must rhyme perfectly (AABB or ABAB). 
  Context: Likes ${userData.favoriteAnimal}, ${userData.favoriteColor}, ${userData.favoriteFood}, and ${userData.hobby}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a master children's poet. Always use simple, delightful rhymes.",
    }
  });
  return response.text || "";
};

export const regenerateWordSearchWords = async (userData: UserData): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Provide a NEW list of 15-20 challenging words for a wordsearch for ${userData.name}. 
  Context: Likes ${userData.favoriteAnimal}, ${userData.favoriteColor}, ${userData.favoriteFood}, and ${userData.hobby}.
  Mix simple words with longer, more complex ones related to these topics.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          words: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          }
        },
        required: ["words"]
      }
    }
  });
  const result = JSON.parse(response.text);
  return result.words;
};

export const generateColoringImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const fullPrompt = `Black and white line art coloring page for kids. High contrast, thick bold outlines, absolutely no shading, white background only. Theme: ${prompt}`;
  
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

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};
