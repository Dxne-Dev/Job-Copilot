'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!supabase) {
      setErrorMsg('Configuration Supabase introuvable. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre environnement.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        setSuccessMsg("Inscription réussie ! Veuillez vérifier vos e-mails pour valider votre compte.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue lors de l'authentification.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#0f172a_0%,_#07111f_25%,_#020617_100%)] text-slate-100 px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
              JobCopilot
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-slate-200">
            {isSignUp ? "Créez votre compte gratuit" : "Connectez-vous à votre espace"}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            {isSignUp
              ? "Commencez dès aujourd'hui à optimiser vos candidatures."
              : "Retrouvez vos CVs optimisés et lettres de motivation."}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-start gap-2 bg-green-500/10 border border-green-500/20 text-green-200 text-xs rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-green-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nom Complet
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-semibold py-3 rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authentification en cours...
                </>
              ) : isSignUp ? (
                "Créer mon compte"
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            {isSignUp ? (
              <>
                Déjà inscrit ?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-cyan-200 font-bold hover:underline"
                >
                  Connectez-vous
                </button>
              </>
            ) : (
              <>
                Nouveau sur JobCopilot ?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-cyan-200 font-bold hover:underline"
                >
                  Créez un compte gratuitement
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
