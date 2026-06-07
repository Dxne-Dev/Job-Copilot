'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Generation, UserProfile } from '@/types';
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
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Input states
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // UI Flow states
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const initDashboard = async () => {
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
    if (query.get('payment_success')) {
      setSuccessMsg("Votre abonnement Premium a été activé avec succès ! Profitez des templates LaTeX.");
      // Clean query string
      router.replace('/dashboard');
    }
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !jobTitle || !jobDescription) {
      setErrorMsg("Veuillez remplir tous les champs (CV, Titre, Description).");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setGenerateLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalResumeText: resumeText,
          jobTitle,
          jobDescription,
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
      setJobTitle('');
      setJobDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur inconnue est survenue.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de création de la session Stripe.");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de joindre Stripe pour le moment.");
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100 min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <span className="text-sm text-slate-500 font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen flex flex-col relative selection:bg-indigo-500 overflow-x-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </Link>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            JobCopilot
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-350">{user?.email}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isPremium ? 'text-indigo-400' : 'text-slate-555'}`}>
              {isPremium ? 'Premium Account' : 'Free Account'}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="h-8 w-8 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        
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

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Inputs Panel (Left) */}
          <form onSubmit={handleGenerate} className="lg:col-span-2 space-y-6">
            <ResumeUploader
              resumeText={resumeText}
              setResumeText={setResumeText}
            />

            <JobInput
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
            />

            <button
              type="submit"
              disabled={generateLoading}
              className="w-full bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-600 hover:to-violet-650 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {generateLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Optimisation en cours par l'IA...
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 fill-current" /> Optimiser mon profil pour l'offre
                </>
              )}
            </button>
          </form>

          {/* History Panel (Right) */}
          <div className="lg:col-span-1 space-y-6">
            {!isPremium && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-indigo-950/20 border border-indigo-500/20 flex flex-col justify-between items-start space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" /> Obtenir l'accès Premium
                  </h4>
                  <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                    Compilez instantanément vos CVs optimisés avec notre bibliothèque LaTeX professionnelle pour franchir les ATS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/10"
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
              <div className="h-7 w-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Résultats de l'optimisation pour : <span className="text-indigo-400">{selectedGeneration.job_title}</span></h3>
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
