import { createBrowserClient } from "@supabase/ssr";

const supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.");
  }

  // Create a new instance to avoid state sharing in Vercel Fluid compute
  // but keep backward compatibility with direct imports
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

// Export for backward compatibility with existing direct imports
// Note: This should ideally be replaced with createClient() calls
export const supabase = createClient();
