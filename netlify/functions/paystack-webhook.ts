import type { Handler } from '@netlify/functions';
import { error,json,options,rateLimit } from './_shared/http.js';
import { validPaystackSignature } from './_shared/security.js';
import { supabase } from './_shared/supabase.js';

/** Paystack calls this after payment. It verifies both signature and transaction status. */
export const handler:Handler = async event => {
  if(event.httpMethod==='OPTIONS') return options(event);
  if(event.httpMethod!=='POST') return error(event,405,'METHOD_NOT_ALLOWED','Use POST.');
  if(!rateLimit(event,120)) return error(event,429,'RATE_LIMITED','Too many requests.');
  const raw=event.body || '';
  if(!validPaystackSignature(raw,event.headers['x-paystack-signature'])) return error(event,401,'INVALID_SIGNATURE','Webhook signature is invalid.');
  try {
    const payload=JSON.parse(raw) as {event?:string;data?:{reference?:string;status?:string;amount?:number;metadata?:{order_id?:string}}};
    if(payload.event!=='charge.success' || !payload.data?.reference) return json(event,200,{received:true});
    const verify=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(payload.data.reference)}`,{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`}});
    const verifyText=await verify.text();let transaction:{status:boolean;data?:{status:string;reference:string;amount:number;metadata?:{order_id?:string}}}={status:false};try{transaction=verifyText?JSON.parse(verifyText) as typeof transaction:transaction;}catch{}
    if(!verify.ok || !transaction.status || transaction.data?.status!=='success') return error(event,400,'UNVERIFIED_PAYMENT','Paystack could not verify this payment.');
    const db=supabase();const {data:order,error:dbError}=await db.from('orders').select('id,status,total').eq('payment_reference',transaction.data.reference).maybeSingle();
    if(dbError) throw dbError;if(!order) return error(event,404,'ORDER_NOT_FOUND','Order was not found.');
    if(order.status==='paid' || order.status==='preparing' || order.status==='delivered') return json(event,200,{received:true,idempotent:true});
    if(order.status!=='pending' || transaction.data.amount!==order.total) return error(event,400,'PAYMENT_MISMATCH','Payment does not match the order.');
    const {error:updateError}=await db.from('orders').update({status:'paid'}).eq('id',order.id).eq('status','pending');if(updateError) throw updateError;
    // Email needs an SMTP/provider credential, which is intentionally absent from the permitted environment variables.
    // Use a Supabase Database Webhook on UPDATE orders to deliver an owner notification.
    return json(event,200,{received:true});
  } catch(cause) { console.error('paystack webhook:',cause);return error(event,500,'WEBHOOK_FAILED','Unable to process webhook.'); }
};
