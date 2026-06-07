import Link from 'next/link';
import { Check, Cpu, FileText, Sparkles, Layers, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            JobCopilot
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hover:text-white transition-colors">
            Connexion
          </Link>
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Cpu className="h-3.5 w-3.5" /> Propulsé par OpenAI GPT-4o-mini
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] mb-6">
          Décrochez plus d'entretiens avec un CV{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            optimisé par l'IA
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Importez votre CV et l'offre d'emploi visée. L'IA adapte votre profil et génère instantanément votre CV en format LaTeX professionnel pour franchir les filtres ATS.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-base font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Optimiser mon CV Gratuitement <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-300 text-base font-semibold px-8 py-4 rounded-2xl transition-all"
          >
            Voir les templates LaTeX
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-sm overflow-hidden mb-24">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3 px-2">
            <div className="h-3.5 w-3.5 rounded-full bg-red-500/80" />
            <div className="h-3.5 w-3.5 rounded-full bg-yellow-500/80" />
            <div className="h-3.5 w-3.5 rounded-full bg-green-500/80" />
            <span className="text-xs text-slate-500 font-mono ml-4">app.jobcopilot.io/dashboard</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            <div className="md:col-span-1 border border-slate-800/80 rounded-xl p-4 bg-slate-950/50">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" /> Mon CV Original
              </h3>
              <div className="h-40 rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center text-xs text-slate-500">
                <span>Format PDF ou Texte</span>
                <span className="text-indigo-400 mt-1 cursor-pointer">Parcourir...</span>
              </div>
            </div>
            <div className="md:col-span-2 border border-slate-800/80 rounded-xl p-4 bg-slate-950/50 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" /> Profil Optimisé ATS
                </h3>
                <div className="space-y-2">
                  <div className="h-3.5 w-3/4 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3.5 w-full bg-slate-800 rounded animate-pulse" />
                  <div className="h-3.5 w-5/6 bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-850 mt-4">
                <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">Score ATS : 94%</span>
                <span className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">Générer le PDF LaTeX →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="w-full py-16 border-t border-slate-900">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Des fonctionnalités pensées pour la conversion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-850 hover:bg-slate-900/40 transition-all group">
              <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Analyse de Mots-Clés ATS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Notre algorithme IA extrait les compétences et mots-clés essentiels de l'offre d'emploi et les intègre naturellement dans vos expériences.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-850 hover:bg-slate-900/40 transition-all group">
              <div className="h-10 w-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Modèles LaTeX Professionnels</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Fini les templates Word cassés. Accédez à une bibliothèque de designs LaTeX impeccables, assurant une lecture parfaite par les robots de recrutement.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-850 hover:bg-slate-900/40 transition-all group">
              <div className="h-10 w-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Lettre de Motivation Intégrée</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Obtenez une lettre de motivation sur mesure de 300 à 400 mots, accordée à votre CV optimisé et rédigée spécifiquement pour l'offre cible.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Un tarif simple, rentable dès la première candidature</h2>
            <p className="text-slate-400 text-sm md:text-base">Commencez gratuitement, puis passez à la vitesse supérieure quand vous êtes prêt à postuler en masse.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left items-stretch">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-slate-900 bg-slate-950 flex flex-col justify-between relative overflow-hidden">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Plan Gratuit</h3>
                <p className="text-slate-500 text-xs mb-6">Pour explorer et tester la puissance de l'IA.</p>
                <div className="text-3xl font-black mb-6">0€<span className="text-sm font-normal text-slate-500"> / toujours</span></div>
                <ul className="space-y-3 text-sm text-slate-400 mb-8">
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-indigo-400 shrink-0" /> Accès aux analyses IA</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-indigo-400 shrink-0" /> Copie par blocs (sections du CV & lettre)</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-indigo-400 shrink-0" /> Téléchargement PDF brut textuel</li>
                  <li className="flex items-center gap-2 text-slate-600"><Check className="h-4.5 w-4.5 text-slate-700 shrink-0" /> Bibliothèque de templates LaTeX</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="w-full text-center border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-white font-bold py-3 rounded-xl transition-all"
              >
                Essayer gratuitement
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="p-8 rounded-3xl border-2 border-indigo-500 bg-slate-900/40 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Recommandé
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Plan Premium</h3>
                <p className="text-indigo-300 text-xs mb-6">Pour un rendu ultra-professionnel.</p>
                <div className="text-3xl font-black mb-6">19€<span className="text-sm font-normal text-indigo-300"> / mois</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-green-400 shrink-0" /> Tout ce qui est inclus dans le Plan Gratuit</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-green-400 shrink-0" /> Accès complet aux templates LaTeX</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-green-400 shrink-0" /> Génération PDF stylisée en 1 clic</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-green-400 shrink-0" /> Historique et stockage illimité</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-green-400 shrink-0" /> Téléchargement du code source .tex</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25"
              >
                Obtenir l'Accès Premium
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-sm text-slate-500 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-300 tracking-tight">JobCopilot</span>
          </div>
          <p>© {new Date().getFullYear()} JobCopilot. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
