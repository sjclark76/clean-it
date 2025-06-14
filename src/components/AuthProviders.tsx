// src/components/AuthProviders.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface AuthProvidersProps {
  children: React.ReactNode;
}

export default function AuthProviders({ children }: AuthProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
