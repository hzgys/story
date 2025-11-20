
import React, { useState } from 'react';
import ComicCreator from './components/ComicCreator';
import ImageGenerator from './components/ImageGenerator';
import VeoGenerator from './components/VeoGenerator';
import ChatBot from './components/ChatBot';
import SettingsModal from './components/SettingsModal';
import { BookOpen, Image as ImageIcon, Video, Settings } from 'lucide-react';

type View = 'comic' | 'image' | 'video';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('comic');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
              C
            </div>
            <span className="font-bold text-lg tracking-tight">ComicCraft AI (Doubao)</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button
                onClick={() => setCurrentView('comic')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    currentView === 'comic' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                >
                <BookOpen size={16} />
                <span className="hidden sm:inline">故事</span>
                </button>
                <button
                onClick={() => setCurrentView('image')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    currentView === 'image' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                >
                <ImageIcon size={16} />
                <span className="hidden sm:inline">工作室</span>
                </button>
                <button
                onClick={() => setCurrentView('video')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    currentView === 'video' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                >
                <Video size={16} />
                <span className="hidden sm:inline">视频</span>
                </button>
            </div>

            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="API 设置"
            >
                <Settings size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'comic' && <ComicCreator onOpenSettings={() => setIsSettingsOpen(true)} />}
        {currentView === 'image' && <ImageGenerator onOpenSettings={() => setIsSettingsOpen(true)} />}
        {currentView === 'video' && <VeoGenerator onOpenSettings={() => setIsSettingsOpen(true)} />}
      </main>

      {/* Global Chatbot */}
      <ChatBot />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
