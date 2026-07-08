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

    let isMounted = true;

    const verifyCode = async () => {
      setStatus('loading');
      setMessage('Vérification en cours...');
      
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }

        if (isMounted) {
          setStatus('success');
          setMessage('Votre email a été vérifié avec succès ! Redirection...');
          
          setTimeout(() => {
            router.replace('/dashboard');
            router.refresh();
          }, 2000);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Verification error:', err);
          setStatus('error');
          setMessage(err instanceof Error ? err.message : 'Erreur lors de la vérification.');
        }
      }
    };

    verifyCode();

    return () => {
      isMounted = false;
    };
  }, [searchParams, supabase, router]);

  if (status === 'idle') {
    return null;
  }

  return (
    <div key="auth-verification-modal" className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100]">
      <div className="card p-6 max-w-md w-full mx-4 shadow-2xl shadow-accent/10">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'loading' && <Loader2 className="h-10 w-10 text-accent-soft animate-spin" />}
          {status === 'success' && <CheckCircle2 className="h-10 w-10 text-success" />}
          {status === 'error' && <AlertCircle className="h-10 w-10 text-danger" />}
          
          <p className={`text-sm font-medium ${
            status === 'success' ? 'text-success' : 
            status === 'error' ? 'text-danger' : 'text-foreground'
          }`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
