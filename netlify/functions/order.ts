import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { error,json,options,rateLimit } from './_shared/http.js';
import { clean } from './_shared/security.js';
import { supabase } from './_shared/supabase.js';
import type { MenuItem,OrderItem } from './_shared/types.js';

const orderSchema=z.object({
  items:z.array(z.object({id:z.string().uuid(),quantity:z.number().int().min(1).max(20)})).min(1).max(30),
  customer:z.object({name:z.string().min(2).max(80).transform(clean),phone:z.string().min(7).max(20).transform(value=>clean(value).replace(/[^+\d]/g,'')),address:z.string().min(8).max(250).transform(clean)})
});
export const handler:Handler = async event => {
  if(event.httpMethod==='OPTIONS') return options(event);
  if(event.httpMethod!=='POST') return error(event,405,'METHOD_NOT_ALLOWED','Use POST.');
  if(!rateLimit(event,10,60_000)) return error(event,429,'RATE_LIMITED','Try again in a minute.');
  try {
    const parsed=orderSchema.safeParse(JSON.parse(event.body || '{}'));
    if(!parsed.success) return error(event,400,'INVALID_ORDER',parsed.error.issues[0]?.message || 'Invalid order.');
    const input=parsed.data, ids=[...new Set(input.items.map(item=>item.id))];
    const db=supabase(); const {data:menu,error:menuError}=await db.from('menu_items').select('*').in('id',ids).eq('available',true);
    if(menuError) throw menuError;
    const lookup=new Map((menu as MenuItem[]).map(item=>[item.id,item]));
    if(lookup.size!==ids.length) return error(event,400,'UNAVAILABLE_ITEM','One or more items are unavailable.');
    const items:OrderItem[]=input.items.map(line=>{const item=lookup.get(line.id)!;return {id:item.id,name:item.name,quantity:line.quantity,unit_price:item.price,line_total:item.price*line.quantity};});
    const total=items.reduce((sum,item)=>sum+item.line_total,0);
    const reference=`D101-${Date.now()}-${crypto.randomUUID().slice(0,8)}`;
    const {data:order,error:orderError}=await db.from('orders').insert({customer_name:input.customer.name,phone:input.customer.phone,address:input.customer.address,items,total,status:'pending',payment_reference:reference}).select('id').single();
    if(orderError) throw orderError;
    const protocol=event.headers['x-forwarded-proto'] || 'http';
    const origin=event.headers.origin || `${protocol}://${event.headers.host}`;
    const callbackUrl=new URL('/payment-success.html',origin);
    callbackUrl.searchParams.set('reference',reference);
    const paymentResponse=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,'Content-Type':'application/json'},body:JSON.stringify({email:`${input.customer.phone.replace(/\D/g,'') || 'customer'}@dish101.order`,amount:total,currency:'NGN',reference,callback_url:callbackUrl.toString(),channels:['card','bank_transfer','ussd'],metadata:{order_id:order.id,description:'Dish101 order',restaurant_whatsapp:process.env.RESTAURANT_WHATSAPP,customer:input.customer,items,custom_fields:[{display_name:'Order',variable_name:'dish101_order',value:'Dish101 order'}]}})});
    const paymentText=await paymentResponse.text();let payment:{status:boolean;message?:string;data?:{authorization_url:string}}={status:false};try{payment=paymentText?JSON.parse(paymentText) as typeof payment:payment;}catch{}
    if(!paymentResponse.ok || !payment.status || !payment.data?.authorization_url){await db.from('orders').delete().eq('id',order.id).eq('status','pending');return error(event,502,'PAYMENT_UNAVAILABLE','Unable to initialize payment.');}
    return json(event,201,{data:{orderId:order.id,reference,authorization_url:payment.data.authorization_url}});
  } catch(cause) { console.error('order:',cause); return error(event,500,'ORDER_FAILED','Unable to create this order.'); }
};
