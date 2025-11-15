import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint provides Firebase config to the client
  // Server-side env vars are available at runtime in Cloudflare
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  // Only return config if we have the essential values
  if (!config.apiKey || !config.projectId) {
    return NextResponse.json(
      { error: 'Firebase configuration not available' },
      { status: 500 }
    );
  }

  return NextResponse.json(config);
}

