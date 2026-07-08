'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Generation } from '@/types';
import type { User } from '@supabase/supabase-js';
import ResumeUploader from '@/components/dashboard/resume-uploader';
import JobInput from '@/components/dashboard/job-input';
import OptimizationViewer from '@/components/dashboard/optimization-viewer';
import HistoryList from '@/components/dashboard/history-list';
import Link from 'next/link';
import { Sparkles, LogOut, Loader2, Play, AlertCircle, CheckCircle, LayoutDashboard, FileText, Settings, ChevronLeft } from 'lucide-react';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Mes CVs', active: false },
  { icon: Settings, label: 'Paramètres', active: false },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  const [resumeText, setResumeText] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      if (!supabase) {
        setErrorMsg('Configuration Supabase introuvable.');
        setLoading(false);
        return;
      }

      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/login');
          return;
        }
        setUser(authUser);

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', authUser.id)
          .eq('status', 'active')
          .maybeSingle();

        setIsPremium(!!subscription);

        const { data: historyData } = await supabase
          .from('generations')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (historyData) {
          setGenerations(historyData);
          if (historyData.length > 0) {
            setSelectedGeneration(historyData[0]);
          }
        }
      } catch (err) {
        console.error("Erreur d'initialisation du tableau de bord:", err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');
    
    const verifyPayment = async () => {
      if (token && supabase) {
        try {
          const response = await fetch('/api/moneyfusion/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const data = await response.json();
          
          if (data.success) {
            setSuccessMsg("Votre abonnement Premium a été activé avec succès !");
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', authUser.id)
                .eq('status', 'active')
                .maybeSingle();
              setIsPremium(!!subscription);
            }
            router.replace('/dashboard');
          } else {
            setSuccessMsg("Votre paiement est en cours de vérification, merci de patienter...");
          }
        } catch (err) {
          console.error("Payment verification failed:", err);
        }
      }
    };

    verifyPayment();
  }, [router, supabase]);

  const handleSignOut = async () => {
    if (!supabase) {
      router.push('/login');
      return;
    }

    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !jobOffer.trim()) {
      setErrorMsg('Veuillez coller votre CV et l\'offre d\'emploi (ou son URL).');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setGenerateLoading(true);

    try {
      const parsedResponse = await fetch('/api/parse-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerTextOrUrl: jobOffer }),
      });

      const parsedData = await parsedResponse.json();
      if (!parsedResponse.ok) {
        throw new Error(parsedData.error || 'Impossible d\'analyser l\'offre d\'emploi.');
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalResumeText: resumeText,
          jobTitle: parsedData.jobTitle,
          jobDescription: parsedData.jobDescription,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Une erreur est survenue lors de l'optimisation.");
      }

      const newGen: Generation = resData.data;
      setGenerations([newGen, ...generations]);
      setSelectedGeneration(newGen);
      setSuccessMsg("Votre CV a été optimisé par l'IA avec succès !");
      setJobOffer('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur inconnue est survenue.';
      setErrorMsg(message);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!phoneNumber.trim()) {
      setErrorMsg('Veuillez entrer votre numéro de téléphone.');
      return;
    }

    setUpgradeLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/moneyfusion/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Échec de création de la session de paiement.');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non reçue.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de joindre MoneyFusion pour le moment.';
      setErrorMsg(message);
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-foreground min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-accent-soft mb-4" />
        <span className="text-sm text-muted font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent/30">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-surface transition-all duration-200 hidden md:flex flex-col`}>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </Link>
          {!sidebarCollapsed && <span className="font-black tracking-tight">JobCopilot</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                link.active
                  ? 'bg-accent/10 text-accent-soft'
                  : 'text-muted hover:text-foreground hover:bg-surface-alt/50'
              }`}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && link.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-alt/50 transition-all"
          >
            <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && 'Réduire'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass-strong px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu indicator */}
              <div className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">Workspace</p>
                <span className="text-base font-black tracking-tight">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden rounded-xl border border-border bg-surface px-4 py-2 md:block">
                <span className="text-xs font-semibold text-foreground block">{user?.email}</span>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isPremium ? 'text-accent-soft' : 'text-muted'}`}>
                  {isPremium ? 'Premium' : 'Gratuit'}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-foreground hover:border-accent/30 transition-all"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {errorMsg && (
            <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 text-danger text-xs rounded-xl p-4">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 bg-success/10 border border-success/20 text-success text-xs rounded-xl p-4">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Workflow Header */}
          <section className="card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-soft">Today&apos;s workflow</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black md:text-3xl">Optimisez votre CV en moins de 2 minutes.</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">Collez votre CV, ajoutez l&apos;offre visée et laissez l&apos;IA produire une version plus impactante et plus lisible par les ATS.</p>
              </div>
              <span className="rounded-full border border-accent/20 bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent-soft shrink-0">AI-assisted resume generation</span>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Panel - Inputs */}
            <form onSubmit={handleGenerate} className="lg:col-span-2 space-y-6">
              <ResumeUploader
                resumeText={resumeText}
                setResumeText={setResumeText}
              />

              <JobInput
                jobOffer={jobOffer}
                setJobOffer={setJobOffer}
              />

              <button
                type="submit"
                disabled={generateLoading}
                className="btn-primary w-full py-4 text-sm"
              >
                {generateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Optimisation en cours par l&apos;IA...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" /> Optimiser mon profil pour l&apos;offre
                  </>
                )}
              </button>
            </form>

            {/* Right Panel - History & Upgrade */}
            <div className="lg:col-span-1 space-y-6">
              {!isPremium && (
                <div className="card p-6 border-accent/20 bg-accent-subtle/30 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-accent-soft" /> Obtenir l&apos;accès Premium
                    </h4>
                    <p className="text-xs text-muted mt-1.5 leading-relaxed">
                      Générez instantanément vos CVs optimisés avec nos modèles professionnels.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Numéro de téléphone</label>
                    <input
                      type="tel"
                      placeholder="01010101"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                    className="btn-primary w-full text-xs"
                  >
                    {upgradeLoading ? 'Chargement...' : 'Débloquer pour 19€/mois'}
                  </button>
                </div>
              )}

              <HistoryList
                generations={generations}
                onSelect={(gen) => setSelectedGeneration(gen)}
                selectedId={selectedGeneration?.id}
              />
            </div>

          </div>

          {/* Results Section */}
          {selectedGeneration && (
            <div className="border-t border-border pt-10 mt-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-7 w-7 bg-accent/10 rounded-lg flex items-center justify-center text-accent-soft">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Résultats pour : <span className="text-accent-soft">{selectedGeneration.job_title}</span></h3>
              </div>

              <OptimizationViewer
                data={selectedGeneration.optimized_data}
                isPremium={isPremium}
                onUpgrade={handleUpgrade}
                upgradeLoading={upgradeLoading}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
