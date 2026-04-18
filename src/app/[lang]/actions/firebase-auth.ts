'use server';

import { cookies } from 'next/headers';
import { adminAuth } from '@/utils/firebase/admin';

// Cookie name (Firebase thường dùng __session trên Firebase Hosting, nhưng ta có thể đặt tùy ý)
const SESSION_COOKIE_NAME = 'firebase_token';

export async function setSession(idToken: string) {
  try {
    console.log('--- Setting Session Cookie ---');
    const cookieStore = await cookies();
    
    cookieStore.set(SESSION_COOKIE_NAME, idToken, {
      maxAge: 60 * 60 * 24 * 5,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    console.log('Session cookie set successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to set session cookie:', error);
    return { success: false, error: 'Failed to set session' };
  }
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const decodedToken = await adminAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

import { redirect } from 'next/navigation';

export async function signOutAction(lang: string) {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect(`/${lang}/login`);
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    await adminAuth().getUserByEmail(email);
    return true;
  } catch (error) {
    return false;
  }
}
