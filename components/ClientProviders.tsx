'use client';

import { Suspense } from 'react';
import AuthVerificationHandler from './AuthVerificationHandler';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthVerificationHandler />
      </Suspense>
      {children}
    </>
  );
}
