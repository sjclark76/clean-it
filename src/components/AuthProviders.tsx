// src/components/AuthProviders.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider as JotaiProvider } from 'jotai'; // Import Jotai Provider
import React from 'react';

interface AuthProvidersProps {
  children: React.ReactNode;
}

export default function AuthProviders({ children }: AuthProvidersProps) {
  return (
    <SessionProvider>
      <JotaiProvider>{children}</JotaiProvider>
    </SessionProvider>
  );
}
