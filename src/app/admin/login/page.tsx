// src/app/admin/login/page.tsx
'use client';

import React, { useState, Suspense } from 'react'; // Import Suspense
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// This component contains the logic that uses useSearchParams
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams(); // Hook is used here
  // Get the callbackUrl from the query params, default to /admin
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    // Call the signIn function with the 'credentials' provider
    const result = await signIn('credentials', {
      redirect: false, // Prevent default redirect behavior
      username,
      password,
      callbackUrl, // Pass the callbackUrl
    });

    setIsLoading(false);

    if (result?.error) {
      // Handle login errors (e.g., invalid credentials)
      setError('Invalid username or password');
      console.error('Login failed:', result.error);
    } else if (result?.ok) {
      // If login is successful, redirect to the callbackUrl
      router.push(callbackUrl);
    }
  };

  return (
    // The actual form UI
    <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
      <h1 className='mb-6 text-center text-2xl font-bold text-gray-800'>
        Admin Login
      </h1>
      {error && (
        <div className='mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 border border-red-300'>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='username'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Username
          </label>
          <input
            type='text'
            id='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2'
          />
        </div>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2'
          />
        </div>
        <div>
          <button
            type='submit'
            disabled={isLoading}
            className='w-full rounded-md bg-purple-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}

// The Page component now wraps LoginForm with Suspense
export default function LoginPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 px-4'>
      <Suspense
        fallback={<div className='text-center p-8'>Loading login form...</div>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
