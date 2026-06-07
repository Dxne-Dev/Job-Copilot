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

    const response = await fetch(rawInput, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobCopilotBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Impossible de récupérer l’offre depuis l’URL (${response.status}).`);
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
      source: 'url-html',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l’analyse de l’offre.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
