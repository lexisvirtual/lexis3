# 📢 Guia de Publicação Automática - Lexis Academy

Este guia explica como configurar e usar o sistema de publicação automática para Medium e LinkedIn.

## 🎯 O que foi criado?

### Scripts de Publicação
- **`publish-to-medium.js`** - Publica posts no Medium
- **`publish-to-linkedin.js`** - Publica posts no LinkedIn
- **`publish-all.js`** - Publica em todas as plataformas

### Arquivos Batch (Windows)
- **`publicar_medium.bat`** - Atalho para publicar no Medium
- **`publicar_linkedin.bat`** - Atalho para publicar no LinkedIn
- **`publicar_tudo.bat`** - Atalho para publicar em tudo

### Logs de Controle
- **`.published-medium.json`** - Rastreia posts já publicados no Medium
- **`.published-linkedin.json`** - Rastreia posts já publicados no LinkedIn

## 🔧 Configuração Inicial

### 1. Obter Token do Medium

1. Acesse: https://medium.com/me/settings/security
2. Role até "Integration tokens"
3. Clique em "Get integration token"
4. Digite uma descrição (ex: "Lexis Academy Auto-Publisher")
5. Copie o token gerado

### 2. Obter Token do LinkedIn

**Opção A: Usando LinkedIn API (Recomendado para automação)**

1. Acesse: https://www.linkedin.com/developers/apps
2. Clique em "Create app"
3. Preencha as informações:
   - App name: "Lexis Academy Publisher"
   - LinkedIn Page: Sua página/perfil
   - Privacy policy URL: https://lexis.academy
   - App logo: Upload do logo da Lexis
4. Após criar, vá em "Auth" → "OAuth 2.0 scopes"
5. Adicione a permissão: `w_member_social`
6. Vá em "Auth" → "OAuth 2.0 tools"
7. Clique em "Request access token"
8. Copie o token gerado

**Opção B: Publicação Manual Assistida**

Se a API do LinkedIn for muito complexa inicialmente, podemos usar uma abordagem híbrida:
- O script prepara o conteúdo
- Você copia e cola no LinkedIn

### 3. Configurar Variáveis de Ambiente

**Método 1: Arquivo .env (Recomendado)**

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edite o arquivo `.env` e adicione seus tokens:
   ```
   MEDIUM_TOKEN=seu_token_aqui
   LINKEDIN_TOKEN=seu_token_aqui
   ```

**Método 2: Variáveis de Sistema (Windows)**

```batch
set MEDIUM_TOKEN=seu_token_aqui
set LINKEDIN_TOKEN=seu_token_aqui
```

Para tornar permanente:
1. Pesquise "Variáveis de Ambiente" no Windows
2. Clique em "Editar as variáveis de ambiente do sistema"
3. Clique em "Variáveis de Ambiente"
4. Adicione as variáveis

### 4. Instalar Dependência (se necessário)

Se você usar o arquivo `.env`, instale o dotenv:

```bash
npm install dotenv
```

E adicione no início dos scripts:
```javascript
import 'dotenv/config';
```

## 🚀 Como Usar

### Publicar no Medium

**Opção 1: Usando o arquivo .bat**
```
Clique duas vezes em: publicar_medium.bat
```

**Opção 2: Linha de comando**
```bash
node scripts/publish-to-medium.js
```

### Publicar no LinkedIn

**Opção 1: Usando o arquivo .bat**
```
Clique duas vezes em: publicar_linkedin.bat
```

**Opção 2: Linha de comando**
```bash
node scripts/publish-to-linkedin.js
```

### Publicar em Tudo

**Opção 1: Usando o arquivo .bat**
```
Clique duas vezes em: publicar_tudo.bat
```

**Opção 2: Linha de comando**
```bash
node scripts/publish-all.js
```

## 📋 Como Funciona

### Fluxo de Publicação

1. **Leitura dos Posts**: O script lê todos os arquivos `.md` em `src/posts/`
2. **Verificação**: Compara com o log de posts já publicados
3. **Publicação**: Publica apenas posts novos (não publicados ainda)
4. **Registro**: Salva no log para evitar duplicação
5. **Canonical URL**: Adiciona link para o artigo original no seu site

