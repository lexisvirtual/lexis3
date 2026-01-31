import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords = '',
  canonical = '',
  ogImage = 'https://lexis.academy/logo.png'
}) => {
  const fullTitle = title ? `${title} | Lexis Academy` : 'Lexis Academy | Curso de Inglês por Imersão em São Carlos - Fluência Real';
  const canonicalUrl = canonical || `https://lexis.academy${window.location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Lexis Academy",
          "url": "https://lexis.academy",
          "logo": "https://lexis.academy/logo.png",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Visconde de Inhaúma, 1295",
            "addressLocality": "São Carlos",
            "addressRegion": "SP",
            "addressCountry": "BR"
          },
          "sameAs": [
            "https://www.instagram.com/lexis.ea",
            "https://www.linkedin.com/in/lexisenglish/",
            "https://www.facebook.com/LexisEA/",
            "https://www.youtube.com/lexisvirtual"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
