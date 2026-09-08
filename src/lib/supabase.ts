import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side client (dung trong API routes)
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface CanvasFile {
  id: string;
  title: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
