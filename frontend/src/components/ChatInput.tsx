import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFiles.length > 0) && !isLoading) {
      onSendMessage(message, selectedFiles);
      setMessage('');
      setSelectedFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-800 py-6 bg-transparent">
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300"
            >
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Como posso ajudá-lo com seu Mercedes-Benz hoje?"
          className="flex-1 px-6 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
          disabled={isLoading}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,image/*"
        />
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={isLoading}
          className={`p-4 rounded-full ${
            isLoading
              ? 'bg-zinc-800 cursor-not-allowed'
              : 'bg-zinc-800 hover:bg-zinc-700 transition-colors'
          }`}
        >
          <Paperclip size={20} className={isLoading ? 'text-zinc-600' : 'text-zinc-300'} />
        </button>
        <button
          type="submit"
          disabled={isLoading || (!message.trim() && selectedFiles.length === 0)}
          className={`p-4 rounded-full ${
            isLoading || (!message.trim() && selectedFiles.length === 0)
              ? 'bg-zinc-800 cursor-not-allowed'
              : 'bg-zinc-800 hover:bg-zinc-700 transition-colors'
          }`}
        >
          <Send size={20} className={isLoading || (!message.trim() && selectedFiles.length === 0) ? 'text-zinc-600' : 'text-zinc-300'} />
        </button>
      </div>
    </form>
  );
}