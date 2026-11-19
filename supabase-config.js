import { createClient } from "https://esm.sh";

const SUPABASE_URL = "https://eorhwykgthcjhhwoeirf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E69Aq41T_I_-kLj5XTEG3g_XlcQA1S1";

export const isSupabaseConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
