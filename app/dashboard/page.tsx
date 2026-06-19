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
import { Sparkles, LogOut, Loader2, Play, AlertCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  // Profile & Status states
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Input states
  const [resumeText, setResumeText] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI Flow states
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const initDashboard = async () => {
      if (!supabase) {
        setErrorMsg('Configuration Supabase introuvable. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre environnement.');
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

        // Fetch subscription status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', authUser.id)
          .eq('status', 'active')
          .maybeSingle();

        setIsPremium(!!subscription);

        // Fetch generations history
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

    // Check payment redirect notifications from URL params
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
            setSuccessMsg("Votre abonnement Premium a été activé avec succès ! Profitez de tous nos modèles de CV.");
            // Re-fetch subscription from DB to confirm
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
      setErrorMsg('Veuillez coller votre CV et l’offre d’emploi (ou son URL).');
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
        throw new Error(parsedData.error || 'Impossible d’analyser l’offre d’emploi.');
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

      // Reset Inputs
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
      console.log('[Dashboard] Checkout FULL response:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Échec de création de la session de paiement MoneyFusion.');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement non reçue. Voir la console pour plus de détails.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de joindre MoneyFusion pour le moment.';
      setErrorMsg(message);
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#0f172a_0%,_#07111f_35%,_#020617_100%)] text-slate-100 min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-300 mb-4" />
        <span className="text-sm text-slate-500 font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
<div className="flex-1 min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a_0%,_#07111f_35%,_#020617_100%)] text-slate-100 flex flex-col relative selection:bg-cyan-400/30 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-emerald-400/8 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">Workspace</p>
              <span className="text-lg font-black tracking-tight text-white">JobCopilot</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right md:block">
              <span className="text-xs font-semibold text-slate-200 block">{user?.email}</span>
              <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isPremium ? 'text-cyan-100' : 'text-slate-400'}`}>
                {isPremium ? 'Premium Account' : 'Free Account'}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Se déconnecter"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 space-y-8">
        
        {/* Status Notifications */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 text-green-200 text-xs rounded-xl p-4">
            <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100">Today’s workflow</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white md:text-3xl">Optimisez votre CV en moins de 2 minutes.</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">Collez votre CV, ajoutez l’offre visée et laissez l’IA produire une version plus impactante et plus lisible par les ATS.</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-xs font-semibold text-emerald-200">AI-assisted resume generation</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Inputs Panel (Left) */}
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
              className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {generateLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Optimisation en cours par l&apos;IA...
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 fill-current" /> Optimiser mon profil pour l&apos;offre
                </>
              )}
            </button>
          </form>

          {/* History Panel (Right) */}
          <div className="lg:col-span-1 space-y-6">
            {!isPremium && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/40 via-slate-900 to-emerald-950/20 border border-cyan-400/20 flex flex-col justify-between items-start space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-cyan-300 animate-pulse" /> Obtenir l&apos;accès Premium
                  </h4>
                  <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                    Générez instantanément vos CVs optimisés avec nos modèles professionnels pour franchir les filtres ATS.
                  </p>
                </div>
                <div className="w-full">
                  <label className="text-xs text-slate-300 mb-1 block">Numéro de téléphone</label>
                  <input
                    type="tel"
                    placeholder="01010101"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg py-2 px-3 text-xs outline-none text-slate-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-cyan-500/20 w-full"
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

        {/* View Results Section */}
        {selectedGeneration && (
          <div className="border-t border-slate-900 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-7 w-7 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Résultats de l&apos;optimisation pour : <span className="text-cyan-200">{selectedGeneration.job_title}</span></h3>
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
  );
}
