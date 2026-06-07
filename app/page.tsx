import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, Cpu, FileText, Layers, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#0f172a_0%,_#07111f_35%,_#020617_100%)] text-slate-100 selection:bg-cyan-400/30 selection:text-white overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-black tracking-tight text-white">JobCopilot</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white">Tarifs</a>
            <a href="#impact" className="hover:text-white">Impact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-300 hover:text-white md:block">Connexion</Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-emerald-300">Start now <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 md:py-16">
        <section className="grid items-center gap-12 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">AI resume optimizer</span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">Passez les filtres ATS avec un CV qui convertit.</h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300 md:text-xl">Transformez votre CV et votre lettre de motivation avec une expérience IA claire, rapide et premium, pensée pour gagner des entretiens.</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Link href="/dashboard" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-emerald-300 sm:w-auto">Optimiser mon CV <ArrowRight className="h-4 w-4" /></Link>
              <a href="#pricing" className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-white/20 hover:bg-white/8 sm:w-auto">Voir les offres</a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300 md:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-3 py-1.5"><BadgeCheck className="h-4 w-4 text-emerald-300" /> 94% score ATS</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/8 px-3 py-1.5"><ShieldCheck className="h-4 w-4 text-sky-300" /> Résultats professionnels</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/8 px-3 py-1.5"><Zap className="h-4 w-4 text-violet-300" /> Génération en 1 clic</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl md:p-5">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100">Dashboard preview</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">CV optimisé</h2>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">+18% interviews</span>
              </div>
              <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <article className="rounded-2xl border border-white/6 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Source</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 rounded-full bg-slate-800" />
                    <div className="h-3 w-3/4 rounded-full bg-slate-800" />
                    <div className="h-3 w-5/6 rounded-full bg-slate-800" />
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-4 text-center text-xs text-slate-400">PDF / TXT / Copie collée</div>
                </article>
                <article className="rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">Impact</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-100">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">Mots-clés ATS intégrés • leadership • product • roadmap</div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">Lettre de motivation 300–400 mots • ton professionnel</div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">Export LaTeX PDF prêt à envoyer</div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="impact" className="grid gap-6 py-8 md:grid-cols-3">
          {[
            ['1 min', 'de setup pour obtenir un résultat exploitable'],
            ['94%', 'score ATS estimé sur les profils optimisés'],
            ['3 formats', 'CV, lettre, export LaTeX/PDF'],
          ].map(([value, label]) => (
            <article key={value} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-300">{label}</p>
            </article>
          ))}
        </section>

        <section id="features" className="py-10 md:py-16">
          <div className="mb-8 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">Why it feels premium</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">Une interface claire, rapide et pensée pour la conversion</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Cpu, title: 'Analyse IA ultra ciblée', text: 'Mots-clés ATS, ton d’écriture, impact business et structure rationalisée.' },
              { icon: Layers, title: 'Templates LaTeX premium', text: 'Sorties nettes, lisibles et adaptées aux systèmes de recrutement modernes.' },
              { icon: FileText, title: 'Lettre + profil prêt à poster', text: 'Une seule expérience pour générer votre CV, votre lettre et votre export final.' },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/8">
                <item.icon className="h-6 w-6 text-cyan-100" />
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-10 md:py-16">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">Pricing</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">Un tarif simple, conçu pour décrocher plus d’entretiens</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-sm text-slate-300">Plan Gratuit</p>
              <p className="mt-3 text-4xl font-black text-white">0€</p>
              <p className="mt-2 text-sm text-slate-400">Parfait pour tester votre profil et obtenir un premier rendu.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">{['Analyse IA', 'CV + lettre en texte', 'Export simple'].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-200" /> {item}</li>)}</ul>
              <Link href="/dashboard" className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Commencer gratuitement</Link>
            </article>
            <article className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/12 via-slate-900/90 to-emerald-500/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-100">Recommandé</span>
              <p className="mt-3 text-sm text-indigo-100">Plan Premium</p>
              <p className="mt-3 text-4xl font-black text-white">19€<span className="text-base font-medium text-slate-300">/mois</span></p>
              <p className="mt-2 text-sm text-slate-300">Tout le nécessaire pour produire un CV premium et le partager rapidement.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-100">{['Templates LaTeX complets', 'PDF premium 1 clic', 'Historique illimité', 'Export .tex'].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> {item}</li>)}</ul>
              <Link href="/dashboard" className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-emerald-300">Obtenir le Premium</Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950/80 py-8 text-center text-sm text-slate-400">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-200"><Sparkles className="h-4 w-4 text-cyan-100" /> JobCopilot</div>
          <p>© {new Date().getFullYear()} JobCopilot — CV IA, lettre et exports LaTeX premium.</p>
        </div>
      </footer>
    </div>
  );
}
