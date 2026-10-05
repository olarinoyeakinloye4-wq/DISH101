import type { Handler } from '@netlify/functions';
import { error,json,options,rateLimit } from './_shared/http.js';
import { supabase } from './_shared/supabase.js';

export const handler:Handler = async event => {
  if(event.httpMethod==='OPTIONS') return options(event);
  if(event.httpMethod!=='GET') return error(event,405,'METHOD_NOT_ALLOWED','Use GET.');
  if(!rateLimit(event,30)) return error(event,429,'RATE_LIMITED','Too many requests.');
  const reference=event.queryStringParameters?.reference;
  if(!reference?.startsWith('D101-')) return error(event,400,'INVALID_REFERENCE','A valid payment reference is required.');
  try {
    const verify=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`}});
    const text=await verify.text();let payment:{status?:boolean;data?:{status?:string;amount?:number;reference?:string}}={};try{payment=text?JSON.parse(text) as typeof payment:payment;}catch{}
    if(!verify.ok || !payment.status || payment.data?.status!=='success') return error(event,402,'PAYMENT_NOT_SUCCESSFUL','Payment was not successful.');
    const db=supabase();const {data:order,error:lookupError}=await db.from('orders').select('id,status,total').eq('payment_reference',reference).maybeSingle();
    if(lookupError) throw lookupError;if(!order) return error(event,404,'ORDER_NOT_FOUND','Order was not found.');
    if(payment.data.amount!==order.total) return error(event,400,'PAYMENT_MISMATCH','Payment does not match the order.');
    if(order.status==='pending'){const {error:updateError}=await db.from('orders').update({status:'paid'}).eq('id',order.id).eq('status','pending');if(updateError) throw updateError;}
    return json(event,200,{data:{reference,status:'paid'}});
  } catch(cause) { console.error('verify payment:',cause);return error(event,500,'VERIFY_FAILED','Unable to verify payment.'); }
};
