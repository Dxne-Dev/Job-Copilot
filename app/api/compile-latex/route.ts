import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateProfessionalTemplate, generateModernTemplate } from '@/lib/latex-templates';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Check if user is PREMIUM
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const isPremium = !!subscription && !subError;

    // For MVP demonstration purposes, if Stripe is not fully set up or we want to allow testing,
    // we can check if process.env.BYPASS_PREMIUM_CHECK === 'true'.
    const bypassCheck = process.env.BYPASS_PREMIUM_CHECK === 'true';

    if (!isPremium && !bypassCheck) {
      return NextResponse.json({ 
        error: 'Premium requis', 
        message: "L'accès aux templates LaTeX et au téléchargement PDF stylisé est réservé aux abonnés Premium à 19€/mois." 
      }, { status: 403 });
    }

    const { optimizedData, contact, templateId = 'professional', format = 'pdf' } = await request.json();

    if (!optimizedData || !contact || !contact.name || !contact.email) {
      return NextResponse.json({ error: 'Données requises manquantes (optimizedData, contact info)' }, { status: 400 });
    }

    // 3. Generate LaTeX content based on selected template
    let texContent = '';
    if (templateId === 'modern') {
      texContent = generateModernTemplate(optimizedData, contact);
    } else {
      texContent = generateProfessionalTemplate(optimizedData, contact);
    }

    // 4. Return LaTeX code directly if requested
    if (format === 'tex') {
      return new NextResponse(texContent, {
        headers: {
          'Content-Type': 'application/x-tex',
          'Content-Disposition': `attachment; filename="cv_${contact.name.toLowerCase().replace(/\s+/g, '_')}.tex"`,
        },
      });
    }

    // 5. Compile to PDF using public LaTeX compiler API
    try {
      const compileResponse = await fetch('https://latex.ytotech.com/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: texContent,
          compiler: 'pdflatex',
        }),
      });

      if (!compileResponse.ok) {
        throw new Error(`Le service de compilation LaTeX a répondu avec le statut ${compileResponse.status}`);
      }

      const pdfBuffer = await compileResponse.arrayBuffer();

      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="cv_${contact.name.toLowerCase().replace(/\s+/g, '_')}.pdf"`,
        },
      });
    } catch (compileError: any) {
      console.error("Erreur de compilation LaTeX externe:", compileError);
      return NextResponse.json({
        error: 'Erreur de compilation PDF',
        message: 'Le compilateur LaTeX en ligne a rencontré un problème. Vous pouvez télécharger le fichier source .tex pour le compiler sur Overleaf.',
        texSource: texContent
      }, { status: 502 });
    }

  } catch (error: any) {
    console.error("Erreur dans compile-latex:", error);
    return NextResponse.json({ error: 'Une erreur interne est survenue' }, { status: 500 });
  }
}
