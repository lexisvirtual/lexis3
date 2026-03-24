<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lexis Academy - SEO Programático & Imersão

Este repositório contém a infraestrutura da Lexis Academy, unindo uma metodologia de ensino de inglês de alta performance com um motor de SEO autônomo (Protocolo Leo) e auditoria de IA (Roger AI).

## 🚀 Visão Estratégica (Source of Truth)

Para entender a linha lógica completa do projeto (Pedagogia -> Marketing -> Técnico), consulte o documento principal:

👉 **[PROJECT_VISION.md](./PROJECT_VISION.md)**

---

## 🛠️ Como rodar localmente

**Pré-requisitos:** Node.js

1.  **Instalar dependências:**
    `npm install --legacy-peer-deps`
2.  **Configurar variáveis de ambiente:**
    Defina as chaves necessárias no arquivo `.env` (baseie-se no `.env.example`).
3.  **Rodar o app (Vite):**
    `npm run dev`

---

## 📂 Documentação Auxiliar

*   **[LEXIS_METHODOLOGY.md](./LEXIS_METHODOLOGY.md):** Detalhes sobre o Método 3F e a imersão de 120h.
*   **[LEO_PROTOCOL.md](./LEO_PROTOCOL.md):** O cérebro do motor de SEO e fórmulas de prioridade.
*   **[KNOWLEDGE_SYSTEM_V9.md](./KNOWLEDGE_SYSTEM_V9.md):** Sistema de automação de imagens self-hosted.
*   **[SEO_OPERATIONAL_GUIDE.md](./SEO_OPERATIONAL_GUIDE.md):** Guia prático de alocação de páginas e clusters.

---

## 🤖 Automação (Worker)

O core da automação reside na pasta `/worker`, rodando via Cloudflare Workers. Ele gerencia a publicação automática, interlink e auditoria de conteúdo.
