# 🤖 Guia Completo: Automação RSS → Medium via IFTTT

## 📋 Passo a Passo Detalhado

### Passo 1: Login no IFTTT ✅
1. Acesse: https://ifttt.com/create (já aberto para você)
2. Faça login com Google, Apple, Facebook ou Email
3. Aguarde o redirecionamento

### Passo 2: Configurar o Trigger (IF THIS)

1. **Clique em "If This"** (o botão grande com +)
2. **Busque por "RSS Feed"**
   - Digite "RSS" na barra de busca
   - Selecione o serviço "RSS Feed"
3. **Escolha o trigger: "New feed item"**
   - Este trigger dispara quando há um novo item no feed
4. **Cole a URL do seu RSS:**
   ```
   https://lexis.academy/rss.xml
   ```
5. **Clique em "Create trigger"**

### Passo 3: Configurar a Action (THEN THAT)

1. **Clique em "Then That"** (o botão grande com +)
2. **Busque por "Medium"**
   - Digite "Medium" na barra de busca
   - Selecione o serviço "Medium"
3. **Conecte sua conta do Medium**
   - Clique em "Connect"
   - Faça login no Medium quando solicitado
   - Autorize o IFTTT a publicar em seu nome
4. **Escolha a action: "Create a story"**
5. **Configure os campos:**

   **Title (Título):**
   ```
   {{EntryTitle}}
   ```

   **Content (Conteúdo):**
   ```
   {{EntryContent}}
   
   ---
   
   Artigo original: {{EntryUrl}}
   ```

   **Tags (opcional):**
   ```
   inglês, educação, aprendizado
   ```

   **Canonical URL (IMPORTANTE!):**
   ```
   {{EntryUrl}}
   ```
   ⚠️ **Este campo é ESSENCIAL para SEO!** Ele diz ao Medium que o artigo original está no seu site.

   **Publish status:**
   - Escolha "public" para publicar imediatamente
   - Ou "draft" se quiser revisar antes

6. **Clique em "Create action"**

### Passo 4: Finalizar

1. **Revise o applet**
   - Verifique se está tudo correto
2. **Dê um nome ao applet** (opcional)
   - Ex: "Lexis Academy → Medium"
3. **Clique em "Finish"**

## ✅ Pronto! Como Funciona Agora?

### Fluxo Automático:
1. 📝 Você publica um novo post no lexis.academy
2. 🔄 O RSS é atualizado automaticamente (pelo script generate-rss.js)
3. 🤖 IFTTT verifica seu RSS a cada 15 minutos
4. 📢 Quando detecta um novo post, publica automaticamente no Medium
5. 🔗 Com canonical URL apontando para seu site (bom para SEO!)

### Frequência de Verificação:
- **Plano Free:** IFTTT verifica a cada ~15 minutos
- **Plano Pro:** Verificação mais rápida (opcional)

## 🔍 Como Testar?

### Opção 1: Aguardar Próximo Post
Quando você publicar o próximo post no lexis.academy, ele aparecerá automaticamente no Medium em até 15 minutos.

### Opção 2: Testar Agora
1. Vá em "My Applets" no IFTTT
2. Encontre seu applet "Lexis Academy → Medium"
3. Clique em "Check now" para forçar verificação
4. Os posts mais recentes do RSS serão publicados

⚠️ **ATENÇÃO:** Se você clicar em "Check now", o IFTTT pode publicar os últimos posts do seu feed. Se não quiser isso, aguarde até ter um post novo.

## 📊 Monitoramento

### Ver Atividade do Applet:
1. Acesse: https://ifttt.com/my_applets
2. Clique no seu applet
3. Veja o histórico de execuções

### Logs:
- Cada execução mostra se foi bem-sucedida
- Você pode ver erros caso algo dê errado

## 🛠️ Solução de Problemas

### "Medium não aparece nos serviços"
**Solução:** O IFTTT pode ter removido a integração oficial. Neste caso:
- Use Zapier (alternativa ao IFTTT)
- Ou use a ferramenta de importação manual do Medium

### "Canonical URL não está sendo configurada"
**Solução:** Certifique-se de que o campo "Canonical URL" está preenchido com `{{EntryUrl}}`

### "Posts não estão sendo publicados"
**Solução:**
1. Verifique se o RSS está acessível: https://lexis.academy/rss.xml
2. Verifique se o applet está ativo (toggle ON)
3. Veja os logs de erro no IFTTT

### "Formatação está estranha"
**Solução:** O IFTTT pode não preservar toda a formatação Markdown. Você pode:
- Aceitar a formatação básica
- Ou editar manualmente no Medium depois

## 🎯 Próximos Passos

Depois de configurar o IFTTT:

1. ✅ **Teste com um post novo** ou force "Check now"
2. ✅ **Configure o LinkedIn** (script já está pronto!)
3. ✅ **Monitore os primeiros posts** para garantir que está tudo OK

## 🔗 Links Úteis

- **Seu RSS:** https://lexis.academy/rss.xml
- **IFTTT Create:** https://ifttt.com/create
- **IFTTT My Applets:** https://ifttt.com/my_applets
- **Medium Import Tool:** https://medium.com/p/import

---

**Dica Pro:** Se o IFTTT não tiver mais integração com Medium, use **Zapier** que tem processo similar mas com mais opções!

## 📞 Precisa de Ajuda?

Se encontrar algum problema durante a configuração, me avise e eu te ajudo! 🚀
