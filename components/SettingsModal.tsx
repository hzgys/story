
import React, { useState, useEffect } from 'react';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';
import { AISettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>({
    apiKey: '',
    ...DEFAULT_SETTINGS
  });

  useEffect(() => {
    const saved = localStorage.getItem('comic_craft_settings');
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('comic_craft_settings', JSON.stringify(settings));
    onClose();
    window.location.reload(); // Simple reload to refresh services with new config
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <SettingsIcon size={20} className="text-indigo-500" />
            API 设置 (火山引擎/豆包)
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-sm text-zinc-400 bg-zinc-800/50 p-3 rounded border border-zinc-800">
            请在此处填写您的火山引擎 (Volcengine Ark) API Key 和对应的 Endpoint ID (接入点 ID)。
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              placeholder="sk-..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Base URL</label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => setSettings({...settings, baseUrl: e.target.value})}
              placeholder="https://ark.cn-beijing.volces.com/api/v3"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2.5 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">文本模型 Endpoint ID (Chat/Story)</label>
            <input
              type="text"
              value={settings.textModel}
              onChange={(e) => setSettings({...settings, textModel: e.target.value})}
              placeholder="ep-2025... (豆包 Pro/Lite)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2.5 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">图像模型 Endpoint ID (可选)</label>
            <input
              type="text"
              value={settings.imageModel}
              onChange={(e) => setSettings({...settings, imageModel: e.target.value})}
              placeholder="ep-2025... (CV/Image)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2.5 text-white focus:border-indigo-500 outline-none"
            />
          </div>
          
           <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">视频模型 Endpoint ID (可选)</label>
            <input
              type="text"
              value={settings.videoModel}
              onChange={(e) => setSettings({...settings, videoModel: e.target.value})}
              placeholder="ep-2025... (PixelDance)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2.5 text-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-zinc-300 hover:text-white">取消</button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center gap-2"
          >
            <Save size={16} /> 保存并重新加载
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
