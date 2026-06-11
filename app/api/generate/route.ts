import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openrouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
const openrouterBaseUrl = 'https://openrouter.ai/api/v1';

if (!openrouterApiKey) {
  console.warn('OPENROUTER_API_KEY is not configured. Generation requests will fail until this variable is set.');
}

const openai = openrouterApiKey ? new OpenAI({
  apiKey: openrouterApiKey,
  baseURL: openrouterBaseUrl,
}) : null;

const JSON_SCHEMA = {
  type: "object",
  properties: {
    profile: {
      type: "object",
      properties: {
        summary: { type: "string" },
        headline: { type: "string" }
      },
      required: ["summary", "headline"],
      additionalProperties: false
    },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          company: { type: "string" },
          duration: { type: "string" },
          achievements: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["role", "company", "duration", "achievements"],
        additionalProperties: false
      }
    },
    skills: {
      type: "object",
      properties: {
        technical: { type: "array", items: { type: "string" } },
        soft: { type: "array", items: { type: "string" } }
      },
      required: ["technical", "soft"],
      additionalProperties: false
    },
    coverLetter: { type: "string" },
    analysis: {
      type: "object",
      properties: {
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        atsScore: { type: "integer" }
      },
      required: ["strengths", "weaknesses", "atsScore"],
      additionalProperties: false
    }
  },
  required: ["profile", "experiences", "skills", "coverLetter", "analysis"],
  additionalProperties: false
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { originalResumeText, jobTitle, jobDescription } = await request.json();

    if (!originalResumeText || !jobTitle || !jobDescription) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // 2. Setup prompts with embedded JSON schema
    const systemPrompt = `Tu es un expert en recrutement et optimisation de CV pour les ATS (Applicant Tracking Systems). 
Analyse le CV de l'utilisateur et l'offre d'emploi fournie. 
Génère une version optimisée du CV et une lettre de motivation ciblée (300-400 mots).
Ne mens jamais et n'invente pas de fausses expériences professionnelles, mais adapte le vocabulaire, la formulation des réalisations et mets en valeur les compétences clés qui matchent avec l'offre.

Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, respectant exactement ce schéma :
${JSON.stringify(JSON_SCHEMA, null, 2)}`;

    const userPrompt = `
OFFRE D'EMPLOI :
Titre : ${jobTitle}
Description : ${jobDescription}

CV ACTUEL DE L'UTILISATEUR :
${originalResumeText}

Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte supplémentaire.
`;

    if (!openai) {
      return NextResponse.json({ error: 'La clé OpenRouter n\'est pas configurée sur le serveur. Ajoutez OPENROUTER_API_KEY dans Vercel.' }, { status: 500 });
    }

    // 3. Make call to LLM via OpenRouter
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const resultText = response.choices[0].message.content;
    if (!resultText) {
      throw new Error("Réponse vide de la part d'OpenAI");
    }

    const optimizedData = JSON.parse(resultText);

    // 4. Save generation results to Supabase table
    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        job_title: jobTitle,
        job_description: jobDescription,
        original_resume_text: originalResumeText,
        optimized_data: optimizedData
      })
      .select()
      .single();

    if (dbError) {
      console.error("Erreur de sauvegarde base de données:", dbError);
      return NextResponse.json({ error: "Erreur de stockage de la génération" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: generation });

  } catch (error: unknown) {
    console.error("Erreur générale dans l'API generate:", error);
    const message = error instanceof Error ? error.message : 'Une erreur interne est survenue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
