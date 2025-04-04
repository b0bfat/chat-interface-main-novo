import React, { useState } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Message, ChatState } from './types/chat';
import { Star } from 'lucide-react';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const sendMessage = async (content: string, files?: File[]) => {
    const formData = new FormData();
    formData.append('message', content);
    
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const userMessage: Message = {
      content,
      role: 'user',
      timestamp: new Date(),
      attachments: files?.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com o servidor');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao enviar mensagem. Tente novamente.',
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="text-zinc-400" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wider">GRUPO DVA</h1>
                <p className="text-zinc-400 text-sm">Assistente Virtual Mercedes-Benz</p>
              </div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=100&h=40&q=80" 
              alt="Mercedes-Benz Logo"
              className="h-10 object-contain"
            />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {chatState.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=200&h=200&q=80" 
              alt="Mercedes-Benz Illustration"
              className="w-32 h-32 object-cover rounded-full mb-4 opacity-50"
            />
            <p className="text-lg">Bem-vindo ao Assistente Virtual do Grupo DVA</p>
            <p className="text-sm">Como posso ajudá-lo com seu Mercedes-Benz hoje?</p>
          </div>
        ) : (
          chatState.messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        {chatState.isLoading && (
          <div className="flex items-center gap-2 text-zinc-500">
            <div className="animate-pulse">Processando sua solicitação...</div>
          </div>
        )}
        {chatState.error && (
          <div className="text-red-400 text-center py-2 bg-red-900/20 rounded-lg">
            {chatState.error}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="max-w-7xl mx-auto w-full px-6">
        <ChatInput onSendMessage={sendMessage} isLoading={chatState.isLoading} />
      </div>
    </div>
  );
}

export default App;