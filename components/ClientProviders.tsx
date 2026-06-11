'use client';

import AuthVerificationHandler from './AuthVerificationHandler';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthVerificationHandler />
      {children}
    </>
  );
}
