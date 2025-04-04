import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) {}
        },
        async remove(name, options) {
          try {
            (await cookieStore).set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );
};
