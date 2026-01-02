
export interface UserData {
  name: string;
  age: string;
  favoriteAnimal: string;
  favoriteColor: string;
  favoriteFood: string;
  hobby: string;
}

export interface GeneratedContent {
  poem: string;
  wordSearchWords: string[];
  coloringPrompt: string;
}

export interface WordSearchGrid {
  grid: string[][];
  words: string[];
  placedWords: { word: string; positions: [number, number][] }[];
}
