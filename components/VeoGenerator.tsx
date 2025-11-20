
import React, { useState } from 'react';
import { generateVeoVideo } from '../services/geminiService';
import { Loader2, Video, Upload, PlayCircle } from 'lucide-react';
import ApiKeySelector from './ApiKeySelector';

interface Props {
  onOpenSettings: () => void;
}

const VeoGenerator: React.FC<Props> = ({ onOpenSettings }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const url = await generateVeoVideo(selectedImage, prompt, aspectRatio);
      setVideoUrl(url);
    } catch (error: any) {
      console.error(error);
      alert(`视频生成失败: ${error.message}`);
      if (error.message.includes('API Key') || error.message.includes('Endpoint')) {
        onOpenSettings();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Video className="text-pink-500" />
        视频动画制作
      </h2>

      <ApiKeySelector onOpenSettings={onOpenSettings} />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">1. 上传图片</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-500">点击上传照片</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>

            {selectedImage && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">2. 动画提示词</label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述图像应该如何运动..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">3. 宽高比</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex-1 py-2 text-sm rounded border ${aspectRatio === '16:9' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-zinc-950 border-zinc-700 text-zinc-400'}`}
                    >
                      16:9 (横向)
                    </button>
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex-1 py-2 text-sm rounded border ${aspectRatio === '9:16' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-zinc-950 border-zinc-700 text-zinc-400'}`}
                    >
                      9:16 (纵向)
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <PlayCircle />}
                  {isGenerating ? '生成视频中...' : '生成视频'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden h-full min-h-[300px] flex items-center justify-center relative">
            {!selectedImage && !videoUrl && (
              <p className="text-zinc-600 text-center px-4">上传图片以开始</p>
            )}
            
            {selectedImage && !videoUrl && !isGenerating && (
              <img src={selectedImage} alt="Preview" className="max-h-full max-w-full object-contain" />
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                <p className="text-zinc-300 animate-pulse">正在生成...</p>
              </div>
            )}

            {videoUrl && (
              <video controls autoPlay loop className="w-full h-full object-contain bg-black">
                <source src={videoUrl} type="video/mp4" />
                您的浏览器不支持视频标签。
              </video>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeoGenerator;
