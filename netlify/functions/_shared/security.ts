import { createHmac, timingSafeEqual } from 'node:crypto';
import type { HandlerEvent } from '@netlify/functions';
import { error } from './http.js';
import { adminEmail, supabase } from './supabase.js';

export const clean = (value:string) => value.trim().replace(/[<>]/g,'').replace(/\s+/g,' ');
export async function requireAdmin(event:HandlerEvent) {
  const token=event.headers.authorization?.replace(/^Bearer\s+/i,'');
  if(!token) return {response:error(event,401,'UNAUTHORIZED','A bearer token is required.')};
  const {data,error:authError}=await supabase().auth.getUser(token);
  if(authError || !data.user || data.user.email?.toLowerCase()!==adminEmail()) return {response:error(event,403,'FORBIDDEN','Admin access is required.')};
  return {user:data.user};
}
export function validPaystackSignature(raw:string,signature:string|undefined):boolean {
  if(!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const digest=createHmac('sha512',process.env.PAYSTACK_SECRET_KEY).update(raw).digest('hex');
  return digest.length===signature.length && timingSafeEqual(Buffer.from(digest),Buffer.from(signature));
}
