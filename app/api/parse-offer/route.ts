import { NextResponse } from 'next/server';

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function extractTitle(html: string) {
  const headingPatterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<h2[^>]*>([^<]+)<\/h2>/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ];

  for (const pattern of headingPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).replace(/\s+/g, ' ').trim();
    }
  }

  return 'Poste à optimiser';
}

function getProxyUrl(url: string) {
  const normalized = url.replace(/^https:\/\//i, '').replace(/^http:\/\//i, '');
  return `https://r.jina.ai/http://${normalized}`;
}

async function fetchWithFallback(url: string) {
  const directResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobCopilotBot/1.0)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });

  if (directResponse.ok) {
    return { response: directResponse, source: 'direct' as const };
  }

  const proxyUrl = getProxyUrl(url);
  const proxyResponse = await fetch(proxyUrl, {
    headers: {
      Accept: 'text/plain,text/html,*/*',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!proxyResponse.ok) {
    return { response: null, source: 'fallback' as const };
  }

  return { response: proxyResponse, source: 'proxy' as const };
}

export async function POST(request: Request) {
  try {
    const { offerTextOrUrl } = await request.json();
    const rawInput = typeof offerTextOrUrl === 'string' ? offerTextOrUrl.trim() : '';

    if (!rawInput) {
      return NextResponse.json({ error: 'Veuillez fournir une offre d’emploi ou une URL.' }, { status: 400 });
    }

    const isUrl = /^(https?:\/\/)/i.test(rawInput);

    if (!isUrl) {
      const description = rawInput
        .replace(/\s+/g, ' ')
        .replace(/\s*\n\s*/g, '\n')
        .trim();

      const title = description.split('\n')[0]?.slice(0, 120) || 'Poste à optimiser';

      return NextResponse.json({
        jobTitle: title,
        jobDescription: description,
        source: 'text',
      });
    }

    const { response, source } = await fetchWithFallback(rawInput);

    if (!response) {
      const fallbackTitle = rawInput.replace(/^https?:\/\//i, '').split('/')[0] || 'Poste à optimiser';
      return NextResponse.json({
        jobTitle: fallbackTitle,
        jobDescription: `Annonce à partir de l’URL : ${rawInput}`,
        source: 'url-fallback',
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!contentType.includes('text/html')) {
      return NextResponse.json({
        jobTitle: 'Poste à optimiser',
        jobDescription: text.replace(/\s+/g, ' ').trim(),
        source: 'url-text',
      });
    }

    const cleanText = stripHtml(text);
    const title = extractTitle(text);

    return NextResponse.json({
      jobTitle: title,
      jobDescription: cleanText.slice(0, 8000),
      source: source === 'proxy' ? 'url-html-proxy' : 'url-html',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l’analyse de l’offre.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
