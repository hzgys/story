
import React, { useState } from 'react';
import { generateComicPanels, generatePanelImage } from '../services/geminiService';
import { ComicPanel, ImageSize } from '../types';
import { Loader2, Wand2, Image as ImageIcon, Download } from 'lucide-react';
import ApiKeySelector from './ApiKeySelector';

interface Props {
  onOpenSettings: () => void;
}

const ComicCreator: React.FC<Props> = ({ onOpenSettings }) => {
  const [story, setStory] = useState('');
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(0);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.Size1K);

  const handleAnalyze = async () => {
    if (!story.trim()) return;
    setIsAnalyzing(true);
    try {
      const generatedPanels = await generateComicPanels(story);
      setPanels(generatedPanels);
    } catch (error: any) {
      console.error("Failed to analyze story", error);
      alert(`分析故事失败: ${error.message}`);
      if (error.message.includes('API Key')) {
        onOpenSettings();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateImageForPanel = async (panelId: string) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isLoading: true } : p));
    setGeneratingCount(c => c + 1);

    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    try {
      const imageUrl = await generatePanelImage(panel.visual_prompt, imageSize);
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, imageUrl, isLoading: false } : p));
    } catch (error: any) {
      console.error("Failed to generate image", error);
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isLoading: false } : p));
      alert(`生成分镜图片失败: ${error.message}`);
      if (error.message.includes('API Key') || error.message.includes('Endpoint')) {
        onOpenSettings();
      }
    } finally {
      setGeneratingCount(c => c - 1);
    }
  };

  const generateAllImages = async () => {
    for (const panel of panels) {
      if (!panel.imageUrl) {
        await generateImageForPanel(panel.id);
      }
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
          故事转漫画 (Doubao)
        </h1>
        <p className="text-zinc-400">将文字转化为视觉杰作。</p>
      </header>

      <ApiKeySelector onOpenSettings={onOpenSettings} />

      <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              编写你的故事
            </label>
            <textarea
              className="w-full h-64 bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="很久以前，在一个赛博朋克城市里..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !story}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                {isAnalyzing ? '分析中...' : '创建漫画脚本'}
              </button>
            </div>
          </div>

          {panels.length > 0 && (
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-zinc-200">设置</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">图像质量</label>
                   <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-700">
                    {Object.values(ImageSize).map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                          imageSize === size 
                          ? 'bg-zinc-800 text-white font-medium shadow-sm' 
                          : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={generateAllImages}
                  disabled={generatingCount > 0}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {generatingCount > 0 ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      处理中 ({generatingCount})...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={18} />
                      生成所有分镜
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {panels.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
              <Wand2 size={48} className="mb-4 opacity-20" />
              <p>你的漫画分镜将显示在这里</p>
            </div>
          ) : (
            <div className="space-y-8">
              {panels.map((panel, index) => (
                <div key={panel.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
                  {/* Header */}
                  <div className="bg-zinc-950/50 p-3 border-b border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">分镜 {index + 1}</span>
                    {panel.imageUrl && (
                      <button 
                        onClick={() => downloadImage(panel.imageUrl!, `panel-${index+1}.png`)}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="下载图片"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col gap-6">
                     {/* Image Area */}
                     <div className="aspect-square w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative group">
                        {panel.imageUrl ? (
                          <img src={panel.imageUrl} alt={panel.caption} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {panel.isLoading ? (
                              <Loader2 className="animate-spin text-indigo-500" size={32} />
                            ) : (
                              <button
                                onClick={() => generateImageForPanel(panel.id)}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-md text-sm text-zinc-300 transition-colors"
                              >
                                生成图片
                              </button>
                            )}
                          </div>
                        )}
                     </div>

                     {/* Caption Area */}
                     <div className="space-y-2">
                       <p className="font-serif text-lg leading-relaxed text-zinc-100 italic">
                         "{panel.caption}"
                       </p>
                       <div className="text-xs text-zinc-500 bg-zinc-950 p-2 rounded border border-zinc-800 font-mono">
                         提示词: {panel.visual_prompt}
                       </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicCreator;
