import Link from 'next/link';
import { ArrowRight, BadgeCheck, Check, Cpu, FileText, Layers, Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/30 overflow-x-hidden">
      <header className="sticky top-0 z-50 glass-strong">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/20">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-black tracking-tight text-foreground">JobCopilot</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-muted hover:text-foreground transition-colors md:block">Connexion</Link>
            <Link href="/dashboard" className="btn-primary text-sm">
              Commencer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6">
        <section className="grid items-center gap-16 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">
              AI resume optimizer
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
              Passez les filtres ATS avec un CV qui convertit.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
              Transformez votre CV et votre lettre de motivation avec une expérience IA claire, rapide et premium, pensée pour gagner des entretiens.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Link href="/dashboard" className="btn-primary text-sm px-8 py-4">
                Optimiser mon CV <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#pricing" className="btn-ghost text-sm px-8 py-4">
                Voir les offres
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted md:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success-subtle px-3 py-1.5">
                <BadgeCheck className="h-4 w-4 text-success" /> 94% score ATS
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-3 py-1.5">
                <Zap className="h-4 w-4 text-accent-soft" /> Génération en 1 clic
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-3 py-1.5">
                <TrendingUp className="h-4 w-4 text-accent-soft" /> Résultats professionnels
              </span>
            </div>
          </div>

          <div className="card p-5 shadow-xl shadow-accent/5">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-accent-soft">Dashboard preview</p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">CV optimisé</h2>
                </div>
                <span className="rounded-full bg-success-subtle px-3 py-1 text-xs font-semibold text-success">+18% interviews</span>
              </div>
              <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <article className="rounded-xl border border-border bg-surface-alt/50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">Source</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 rounded-full bg-surface-alt" />
                    <div className="h-3 w-3/4 rounded-full bg-surface-alt" />
                    <div className="h-3 w-5/6 rounded-full bg-surface-alt" />
                  </div>
                  <div className="mt-4 rounded-xl border border-dashed border-border bg-background/50 p-4 text-center text-xs text-muted">PDF / TXT / Copie collée</div>
                </article>
                <article className="rounded-xl border border-accent/20 bg-accent-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-accent-soft">Impact</p>
                  <div className="mt-3 space-y-3 text-sm text-foreground">
                    <div className="rounded-xl border border-accent/10 bg-surface p-3">Mots-clés ATS intégrés • leadership • product • roadmap</div>
                    <div className="rounded-xl border border-accent/10 bg-surface p-3">Lettre de motivation 300–400 mots • ton professionnel</div>
                    <div className="rounded-xl border border-accent/10 bg-surface p-3">Export PDF Professionnel prêt à envoyer</div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="impact" className="grid gap-4 py-8 md:grid-cols-3">
          {[
            ['1 min', 'de setup pour obtenir un résultat exploitable'],
            ['94%', 'score ATS estimé sur les profils optimisés'],
            ['3 formats', 'CV, lettre, export PDF Haute Qualité'],
          ].map(([value, label]) => (
            <article key={value} className="card card-hover p-6 transition-all">
              <p className="text-3xl font-black text-accent-soft">{value}</p>
              <p className="mt-2 text-sm text-muted">{label}</p>
            </article>
          ))}
        </section>

        <section id="features" className="py-16 md:py-20">
          <div className="mb-10 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-soft">Why it feels premium</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Une interface claire, rapide et pensée pour la conversion</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Cpu, title: 'Analyse IA ultra ciblée', text: 'Mots-clés ATS, ton d\'écriture, impact business et structure rationalisée.' },
              { icon: Layers, title: 'Modèles de CV premium', text: 'Sorties nettes, lisibles et adaptées aux systèmes de recrutement modernes.' },
              { icon: FileText, title: 'Lettre + profil prêt à poster', text: 'Une seule expérience pour générer votre CV, votre lettre et votre export final.' },
            ].map((item) => (
              <article key={item.title} className="card card-hover p-6 transition-all group">
                <item.icon className="h-6 w-6 text-accent-soft group-hover:text-accent transition-colors" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-16 md:py-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-soft">Pricing</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Un tarif simple, conçu pour décrocher plus d&apos;entretiens</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            <article className="card p-8">
              <p className="text-sm text-muted">Plan Gratuit</p>
              <p className="mt-3 text-4xl font-black text-foreground">0€</p>
              <p className="mt-2 text-sm text-muted">Parfait pour tester votre profil et obtenir un premier rendu.</p>
              <ul className="mt-6 space-y-3 text-sm text-muted">{['Analyse IA', 'CV + lettre en texte', 'Export simple'].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-soft" /> {item}</li>)}</ul>
              <Link href="/dashboard" className="btn-ghost mt-8 w-full">Commencer gratuitement</Link>
            </article>
            <article className="card p-8 border-accent/30 bg-accent-subtle/50 relative">
              <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Recommandé</span>
              <p className="text-sm text-accent-soft">Plan Premium</p>
              <p className="mt-3 text-4xl font-black text-foreground">19€<span className="text-base font-medium text-muted">/mois</span></p>
              <p className="mt-2 text-sm text-muted">Tout le nécessaire pour produire un CV premium et le partager rapidement.</p>
              <ul className="mt-6 space-y-3 text-sm text-foreground">{['Modèles de CV professionnels', 'PDF premium 1 clic', 'Historique illimité', 'Format d\'édition (.tex)'].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {item}</li>)}</ul>
              <Link href="/dashboard" className="btn-primary mt-8 w-full">Obtenir le Premium</Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface/50 py-8 text-center text-sm text-muted">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
          <div className="flex items-center gap-2 font-semibold text-foreground"><Sparkles className="h-4 w-4 text-accent-soft" /> JobCopilot</div>
          <p>© {new Date().getFullYear()} JobCopilot — CV IA, lettre et exports PDF premium.</p>
        </div>
      </footer>
    </div>
  );
}
