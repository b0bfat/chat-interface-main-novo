// src/services/api.js

// Função para enviar uma mensagem ao LMStudio
export async function sendMessageToLMStudio(message) {
    try {
      const response = await fetch('/chat', {
        method: 'POST', // Usar o método POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-nemo-instruct-2407', // Substitua pelo modelo que você está usando no LMStudio
          messages: [
            { role: 'user', content: message },
          ],
          max_tokens: 100, // Limite de tokens para a resposta (ajuste conforme necessário)
          temperature: 0.7, // Controle de criatividade (opcional, ajuste conforme necessário)
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem para o LMStudio');
      }
  
      const data = await response.json();
      return data.choices[0].message.content; // Extrai a resposta do modelo
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error('Erro ao enviar mensagem. Tente novamente.');
    }
  }