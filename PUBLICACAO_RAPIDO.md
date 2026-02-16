# 🚀 Publicação Automática - Guia Rápido

## ⚡ Início Rápido

### 1. Configure os Tokens

Copie o arquivo de exemplo:
```bash
copy .env.example .env
```

Edite `.env` e adicione seus tokens:
```
MEDIUM_TOKEN=seu_token_aqui
LINKEDIN_TOKEN=seu_token_aqui
```

### 2. Obtenha os Tokens

**Medium**: https://medium.com/me/settings/security
- Vá em "Integration tokens"
- Clique em "Get integration token"
- Copie o token

**LinkedIn**: https://www.linkedin.com/developers/apps
- Crie um app
- Adicione permissão: `w_member_social`
- Gere um access token

### 3. Publique!

**Opção 1: Arquivos .bat (mais fácil)**
- Clique duas vezes em `publicar_medium.bat`
- Clique duas vezes em `publicar_linkedin.bat`
- Clique duas vezes em `publicar_tudo.bat`

**Opção 2: Comandos npm**
```bash
npm run publish:medium
npm run publish:linkedin
npm run publish:all
```

**Opção 3: Node direto**
```bash
node scripts/publish-to-medium.js
node scripts/publish-to-linkedin.js
node scripts/publish-all.js
```

## 📋 O que acontece?

1. ✅ Lê todos os posts em `src/posts/`
2. ✅ Verifica quais já foram publicados
3. ✅ Publica apenas os novos
4. ✅ Salva log para evitar duplicação
5. ✅ Adiciona canonical URL (bom para SEO!)

## 🔍 Verificar Status

Ver posts já publicados no Medium:
```bash
type .published-medium.json
```

Ver posts já publicados no LinkedIn:
```bash
type .published-linkedin.json
```

## 🛠️ Solução de Problemas

**"Token não configurado"**
→ Configure o arquivo `.env`

**"401 Unauthorized"**
→ Token inválido, gere um novo

**"400 Bad Request"**
→ Verifique o formato do post

## 📚 Documentação Completa

Veja `PUBLICACAO_AUTOMATICA.md` para:
- Instruções detalhadas
- Solução de problemas
- Automação avançada
- Boas práticas

## ⚠️ Importante

- Os scripts **não republicam** posts já publicados
- Canonical URLs apontam para `lexis.academy` (bom para SEO)
- Logs em `.published-*.json` são ignorados pelo git

---

**Pronto para começar?** Configure o `.env` e execute `publicar_tudo.bat`! 🎉
