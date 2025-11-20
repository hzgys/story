
import { ComicPanel, ImageSize, AISettings, ChatMessage } from "../types";
import { DEFAULT_SETTINGS } from "../constants";

// Helper to get settings
const getSettings = (): AISettings => {
  const saved = localStorage.getItem('comic_craft_settings');
  if (saved) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  }
  return { apiKey: '', ...DEFAULT_SETTINGS };
};

const getHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
});

export const generateComicPanels = async (story: string): Promise<ComicPanel[]> => {
  const { apiKey, baseUrl, textModel } = getSettings();
  
  if (!apiKey || !textModel) {
    throw new Error("请在设置中配置 API Key 和文本模型 Endpoint ID");
  }

  const systemInstruction = "你是一个专业的漫画编剧。你的任务是将用户提供的故事改编成精彩的视觉漫画分镜脚本。请直接输出纯净的 JSON 数组，不要包含 markdown 格式标记（如 ```json ... ```），也不要包含任何其他解释性文字。";

  const userPrompt = `将以下故事分解为 4 到 6 个独特的视觉漫画分镜。
  请严格按照以下 JSON 格式输出，不要包含任何额外文本：
  [
    { "caption": "中文旁白...", "visual_prompt": "English visual description..." },
    { "caption": "中文旁白...", "visual_prompt": "English visual description..." }
  ]
  
  故事内容：
  ${story}`;

  try {
    console.log(`Sending request to ${baseUrl}/chat/completions`);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        model: textModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("API Error Response:", err);
      throw new Error(err.error?.message || `API Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    
    console.log("Model Raw Response:", text);
    
    // Robust JSON extraction: Find the first '[' and the last ']'
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    
    let cleanText = text;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanText = text.substring(jsonStart, jsonEnd + 1);
    } else {
      // Fallback cleanup if regex fail or structure is weird
      cleanText = text.replace(/```json\n?|```/g, '').trim();
    }
    
    let rawPanels;
    try {
      rawPanels = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse error. Cleaned text was:", cleanText);
      throw new Error("模型返回的数据格式不正确，无法解析为 JSON。请尝试重试或检查控制台日志。");
    }
    
    if (!Array.isArray(rawPanels)) {
      throw new Error("Response is not an array of panels");
    }

    return rawPanels.map((p: any, index: number) => ({
      id: `panel-${Date.now()}-${index}`,
      caption: p.caption || "无旁白",
      visual_prompt: p.visual_prompt || "comic scene",
    }));
  } catch (error: any) {
    console.error("generateComicPanels error:", error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
       throw new Error("网络请求失败。这通常是因为浏览器拦截了对火山引擎 API 的跨域请求 (CORS)。请尝试配置代理，或使用支持跨域的 API 网关。");
    }
    throw error;
  }
};

export const generatePanelImage = async (
  prompt: string, 
  size: ImageSize = ImageSize.Size1K
): Promise<string> => {
  const { apiKey, baseUrl, imageModel } = getSettings();
  
  if (!apiKey) throw new Error("请配置 API Key");
  if (!imageModel) throw new Error("请在设置中配置图像模型 Endpoint ID");
  
  const fullPrompt = `Comic book style, highly detailed, vibrant colors. ${prompt}`;

  try {
    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        model: imageModel,
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Image API Error:", err);
      throw new Error(err.error?.message || `Image Generation failed: ${response.status}`);
    }

    const data = await response.json();
    const url = data.data?.[0]?.url;
    
    if (!url) throw new Error("No image URL returned");
    return url;

  } catch (error: any) {
    console.error("generatePanelImage error:", error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error("网络请求失败 (CORS)。请检查网络或代理设置。");
     }
    throw error;
  }
};

export const generateVeoVideo = async (
  imageBase64: string, 
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const { apiKey, baseUrl, videoModel } = getSettings();

  if (!apiKey || !videoModel) {
     throw new Error("请在设置中配置视频模型 Endpoint ID");
  }

  // Note: Volcengine PixelDance integration via generic OpenAI endpoint is experimental
  // and might require custom implementation depending on the specific API version.
  // We will attempt a standard call structure but it might fail if the endpoint expects different params.
  
  throw new Error("当前接口暂不支持直接调用视频生成，请等待后续更新或检查后端配置。");
};

// Chat Helper Class
export class ChatSession {
  private history: ChatMessage[] = [];
  private model: string;
  private baseUrl: string;
  private apiKey: string;
  private systemInstruction: string;

  constructor(systemInstruction: string) {
    const settings = getSettings();
    this.apiKey = settings.apiKey;
    this.baseUrl = settings.baseUrl;
    this.model = settings.textModel;
    this.systemInstruction = systemInstruction;
    this.history = [{ role: 'system' as any, text: systemInstruction }];
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiKey || !this.model) {
      return "请先在设置中配置 API Key 和 模型 ID。";
    }

    this.history.push({ role: 'user', text: message });

    try {
      // Map history to API format
      const messagesPayload = this.history.map(h => ({
        role: h.role === 'model' ? 'assistant' : h.role,
        content: h.text
      }));

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: getHeaders(this.apiKey),
        body: JSON.stringify({
          model: this.model,
          messages: messagesPayload,
          stream: false
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || "Chat request failed");
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "无回复";

      this.history.push({ role: 'model', text: reply });
      return reply;

    } catch (error: any) {
      console.error("Chat error", error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return "错误: 网络请求失败 (CORS)。请检查控制台获取更多信息。";
      }
      return `错误: ${error.message}`;
    }
  }
}

export const createChat = () => {
  return new ChatSession("你是一个为创意漫画创作工作室服务的乐于助人的 AI 助手。请始终使用中文回答用户的问题。");
};
