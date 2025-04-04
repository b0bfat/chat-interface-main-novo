const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Carregar histórico do localStorage ao iniciar
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.forEach(msg => displayMessage(msg.text, msg.type));
}

// Salvar mensagem no localStorage
function saveMessage(text, type) {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ text, type });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

// Exibir mensagem na interface
function displayMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Enviar mensagem para o back-end Flask
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Exibir mensagem do usuário
    displayMessage(message, 'user');
    saveMessage(message, 'user');
    userInput.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.error) {
            displayMessage(`Erro: ${data.error}`, 'ai');
        } else {
            // Exibir resposta da IA
            displayMessage(data.response, 'ai');
            saveMessage(data.response, 'ai');
        }
    } catch (error) {
        console.error('Erro ao conectar com o back-end:', error);
        displayMessage('Erro: Não foi possível conectar ao servidor.', 'ai');
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Carregar histórico ao iniciar
loadHistory();