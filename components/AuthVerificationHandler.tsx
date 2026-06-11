'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthVerificationHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code || !supabase) {
      return;
    }

    const verifyCode = async () => {
      setStatus('loading');
      setMessage('Vérification en cours...');
      
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('Votre email a été vérifié avec succès ! Redirection...');
        
        // Clear the code from URL and redirect to dashboard
        setTimeout(() => {
          router.replace('/dashboard');
          router.refresh();
        }, 2000);
      } catch (err: unknown) {
        console.error('Verification error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Erreur lors de la vérification.');
      }
    };

    verifyCode();
  }, [searchParams, supabase, router]);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100]">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'loading' && <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-400" />}
          {status === 'error' && <AlertCircle className="h-10 w-10 text-red-400" />}
          
          <p className={`text-sm font-medium ${
            status === 'success' ? 'text-emerald-200' : 
            status === 'error' ? 'text-red-200' : 'text-slate-200'
          }`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
