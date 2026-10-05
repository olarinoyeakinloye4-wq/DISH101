import { createClient } from '@supabase/supabase-js';

function required(name:string):string { const value=process.env[name]; if(!value) throw new Error(`Missing required environment variable: ${name}`); return value; }
export const supabase = () => createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_KEY'),{auth:{autoRefreshToken:false,persistSession:false}});
export const adminEmail = () => required('ADMIN_EMAIL').trim().toLowerCase();
