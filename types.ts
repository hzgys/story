
export interface ComicPanel {
  id: string;
  caption: string;
  visual_prompt: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export enum ImageSize {
  Size1K = "1024x1024",
  Size2K = "1024x1024", // Map to supported sizes
  Size4K = "1024x1024"
}

export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Wide = "16:9",
  Tall = "9:16"
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  textModel: string; // Endpoint ID for Doubao Pro/Lite
  imageModel: string; // Endpoint ID for Doubao Image or generic
  videoModel: string; // Endpoint ID for PixelDance or generic
}
