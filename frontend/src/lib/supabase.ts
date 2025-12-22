import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://atdeevjzdnlawbduarpo.supabase.co";
const supabaseKey = "sb_publishable_b4U97TgkTycEGbqezccwJQ_jpUfQK85";

export const supabase = createClient(supabaseUrl, supabaseKey);
