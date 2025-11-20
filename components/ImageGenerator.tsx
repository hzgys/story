
import React, { useState } from 'react';
import { ImageSize } from '../types';
import { generatePanelImage } from '../services/geminiService';
import { Loader2, Download, Sparkles } from 'lucide-react';
import ApiKeySelector from './ApiKeySelector';

interface Props {
  onOpenSettings: () => void;
}

const ImageGenerator: React.FC<Props> = ({ onOpenSettings }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size1K);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const url = await generatePanelImage(prompt, size);
      setImageUrl(url);
    } catch (e: any) {
      console.error(e);
      alert(`生成图像失败: ${e.message}`);
      if (e.message.includes('API Key') || e.message.includes('Endpoint')) {
        onOpenSettings();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="text-purple-400" />
        专业图像工作室 (Doubao)
      </h2>
      
      <ApiKeySelector onOpenSettings={onOpenSettings} />

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">提示词</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="一个霓虹闪烁的未来城市，细节丰富..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">分辨率</label>
            <div className="flex gap-2">
              {Object.values(ImageSize).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                    size === s 
                    ? 'bg-purple-600 border-purple-500 text-white' 
                    : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : '生成'}
          </button>
        </div>
      </div>

      {imageUrl && (
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <img src={imageUrl} alt="Generated" className="w-full h-auto rounded-lg mb-4 shadow-2xl" />
          <div className="flex justify-end">
            <a
              href={imageUrl}
              download={`gen-${Date.now()}.png`}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
            >
              <Download size={20} /> 下载图片
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
