// lib/db.js

import { createClient } from "@supabase/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
export const db = createClient(supabaseUrl, supabaseKey);