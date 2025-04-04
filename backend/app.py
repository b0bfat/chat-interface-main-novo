from flask import Flask, request, jsonify, render_template
import requests
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configurações do LM Studio
LM_STUDIO_URL = "http://192.168.151.231:1234/v1/chat/completions"
MODEL = "mistral-nemo-instruct-2407"

# Configuração para upload de arquivos
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

# Criar pasta de uploads se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        message = request.form.get('message', '')
        files = request.files.getlist('files')
        
        # Processar arquivos
        file_info = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                file_info.append({
                    'name': filename,
                    'path': file_path,
                    'type': file.content_type
                })

        # Criar mensagem para o LM Studio incluindo informações sobre os arquivos
        context = message
        if file_info:
            files_description = "\nArquivos anexados:\n"
            for file in file_info:
                files_description += f"- {file['name']} (tipo: {file['type']})\n"
            context += files_description

        # Enviar requisição ao LM Studio
        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": context}],
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        response = requests.post(
            LM_STUDIO_URL,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()

        ai_response = response.json()['choices'][0]['message']['content']
        return jsonify({'response': ai_response})

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erro ao conectar ao LM Studio: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Erro no servidor: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)