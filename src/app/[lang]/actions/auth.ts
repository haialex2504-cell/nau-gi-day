'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Setup Supabase admin client for secure operations like user enumeration
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function signOut(lang: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}/login`);
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      // Fallback, pretend it might exist or fail gracefully
      return false;
    }

    // This is somewhat inefficient for huge user bases, but fine for MVP
    // A better way is using an RPC or edge function in Supabase.
    // For simple apps, this is totally fine.
    const exists = users.users.find(u => u.email === email) !== undefined;
    
    return exists;
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
}
