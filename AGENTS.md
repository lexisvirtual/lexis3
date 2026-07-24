# AGENTS.md - Lexis Academy Blog

## Developer Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build` (Generates RSS feed and builds Vite/React app)
- **Typecheck**: `npx tsc`
- **Deploy**: 
  - Automatic: `deploy.bat` (Git add/commit/push)
  - Manual: `git push origin main` (Triggers GitHub Actions for deploy to GitHub Pages)

## Content & Image Management
- **Images**: Self-hosted in `public/img/posts/[slug].webp`.
- **Image Maintenance Scripts** (`scripts/`):
  - `fix-post-image.js`: Converts external links to local hosted images.
  - `replace-post-image.js`: Replaces a post image with a specific URL.
  - `refresh-post-image.js`: Refetches image from Pixabay based on tags.
- **Content Generation**:
  - Test single day: `node scripts/testar-tema-dia.js [day]`
  - Populate 365 days: `node scripts/popular-365-temas.js`
- **Social Publishing**:
  - Medium: `npm run publish:medium`
  - LinkedIn: `npm run publish:linkedin`
  - All: `npm run publish:all`

## Architecture Notes
- **Worker**: A Cloudflare Worker (in `worker/`) autonomously generates content and commits images/posts directly to this repository.
- **Image Pipeline**: Pixabay -> `wsrv.nl` (Optimization) -> GitHub (`public/img/posts/`).
- **Content Style**: Focus on Brazilian cultural context, short paragraphs, use of bold/lists for scannability.

## Conventions
- Mimic existing post structure and frontmatter.
- Ensure images are always referenced as local paths (`/img/posts/[slug].webp`).
- For new posts, ensure consistency with the "Mentor" persona defined in `KNOWLEDGE_SYSTEM_V9.md`.
