
import React from 'react';
import { Settings } from 'lucide-react';

interface Props {
  onOpenSettings: () => void;
}

const ApiKeySelector: React.FC<Props> = ({ onOpenSettings }) => {
  const hasKey = !!localStorage.getItem('comic_craft_settings');

  if (hasKey) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Settings className="text-indigo-400" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-indigo-100">需要配置模型 API</h3>
          <p className="text-sm text-indigo-200">
             要使用豆包模型生成故事和图像，请先配置您的火山引擎 API Key 和 Endpoint ID。
          </p>
        </div>
      </div>
      <button
        onClick={onOpenSettings}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-2"
      >
        <Settings size={16} />
        去配置
      </button>
    </div>
  );
};

export default ApiKeySelector;
