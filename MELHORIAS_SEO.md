# 📈 Melhorias de SEO - Lexis Academy

> Documento de registro das otimizações de SEO implementadas no site https://lexis.academy/

**Data da implementação:** 24 de Janeiro de 2026  
**Versão:** 1.0

---

## ✅ Melhorias Implementadas

### 1. Meta Tags Primárias
- **Title otimizado:** "Lexis Academy | Curso de Inglês por Imersão em São Carlos - Fluência Real"
  - Inclui palavras-chave principais e localização
  - Tamanho ideal para exibição nos resultados de busca (60 caracteres)
- **Description aprimorada:** Descrição completa com 155 caracteres incluindo:
  - Metodologia diferenciada
  - Tipos de cursos oferecidos
  - Localização
  - Proposta de valor (fluência real)
- **Keywords:** Adicionadas palavras-chave relevantes para o negócio
- **Author:** Definido como "Lexis Academy"

### 2. Meta Tags de Controle
- `robots`: index, follow, max-image-preview:large
- `googlebot`: index, follow
- `language`: Portuguese
- `revisit-after`: 7 days
- **Geo tags:** 
  - geo.region: BR-SP
  - geo.placename: São Carlos
  - geo.position: Coordenadas GPS precisas
  - ICBM: Coordenadas para sistemas de geo-localização

### 3. Open Graph (Facebook/LinkedIn)
- `og:type`: website
- `og:url`: URL canônica
- `og:title`: Título otimizado para redes sociais
- `og:description`: Descrição adaptada para compartilhamento
- `og:image`: Logo com dimensões especificadas (1200x630)
- `og:image:alt`: Texto alternativo para acessibilidade
- `og:site_name`: Lexis Academy
- `og:locale`: pt_BR

### 4. Twitter Cards
- `twitter:card`: summary_large_image
- `twitter:url`: URL do site
- `twitter:title`: Título otimizado
- `twitter:description`: Descrição para Twitter
- `twitter:image`: Imagem para preview
- `twitter:image:alt`: Texto alternativo

### 5. Structured Data (JSON-LD / Schema.org)
Implementados 4 schemas completos:

#### 5.1 EducationalOrganization
- Nome, URL, logo, descrição
- Endereço completo com geocoordenadas
- Telefone de contato
- Catálogo de cursos com detalhes de cada modalidade

#### 5.2 FAQPage
- 5 perguntas frequentes estruturadas
- Respostas completas para rich snippets

#### 5.3 LocalBusiness
- Informações de negócio local
- Horário de funcionamento
- Faixa de preço

#### 5.4 WebSite
- Schema básico para indexação

### 6. Performance e Carregamento
- **Preconnect** para domínios externos:
  - fonts.googleapis.com
  - fonts.gstatic.com
  - cdn.tailwindcss.com
- **DNS Prefetch** para unpkg.com
- **Preload** de recursos críticos:
  - Fonte Plus Jakarta Sans
  - Logo principal
- **Lazy Loading** em imagens secundárias (footer)
- **Eager Loading** no logo do header (above the fold)

### 7. URL e Navegação
- **Canonical URL** definida: https://lexis.academy/
- Favicons configurados para múltiplos tamanhos (16px, 32px, 180px)
- Apple Touch Icon configurado

### 8. Acessibilidade de Imagens
- Alt text descritivos e contextuais em todas as imagens
- Textos alternativos incluem palavras-chave relevantes

### 9. Arquivos de Indexação

#### sitemap.xml
- Página principal com prioridade 1.0
- Seções internas mapeadas (#metodo, #conteudo, #modalidades, etc.)
- Data de modificação atualizada
- Frequência de atualização definida

#### robots.txt
- Permissão para todos os bots principais
- Crawl-delay configurado para Googlebot e Bingbot
- Bloqueio de arquivos de configuração (package.json, etc.)
- Referência ao sitemap
- Host preferencial definido

---

## 📋 Recomendações Adicionais

### Curto Prazo (1-2 semanas)
1. **Criar imagem OG dedicada (1200x630px)**
   - Usar o logo atual não é ideal para redes sociais
   - Recomenda-se criar uma imagem com:
     - Logo + nome da marca
     - Frase de impacto
     - Cores da marca
     - Dimensões exatas 1200x630px

2. **Adicionar Google Analytics 4**
   - Implementar GA4 para acompanhar métricas
   - Configurar eventos de conversão (cliques no WhatsApp)

3. **Google Search Console**
   - Verificar propriedade do site
   - Submeter sitemap.xml
   - Monitorar indexação e erros

### Médio Prazo (1-3 meses)
4. **Criar páginas separadas para cada curso**
   - /maestria-online/
   - /imersao-presencial/
   - /the-way-ciclico/
   - Cada página com conteúdo único e otimizado

5. **Blog/Conteúdo**
   - Criar seção de blog com artigos sobre:
     - Aprender inglês rápido
     - Metodologias de imersão
     - Dicas de fluência
   - Estratégia de content marketing

6. **Backlinks e Autoridade**
   - Cadastrar em diretórios de escolas de idiomas
   - Parcerias com blogs de educação
   - Google Meu Negócio otimizado

7. **Performance**
   - Considerar migrar de CDN do Tailwind para build estático
   - Implementar Service Worker para cache
   - Otimizar Core Web Vitals

### Longo Prazo (3-6 meses)
8. **Versão em Inglês**
   - Criar versão internacional do site
   - Implementar hreflang tags
   - Ampliar alcance para estrangeiros querendo aprender em imersão

9. **Avaliações/Reviews**
   - Implementar schema de Review/Rating
   - Coletar depoimentos verificados
   - Integrar com Google Reviews

10. **Vídeos e Mídia Rica**
    - Adicionar vídeos de depoimentos
    - Implementar VideoObject schema
    - Tour virtual da escola

---

## 📊 Métricas para Acompanhar

| Métrica | Ferramenta | Meta |
|---------|-----------|------|
| Posição média | Google Search Console | Top 10 para "curso inglês imersão são carlos" |
| CTR | Google Search Console | > 5% |
| Impressões | Google Search Console | Crescimento mensal 20% |
| Tempo na página | Google Analytics | > 2 minutos |
| Taxa de rejeição | Google Analytics | < 60% |
| Core Web Vitals | PageSpeed Insights | Verde em todos |

---

## 🔧 Detalhes Técnicos

### Estrutura de Headings
```
H1: "Inglês é uma habilidade. Treine como um atleta."
├── H2: "A Filosofia Lexis"
│   ├── H3: "Idioma não se aprende, se treina."
│   └── H3: "O Inglês como Esporte Cognitivo"
├── H2: "O que você vai conquistar"
├── H2: "Arquiteturas de Sucesso"
│   └── H3: Cada modalidade
├── H2: "O que dizem os alunos"
├── H2: "Perguntas Frequentes"
└── H2: "Treine. Domine. Evolua Globalmente."
```

### Palavras-chave Alvo
- Primárias: curso de inglês, imersão em inglês, aprender inglês rápido
- Secundárias: fluência em inglês, curso intensivo, escola de inglês São Carlos
- Long-tail: inglês para executivos, inglês para negócios, metodologia Lexis

---

## ✍️ Changelog

| Data | Versão | Alterações |
|------|--------|------------|
| 24/01/2026 | 1.0 | Implementação inicial completa de SEO |

---

*Documento gerado automaticamente como parte da implementação de SEO.*
