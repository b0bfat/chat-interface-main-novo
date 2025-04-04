// src/components/Chat.jsx

import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import InputArea from './InputArea';
import { sendMessageToLMStudio } from '../services/api';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return; // Evita enviar mensagens vazias

    // Adiciona a mensagem do usuário à lista de mensagens
    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(''); // Limpa o campo de entrada
    setError(null); // Limpa qualquer erro anterior

    try {
      // Envia a mensagem para o LMStudio e obtém a resposta
      const response = await sendMessageToLMStudio(input);

      // Adiciona a resposta do assistente à lista de mensagens
      const assistantMessage = { role: 'assistant', content: response };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (err) {
      setError(err.message); // Exibe o erro na interface
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {error && <div className="error-message">{error}</div>}
      </div>
      <InputArea
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Chat;