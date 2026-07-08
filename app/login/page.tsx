'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

function getAuthErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Une erreur est survenue lors de l\'authentification.';
  }

  const typedError = error as { message?: string; code?: string; status?: number };

  if (typedError.code === 'over_email_send_rate_limit') {
    return 'Le nombre de mails de confirmation a été dépassé. Réessayez dans quelques minutes ou utilisez un autre email.';
  }

  if (typedError.code === 'invalid_login_credentials' || typedError.code === 'invalid_grant') {
    return 'Email ou mot de passe invalide. Vérifiez vos identifiants et réessayez.';
  }

  if (typedError.message) {
    return typedError.message;
  }

  return 'Une erreur est survenue lors de l\'authentification.';
}

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
        if (error) {
          console.error('Supabase signUp error:', error);
          throw error;
        }
        setSuccessMsg("Inscription réussie ! Veuillez vérifier vos e-mails pour valider votre compte.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error('Supabase signIn error:', error);
          throw error;
        }
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-foreground">
              JobCopilot
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {isSignUp ? "Créez votre compte gratuit" : "Connectez-vous à votre espace"}
          </h2>
          <p className="mt-2 text-xs text-muted">
            {isSignUp
              ? "Commencez dès aujourd'hui à optimiser vos candidatures."
              : "Retrouvez vos CVs optimisés et lettres de motivation."}
          </p>
        </div>

        <div className="card p-8 shadow-xl shadow-accent/5">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-2 bg-danger/10 border border-danger/20 text-danger text-xs rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-start gap-2 bg-success/10 border border-success/20 text-success text-xs rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
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

          <div className="mt-8 text-center text-xs text-muted">
            {isSignUp ? (
              <>
                Déjà inscrit ?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-accent-soft font-bold hover:underline cursor-pointer"
                >
                  Connectez-vous
                </button>
              </>
            ) : (
              <>
                Nouveau sur JobCopilot ?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-accent-soft font-bold hover:underline cursor-pointer"
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
