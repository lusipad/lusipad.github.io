'use strict';

/**
 * SEO JSON-LD Structured Data Injection
 * Automatically injects Schema.org structured data into HTML pages
 * Extracts metadata from HTML content for reliable detection
 */

hexo.extend.filter.register('after_render:html', function(str, data) {
  const config = hexo.config;

  // Skip if no string content
  if (!str) return str;

  let jsonLdScripts = [];

  // Extract metadata from HTML
  const titleMatch = str.match(/<title>([^<]+)<\/title>/);
  const descMatch = str.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  const ogUrlMatch = str.match(/<meta\s+property="og:url"\s+content="([^"]+)"/);
  const ogTypeMatch = str.match(/<meta\s+property="og:type"\s+content="([^"]+)"/);
  const publishedMatch = str.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/);
  const modifiedMatch = str.match(/<meta\s+property="article:modified_time"\s+content="([^"]+)"/);
  const tagsMatch = str.matchAll(/<meta\s+property="article:tag"\s+content="([^"]+)"/g);

  const pageTitle = titleMatch ? titleMatch[1].split(' - ')[0].trim() : null;
  const pageDescription = descMatch ? descMatch[1] : config.description;
  const pageUrl = ogUrlMatch ? ogUrlMatch[1] : null;
  const isArticle = ogTypeMatch && ogTypeMatch[1] === 'article';
  const publishedTime = publishedMatch ? publishedMatch[1] : null;
  const modifiedTime = modifiedMatch ? modifiedMatch[1] : publishedTime;

  // Collect tags
  const tags = [];
  for (const match of tagsMatch) {
    tags.push(match[1]);
  }

  // Check if this is the homepage
  const isHomepage = pageUrl && (pageUrl === config.url + '/' || pageUrl === config.url);

  // 1. WebSite Schema (for homepage only)
  if (isHomepage) {
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": config.title,
      "description": config.description,
      "url": config.url,
      "inLanguage": "zh-CN",
      "author": {
        "@type": "Person",
        "name": config.author
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": config.url + "?s={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };
    jsonLdScripts.push(websiteSchema);
  }

  // 2. Article/BlogPosting Schema (for article pages)
  if (isArticle && pageTitle && pageUrl) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": pageUrl
      },
      "headline": pageTitle.substring(0, 110),
      "description": pageDescription.substring(0, 160),
      "inLanguage": "zh-CN",
      "author": {
        "@type": "Person",
        "name": config.author
      },
      "publisher": {
        "@type": "Organization",
        "name": config.title,
        "logo": {
          "@type": "ImageObject",
          "url": config.url + "/favicon/apple-touch-icon.png"
        }
      },
      "url": pageUrl
    };

    if (publishedTime) {
      articleSchema.datePublished = publishedTime;
    }
    if (modifiedTime) {
      articleSchema.dateModified = modifiedTime;
    }
    if (tags.length > 0) {
      articleSchema.keywords = tags.join(', ');
    }

    jsonLdScripts.push(articleSchema);

    // 3. BreadcrumbList Schema for articles
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": config.url
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": pageTitle,
          "item": pageUrl
        }
      ]
    };
    jsonLdScripts.push(breadcrumbSchema);
  }

  // Skip if no schemas to inject
  if (jsonLdScripts.length === 0) return str;

  // Generate script tags
  const jsonLdHtml = jsonLdScripts.map(schema => {
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }).join('\n');

  // Inject before </head>
  return str.replace('</head>', jsonLdHtml + '\n</head>');
});