### Recursos Importantes

#### Medium
- ✅ Canonical URL configurada (bom para SEO)
- ✅ Nota no início linkando para o artigo original
- ✅ Formato Markdown preservado
- ✅ Tags automáticas
- ✅ Notifica seguidores

#### LinkedIn
- ✅ Post com preview do artigo
- ✅ Link para o artigo completo
- ✅ Resumo automático
- ✅ Hashtags relevantes
- ✅ Visibilidade pública

### Controle de Duplicação

Os scripts mantêm logs em JSON:
- `.published-medium.json`
- `.published-linkedin.json`

Estes arquivos rastreiam quais posts já foram publicados, evitando duplicação.

## 🔍 Verificação e Testes

### Testar Conexão com Medium

```bash
node scripts/publish-to-medium.js
```

Se o token estiver correto, você verá:
```
✅ Conectado como: Seu Nome (@seu_username)
```

### Testar Conexão com LinkedIn

```bash
node scripts/publish-to-linkedin.js
```

Se o token estiver correto, você verá:
```
✅ Conectado ao LinkedIn
```

## 🛠️ Solução de Problemas

### "MEDIUM_TOKEN não configurado"

**Causa**: Token não foi definido
**Solução**: Configure a variável de ambiente (veja seção "Configuração Inicial")

### "Erro ao obter usuário: 401 Unauthorized"

**Causa**: Token inválido ou expirado
**Solução**: Gere um novo token no Medium/LinkedIn

### "Erro ao publicar: 400 Bad Request"

**Causa**: Formato do post inválido
**Solução**: Verifique se o post tem `title` e `content` no frontmatter

### Posts não aparecem

**Causa**: Podem estar como rascunho
**Solução**: No script, `publishStatus` está como `'public'`. Verifique no Medium/LinkedIn.

## 📊 Monitoramento

### Ver Posts Publicados no Medium

```bash
type .published-medium.json
```

### Ver Posts Publicados no LinkedIn

```bash
type .published-linkedin.json
```

### Resetar Logs (Republicar Tudo)

⚠️ **CUIDADO**: Isso vai republicar TODOS os posts!

```bash
del .published-medium.json
del .published-linkedin.json
```

## 🎯 Boas Práticas

### 1. Teste com Rascunhos Primeiro

No `publish-to-medium.js`, altere:
```javascript
publishStatus: 'draft', // Em vez de 'public'
```

### 2. Publique em Horários Estratégicos

LinkedIn: Segunda a sexta, 8h-10h ou 17h-19h
Medium: Qualquer horário, mas consistência é importante

### 3. Monitore o Desempenho

- Acesse Medium Stats: https://medium.com/me/stats
- Acesse LinkedIn Analytics: No seu perfil → Analytics

### 4. Não Abuse da API

Os scripts já têm delays entre publicações:
- Medium: 2 segundos
- LinkedIn: 3 segundos

## 🔄 Automação Completa (Futuro)

### Opção 1: Task Scheduler (Windows)

1. Abra "Agendador de Tarefas"
2. Criar Tarefa Básica
3. Configurar para executar `publicar_tudo.bat` diariamente

### Opção 2: GitHub Actions

Criar workflow que:
1. Detecta novos posts no repositório
2. Executa os scripts de publicação
3. Commita os logs atualizados

### Opção 3: Cloudflare Worker Scheduled

Criar um worker que:
1. Roda diariamente
2. Verifica novos posts
3. Publica automaticamente

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs de erro
2. Confirme que os tokens estão válidos
3. Teste a conexão com cada plataforma separadamente
4. Verifique se o formato dos posts está correto

## 🎉 Próximos Passos

Depois que tudo estiver funcionando:

1. ✅ Configurar tokens
2. ✅ Testar com 1-2 posts
3. ✅ Verificar se aparecem nas plataformas
4. ✅ Publicar o restante
5. ✅ Configurar automação (opcional)

---

**Criado para Lexis Academy** 🚀
*Automatizando a distribuição de conteúdo educacional de qualidade*
