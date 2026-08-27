import React, { useState } from 'react';
import { Key, Check, Sparkles, ExternalLink, X } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/openrouter';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState(getApiKey());
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(key);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#221D1A] border border-[#3D322A] rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9E948C] hover:text-[#EAE5DF] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#171412] border border-[#3D322A] flex items-center justify-center text-[#B38A4A]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#EAE5DF]">
              OpenRouter API Key
            </h3>
            <p className="text-xs text-[#9E948C]">Configure your personal key</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-[#B38A4A] tracking-wider mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-[#171412] border border-[#3D322A] rounded-xl px-3.5 py-2.5 text-xs text-[#EAE5DF] font-mono focus:outline-none focus:border-[#B38A4A] transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#171412] border border-[#3D322A]/60 text-[11px] text-[#9E948C] leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#B38A4A] shrink-0 mt-0.5" />
            <span>
              Keys are stored securely in your browser's <code className="text-[#B38A4A]">localStorage</code>.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#B38A4A] hover:underline flex items-center gap-1"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#B38A4A] hover:bg-[#C59B58] text-[#171412] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              {isSaved ? <Check className="w-4 h-4" /> : 'Save Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
