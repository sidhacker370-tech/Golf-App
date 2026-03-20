import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Return a dummy-safe client if not configured
  if (!url || url === "your_supabase_url_here" || !key || key === "your_supabase_anon_key_here") {
    // Return a client with a placeholder URL to prevent crash
    // The app will show auth errors but won't crash
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient(url, key);
}
