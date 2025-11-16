'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, Button } from '@/components/ui';

import { logger } from '@/lib/utils/logger';

export default function EmailVerifiedPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [autoRedirected, setAutoRedirected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Don't run on server side
    if (typeof window === 'undefined' || !isClient) {
      setChecking(false);
      return;
    }

    let isMounted = true;
    let redirectTimeout: NodeJS.Timeout;

    async function checkUser() {
      try {
        // Dynamically import Firebase and Firestore to avoid SSR issues
        const [{ getFirebaseAuth }, { getActiveFocusPlanForUser }] = await Promise.all([
          import('@/lib/firebase/client'),
          import('@/lib/firestore/focusPlans'),
        ]);

        const auth = await getFirebaseAuth();
        const user = auth.currentUser;

        if (user) {
          // Reload user to get latest emailVerified state
          await user.reload();

          if (!isMounted) return;

          if (user.emailVerified) {
            // Auto-redirect verified logged-in users to main app
            setAutoRedirected(true);

            // Check if user has an active plan to determine redirect destination
            try {
              const activePlan = await getActiveFocusPlanForUser(user.uid);
              if (!activePlan) {
                // No plan exists, redirect to onboarding to create one
                router.replace('/onboarding');
              } else {
                // Has plan, redirect to today page
                router.replace('/today');
              }
            } catch (err) {
              logger.error('Error checking active plan:', err);
              // Fallback to today page if plan check fails
              router.replace('/today');
            }
            return;
          }
        }

        // If user is not logged in, auto-redirect to sign-in after a brief moment
        // This streamlines the flow since Firebase already showed the verification message
        if (!user) {
          setAutoRedirected(true);
          redirectTimeout = setTimeout(() => {
            if (isMounted) {
              router.replace('/auth/signin');
            }
          }, 1500); // Brief delay to show the message
        }
      } catch (err) {
        logger.error('Error reloading user after email verification:', err);
        // On error, still redirect to sign-in after a brief delay
        setAutoRedirected(true);
        redirectTimeout = setTimeout(() => {
          if (isMounted) {
            router.replace('/auth/signin');
          }
        }, 1500);
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    checkUser();

    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [router, isClient]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="max-w-md w-full text-center py-10 px-6">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20">
            <svg
              className="h-8 w-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Email verified</h1>
        <p className="mb-6 text-sm text-white/80">
          {autoRedirected
            ? 'Redirecting you...'
            : 'Your email is verified. You can now sign in and start your focus plan.'}
        </p>

        {!autoRedirected && !checking && (
          <div className="space-y-2">
            <Button
              fullWidth
              onClick={() => router.push('/auth/signin')}
            >
              Go to sign in
            </Button>
          </div>
        )}

        {checking && (
          <p className="mt-4 text-xs text-white/60">
            Checking your verification status…
          </p>
        )}

        {autoRedirected && !checking && (
          <p className="mt-4 text-xs text-white/60">
            Taking you to sign in...
          </p>
        )}
      </GlassCard>
    </div>
  );
}

