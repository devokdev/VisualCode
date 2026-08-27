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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#11121a] border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8e8a9c] hover:text-[#e2e8f0] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1b1c28] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-title text-base font-semibold text-[#f3f0e6]">
              OpenRouter API Key
            </h3>
            <p className="text-xs text-[#8e8a9c]">Configure your personal key or use default</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider mb-1.5">
              API Key (sk-or-v1-...)
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-[#0a0a0e] border border-[#d4af37]/25 rounded-xl px-3.5 py-2.5 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-[#d4af37] transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#171824] border border-[#d4af37]/15 text-[11px] text-[#9d98aa] leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <span>
              Keys are stored securely in your browser's <code className="text-[#d4af37]">localStorage</code>. Never committed or exposed.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
            >
              <span>Get OpenRouter Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e2c069] hover:to-[#cfa332] text-[#0a0a0e] font-bold text-xs rounded-xl shadow-lg shadow-[#d4af37]/20 flex items-center gap-1.5 transition-all"
            >
              {isSaved ? <Check className="w-4 h-4" /> : 'Save Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
