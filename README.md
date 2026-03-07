<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zcZgiw5wVjarGk8eVLpbUERr-IMScf4y

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🚀 Estratégia e Visão do Projeto

Para entender a linha lógica completa, os riscos e o fortalecimento do projeto, consulte a documentação estratégica:

👉 **[PROJECT_VISION.md](PROJECT_VISION.md)**

### Comandos de Automação

O projeto utiliza uma interface unificada via `npm` para gerenciar o motor de SEO e automação:

- `npm run queue:process`: Processa a fila de posts (IA gera e publica).
- `npm run queue:check`: Verifica o status atual da fila no Worker.
- `npm run image:refresh`: Atualiza a imagem de um post específico via Pixabay.
- `npm run publish:all`: Distribui os posts para LinkedIn e Medium.
- `npm run build`: Gera o feed RSS e faz o build de produção do site.
