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

@app.route('/')
def index():
    app.logger.info("Rota '/' acessada, renderizando index.html")
    return render_template('index.html')

@app.route('/chat', methods=['GET', 'POST', 'OPTIONS'])
def chat():
    app.logger.info(f"Rota '/chat' acessada com método: {request.method}")

    if request.method == 'OPTIONS':
        app.logger.info("Requisição OPTIONS recebida, retornando 200")
        return '', 200

    if request.method == 'GET':
        app.logger.info("Requisição GET recebida, retornando mensagem de teste")
        return jsonify({'message': 'Rota /chat acessada via GET para teste'})

    # Processar requisição POST
    app.logger.info("Processando requisição POST")
    try:
        message = request.form.get('message', '')
        app.logger.info(f"Mensagem recebida: {message}")

        files = request.files.getlist('file')
        app.logger.info(f"Arquivos recebidos: {[file.filename for file in files if file]}")

        # Processar arquivos
        file_info = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                app.logger.info(f"Arquivo salvo: {file_path}")
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
        app.logger.info(f"Contexto enviado ao LM Studio: {context}")

        # Enviar requisição ao LM Studio
        payload = {
            "model": MODEL,
            "messages": [{"role": "user", "content": context}],
            "max_tokens": 500,
            "temperature": 0.7
        }
        app.logger.info(f"Payload enviado ao LM Studio: {payload}")

        response = requests.post(
            LM_STUDIO_URL,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()

        ai_response = response.json()['choices'][0]['message']['content']
        app.logger.info(f"Resposta do LM Studio: {ai_response}")
        return jsonify({'response': ai_response})

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Erro ao conectar ao LM Studio: {str(e)}")
        return jsonify({'error': f'Erro ao conectar ao LM Studio: {str(e)}'}), 500
    except Exception as e:
        app.logger.error(f"Erro no servidor: {str(e)}")
        return jsonify({'error': f'Erro no servidor: {str(e)}'}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)