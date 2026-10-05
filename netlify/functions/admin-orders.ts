import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { error,json,options,rateLimit } from './_shared/http.js';
import { requireAdmin } from './_shared/security.js';
import { supabase } from './_shared/supabase.js';
const statusSchema=z.object({id:z.string().uuid(),status:z.enum(['pending','paid','preparing','delivered','cancelled'])});
export const handler:Handler = async event => {
  if(event.httpMethod==='OPTIONS') return options(event);if(!rateLimit(event,60)) return error(event,429,'RATE_LIMITED','Too many requests.');
  const auth=await requireAdmin(event);if('response' in auth && auth.response)return auth.response;const db=supabase();
  try {if(event.httpMethod==='GET'){const {data,error:dbError}=await db.from('orders').select('*').order('created_at',{ascending:false}).limit(200);if(dbError)throw dbError;return json(event,200,{data});}
    if(event.httpMethod==='PATCH'){const parsed=statusSchema.safeParse(JSON.parse(event.body||'{}'));if(!parsed.success)return error(event,400,'INVALID_REQUEST',parsed.error.issues[0]?.message||'Invalid request.');const {data,error:dbError}=await db.from('orders').update({status:parsed.data.status}).eq('id',parsed.data.id).select().single();if(dbError)throw dbError;return json(event,200,{data});}
    return error(event,405,'METHOD_NOT_ALLOWED','Use GET or PATCH.');
  } catch(cause){console.error('admin orders:',cause);return error(event,500,'ORDERS_FAILED','Unable to process orders.');}
};
