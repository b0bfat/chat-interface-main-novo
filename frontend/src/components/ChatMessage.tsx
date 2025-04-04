import React from 'react';
import { Message } from '../types/chat';
import { User, Star, FileText, Image, File } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={16} />;
    if (type.includes('pdf')) return <FileText size={16} />;
    return <File size={16} />;
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-zinc-800' : 'bg-zinc-900 border border-zinc-700'
      }`}>
        {isUser ? (
          <User size={20} className="text-zinc-300" />
        ) : (
          <Star size={20} className="text-zinc-300" />
        )}
      </div>
      <div className={`flex max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-6 py-4 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-white' 
            : 'bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 text-zinc-100'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  {getFileIcon(attachment.type)}
                  <span className="truncate">{attachment.name}</span>
                </a>
              ))}
            </div>
          )}
          
          <span className="text-xs text-zinc-500 mt-2 block">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}